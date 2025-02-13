import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Startup from '@/models/Startup'
import ServiceProvider from '@/models/ServiceProvider'

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const data = await req.json()
    await connectDB()

    // Update user type
    await User.findOneAndUpdate(
      { email: session.user.email },
      { userType: data.userType }
    )

    // Create profile based on user type
    if (data.userType === 'startup') {
      await Startup.create({
        userId: session.user.id,
        startupName: data.startupName,
        contactName: data.contactName,
        contactNumber: data.contactNumber,
      })
    } else {
      await ServiceProvider.create({
        userId: session.user.id,
        serviceProviderType: data.serviceProviderType,
        serviceProviderName: data.serviceProviderName,
        address: data.address,
        city: data.city,
        stateProvince: data.stateProvince,
        zipPostalCode: data.zipPostalCode,
        primaryContactName: data.primaryContactName,
        primaryContactDesignation: data.primaryContactDesignation,
        primaryContactNumber: data.primaryContactNumber,
        primaryEmailId: session.user.email,
        features: [],
        ...(data.contact2Name && { contact2Name: data.contact2Name }),
        ...(data.contact2Designation && { contact2Designation: data.contact2Designation }),
        ...(data.alternateContactNumber && { alternateContactNumber: data.alternateContactNumber }),
        ...(data.alternateEmailId && { alternateEmailId: data.alternateEmailId }),
        ...(data.websiteUrl && { websiteUrl: data.websiteUrl }),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Profile completion error:', error)
    return new NextResponse(error.message, { status: 500 })
  }
} 