import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { authOptions } from '@/lib/auth'

const validityMap = {
  "Annual": 365 * 24 * 60 * 60 * 1000,
  "Monthly": 30 * 24 * 60 * 60 * 1000,
  "Weekly": 7 * 24 * 60 * 60 * 1000,
  "One Day (24 Hours)": 24 * 60 * 60 * 1000
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { db } = await connectToDatabase()
    const serviceProviderId = new ObjectId(session.user.id)

    // Get all facilities for this service provider
    const facilities = await db.collection('Facilities')
      .find({ serviceProviderId, status: 'active' })
      .toArray()

    const facilityIds = facilities.map(f => f._id)

    // Get all approved bookings for these facilities with startup details
    const bookings = await db.collection('bookings').aggregate([
      {
        $match: {
          status: 'approved',
          facilityId: { $in: facilityIds }
        }
      },
      {
        $lookup: {
          from: 'startups',
          localField: 'startupId',
          foreignField: '_id',
          as: 'startup'
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
      {
        $match: {
          'startup': { $ne: [] },
          'facility': { $ne: [] }
        }
      },
      {
        $unwind: '$facility'
      },
      {
        $unwind: '$startup'
      },
      {
        $project: {
          startupDetails: {
            logoUrl: { $ifNull: ['$startup.logoUrl', '/placeholder-logo.png'] },
            startupName: '$startup.startupName'
          },
          facilityType: '$facility.facilityType',
          bookedOn: '$updatedAt',
          rentalPlan: 1,
          amount: 1
        }
      },
      {
        $sort: { bookedOn: -1 }
      }
    ]).toArray()

    console.log('Found bookings:', bookings.length)

    // Calculate validity for each booking
    const bookingsWithValidity = bookings.map(booking => {
      const validityDuration = validityMap[booking.rentalPlan as keyof typeof validityMap]
      const validityTill = new Date(new Date(booking.bookedOn).getTime() + validityDuration)
      
      return {
        ...booking,
        validityTill: validityTill.toISOString()
      }
    })

    return NextResponse.json(bookingsWithValidity)
  } catch (error) {
    console.error('Error in GET /api/bookings:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 