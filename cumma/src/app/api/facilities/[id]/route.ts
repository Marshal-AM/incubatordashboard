import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Extract the ID from params
    const id = params.id
    if (!id || typeof id !== 'string') {
      return new NextResponse('Invalid facility ID', { status: 400 })
    }

    const { db } = await connectToDatabase()
    const serviceProviderId = new ObjectId(session.user.id)
    const facilityId = new ObjectId(id)

    const facility = await db.collection('Facilities').findOne({
      _id: facilityId,
      serviceProviderId,
    })

    if (!facility) {
      return new NextResponse('Facility not found', { status: 404 })
    }

    return NextResponse.json(facility)
  } catch (error) {
    console.error('Error in GET /api/facilities/[id]:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { db } = await connectToDatabase()
    const serviceProviderId = new ObjectId(session.user.id)
    const facilityId = new ObjectId(params.id)

    const result = await db.collection('Facilities').deleteOne({
      _id: facilityId,
      serviceProviderId,
    })

    if (result.deletedCount === 0) {
      return new NextResponse('Facility not found', { status: 404 })
    }

    return new NextResponse('Facility deleted successfully')
  } catch (error) {
    console.error('Error in DELETE /api/facilities/[id]:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { db } = await connectToDatabase()
    const serviceProviderId = new ObjectId(session.user.id)
    const facilityId = new ObjectId(params.id)

    const result = await db.collection('Facilities').updateOne(
      {
        _id: facilityId,
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
    console.error('Error in PATCH /api/facilities/[id]:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 