import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/db'
import Facility from '@/models/Facility'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

interface RentalPlan {
  name: string
  price: number
  duration: string
}

interface Equipment {
  labName: string
  equipmentName: string
  capacityAndMake: string
}

interface AreaDetail {
  area: number
  type: 'Covered' | 'Uncovered'
  furnishing: 'Furnished' | 'Not Furnished'
  customisation: 'Open to Customisation' | 'Cannot be Customised'
}

interface BaseFacilityDetails {
  name: string
  description: string
  images: string[]
  videoLink: string
  rentalPlans: RentalPlan[]
}

interface LabFacilityDetails extends BaseFacilityDetails {
  equipment: Equipment[]
}

interface RawSpaceFacilityDetails extends BaseFacilityDetails {
  areaDetails: AreaDetail[]
}

interface SoftwareFacilityDetails extends BaseFacilityDetails {
  equipment: { softwareName: string; version: string }[]
}

interface SaasFacilityDetails extends BaseFacilityDetails {
  equipment: { equipmentName: string; capacityAndMake: string }[]
}

interface IndividualCabinDetails extends BaseFacilityDetails {
  totalCabins: number
  availableCabins: number
}

interface CoworkingSpaceDetails extends BaseFacilityDetails {
  totalSeats: number
  availableSeats: number
}

interface MeetingRoomDetails extends BaseFacilityDetails {
  totalRooms: number
  seatingCapacity: number
  totalTrainingRoomSeaters: number
}

type FacilityDetails = 
  | LabFacilityDetails 
  | RawSpaceFacilityDetails 
  | SoftwareFacilityDetails 
  | SaasFacilityDetails
  | IndividualCabinDetails
  | CoworkingSpaceDetails
  | MeetingRoomDetails

interface FacilityData {
  serviceProviderId: string
  facilityType: string
  status: 'pending' | 'active' | 'rejected'
  details: FacilityDetails
}

export async function POST(req: Request) {
  console.log('API Route - POST /api/facilities called')
  
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await req.json()
    console.log('API Route - Received data:', data)

    console.log('API Route - Connecting to database...')
    await connectDB()
    console.log('API Route - Connected to database')

    // Base facility data structure
    const facilityData: FacilityData = {
      serviceProviderId: session.user.id,
      facilityType: data.type,
      status: 'pending',
      details: {
        name: data.name,
        description: data.description,
        images: data.images || [],
        videoLink: data.videoLink || '',
        rentalPlans: data.rentalPlans.map((plan: RentalPlan) => ({
          name: plan.name,
          price: plan.price,
          duration: plan.duration
        }))
      } as FacilityDetails
    }

    // Add type-specific details
    switch (data.type) {
      case 'bio-allied-labs':
      case 'manufacturing-labs':
      case 'prototyping-labs':
        (facilityData.details as LabFacilityDetails).equipment = data.equipment.map((eq: Equipment) => ({
          labName: eq.labName,
          equipmentName: eq.equipmentName,
          capacityAndMake: eq.capacityAndMake
        }))
        break

      case 'raw-space-office':
      case 'raw-space-lab':
        (facilityData.details as RawSpaceFacilityDetails).areaDetails = data.areaDetails.map((area: AreaDetail) => ({
          area: area.area,
          type: area.type,
          furnishing: area.furnishing,
          customisation: area.customisation
        }))
        break

      case 'software':
        (facilityData.details as SoftwareFacilityDetails).equipment = data.equipment.map((eq: any) => ({
          softwareName: eq.softwareName,
          version: eq.version
        }))
        break

      case 'saas-allied':
        (facilityData.details as SaasFacilityDetails).equipment = data.equipment.map((eq: any) => ({
          equipmentName: eq.equipmentName,
          capacityAndMake: eq.capacityAndMake
        }))
        break

      case 'individual-cabin':
        (facilityData.details as IndividualCabinDetails).totalCabins = data.totalCabins
        ;(facilityData.details as IndividualCabinDetails).availableCabins = data.availableCabins
        break

      case 'coworking-spaces':
        (facilityData.details as CoworkingSpaceDetails).totalSeats = data.totalSeats
        ;(facilityData.details as CoworkingSpaceDetails).availableSeats = data.availableSeats
        break

      case 'meeting-rooms':
        (facilityData.details as MeetingRoomDetails).totalRooms = data.totalRooms
        ;(facilityData.details as MeetingRoomDetails).seatingCapacity = data.seatingCapacity
        ;(facilityData.details as MeetingRoomDetails).totalTrainingRoomSeaters = data.totalTrainingRoomSeaters
        break
    }

    console.log('API Route - Creating facility with data:', JSON.stringify(facilityData, null, 2))
    const facility = await Facility.create(facilityData)

    console.log('API Route - Facility created successfully:', facility._id)
    return NextResponse.json(
      { id: facility._id },
      { status: 201 }
    )

  } catch (error: any) {
    console.error('API Route - Error creating facility:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create facility',
        details: error.errors || {}
      },
      { status: 400 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { db } = await connectToDatabase()
    const serviceProviderId = new ObjectId(session.user.id)

    const facilities = await db.collection('Facilities')
      .find({ serviceProviderId })
      .sort({ updatedAt: -1 })
      .toArray()

    return NextResponse.json(facilities)
  } catch (error) {
    console.error('Error in GET /api/facilities:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const id = request.url.split('/').pop()
    if (!id) {
      return new NextResponse('Facility ID is required', { status: 400 })
    }

    const { db } = await connectToDatabase()
    const serviceProviderId = new ObjectId(session.user.id)

    const result = await db.collection('Facilities').deleteOne({
      _id: new ObjectId(id),
      serviceProviderId,
    })

    if (result.deletedCount === 0) {
      return new NextResponse('Facility not found', { status: 404 })
    }

    return new NextResponse('Facility deleted successfully')
  } catch (error) {
    console.error('Error in DELETE /api/facilities:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const id = request.url.split('/').pop()
    if (!id) {
      return new NextResponse('Facility ID is required', { status: 400 })
    }

    const body = await request.json()
    const { db } = await connectToDatabase()
    const serviceProviderId = new ObjectId(session.user.id)

    const result = await db.collection('Facilities').updateOne(
      {
        _id: new ObjectId(id),
        serviceProviderId,
      },
      {
        $set: {
          details: body,
          status: 'pending', // Change status to pending after edit
          updatedAt: new Date(),
        },
      }
    )

    if (result.matchedCount === 0) {
      return new NextResponse('Facility not found', { status: 404 })
    }

    return new NextResponse('Facility updated successfully')
  } catch (error) {
    console.error('Error in PATCH /api/facilities:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 