import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId, Document } from 'mongodb'

interface Facility extends Document {
  _id: ObjectId
  type: string
}

interface MonthlyData {
  _id: {
    year: number
    month: number
  }
  types: Array<{
    type: string
    count: number
  }>
  amount?: number
  count?: number
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.userType !== 'Service Provider') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { db } = await connectToDatabase()
    const serviceProviderId = new ObjectId(session.user.id)

    // Get total facilities
    const totalFacilities = await db.collection('Facilities').countDocuments({
      serviceProviderId,
      status: 'active'
    })

    // Get facilities added this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const facilitiesThisMonth = await db.collection('Facilities').countDocuments({
      serviceProviderId,
      createdAt: { $gte: startOfMonth },
      status: 'active'
    })

    // Get total bookings and earnings
    const bookingsAggregation = await db.collection('bookings').aggregate([
      {
        $match: {
          status: 'approved',
          facilityId: {
            $in: (await db.collection<Facility>('Facilities')
              .find({ serviceProviderId })
              .project({ _id: 1 })
              .toArray()
            ).map(f => f._id)
          }
        }
      },
      {
        $facet: {
          totalBookings: [{ $count: 'count' }],
          totalEarnings: [{ $group: { _id: null, total: { $sum: '$amount' } } }],
          monthlyBookings: [
            { $match: { updatedAt: { $gte: startOfMonth } } },
            { $count: 'count' }
          ],
          monthlyEarnings: [
            { $match: { updatedAt: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
          ],
          monthlyPayouts: [
            {
              $group: {
                _id: {
                  year: { $year: '$updatedAt' },
                  month: { $month: '$updatedAt' }
                },
                amount: { $sum: '$amount' }
              }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
          ],
          startupsByType: [
            {
              $match: {
                status: 'approved',
                updatedAt: { $gte: new Date(new Date().getFullYear(), 0, 1) } // From start of current year
              }
            },
            {
              $lookup: {
                from: 'Facilities',
                localField: 'facilityId',
                foreignField: '_id',
                as: 'facility'
              }
            },
            { $unwind: '$facility' },
            {
              $match: {
                'facility.serviceProviderId': serviceProviderId
              }
            },
            {
              $group: {
                _id: {
                  year: { $year: '$updatedAt' },
                  month: { $month: '$updatedAt' },
                  facilityType: '$facility.facilityType'
                },
                count: { $sum: 1 }
              }
            },
            {
              $group: {
                _id: {
                  year: '$_id.year',
                  month: '$_id.month'
                },
                types: {
                  $push: {
                    type: '$_id.facilityType',
                    count: '$count'
                  }
                }
              }
            },
            { 
              $sort: { 
                '_id.year': 1, 
                '_id.month': 1 
              } 
            }
          ]
        }
      }
    ]).toArray()

    const [aggregationResult] = bookingsAggregation
    const {
      totalBookings,
      totalEarnings,
      monthlyBookings,
      monthlyEarnings,
      monthlyPayouts,
      startupsByType
    } = aggregationResult

    // Calculate month-over-month growth
    const previousMonth = new Date(startOfMonth)
    previousMonth.setMonth(previousMonth.getMonth() - 1)
    
    const previousMonthEarnings = await db.collection('bookings').aggregate([
      {
        $match: {
          status: 'approved',
          updatedAt: {
            $gte: previousMonth,
            $lt: startOfMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]).toArray()

    const currentMonthEarnings = monthlyEarnings[0]?.total || 0
    const lastMonthEarnings = previousMonthEarnings[0]?.total || 0
    const monthlyComparison = lastMonthEarnings === 0 
      ? 100 
      : ((currentMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100

    // Format monthly data
    const formattedMonthlyPayouts = (monthlyPayouts as MonthlyData[]).map(mp => ({
      month: `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][mp._id.month - 1]} ${mp._id.year.toString().slice(2)}`,
      amount: mp.amount || 0
    }))

    const formattedStartupsByType = (startupsByType as MonthlyData[]).map(st => {
      const monthStr = `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][st._id.month - 1]} ${st._id.year.toString().slice(2)}`
      const result: any = { month: monthStr }
      
      // Initialize all facility types with 0
      st.types.forEach(({ type, count }) => {
        result[type] = count
      })
      
      return result
    })

    return NextResponse.json({
      kpis: {
        totalFacilities,
        thisMonth: facilitiesThisMonth,
        totalBookings: totalBookings[0]?.count || 0,
        monthlyBookings: monthlyBookings[0]?.count || 0,
        totalEarnings: totalEarnings[0]?.total || 0,
        monthlyComparison: Math.round(monthlyComparison)
      },
      monthlyPayouts: formattedMonthlyPayouts,
      startupsByType: formattedStartupsByType
    })
  } catch (error) {
    console.error('Dashboard data fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
} 