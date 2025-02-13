'use server'

import { getServerSession } from 'next-auth'
import connectDB from '@/lib/db'
import ServiceProvider from '@/models/ServiceProvider'
import { z } from 'zod'
import mongoose from 'mongoose'
import { authOptions } from '@/lib/auth'

const profileSchema = z.object({
  serviceProviderType: z.enum([
    'Incubator',
    'Accelerator',
    'Institution/University',
    'Private Coworking Space',
    'Community Space',
    'Cafe'
  ]),
  serviceName: z.string(),
  address: z.string(),
  city: z.string(),
  stateProvince: z.string(),
  zipPostalCode: z.string(),
  primaryContact1Name: z.string(),
  primaryContact1Designation: z.string(),
  primaryContactNumber: z.string(),
  contact2Name: z.string().optional(),
  contact2Designation: z.string().optional(),
  alternateContactNumber: z.string().optional(),
  alternateEmailId: z.string().optional(),
  websiteUrl: z.string().optional(),
  logoUrl: z.string().optional(),
})

type ServiceProviderProfile = z.infer<typeof profileSchema>

interface ServiceProviderDocument {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  serviceProviderType: string
  serviceName: string
  address: string
  city: string
  stateProvince: string
  zipPostalCode: string
  primaryContact1Name: string
  primaryContact1Designation: string
  primaryContactNumber: string
  contact2Name?: string
  contact2Designation?: string
  alternateContactNumber?: string
  alternateEmailId?: string
  websiteUrl?: string
  logoUrl?: string
  createdAt: Date
  updatedAt: Date
  __v: number
}

export async function getServiceProviderProfile() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new Error('Not authenticated')
    }

    await connectDB()

    const profile = await ServiceProvider.findOne({ 
      userId: new mongoose.Types.ObjectId(session.user.id)
    })
      .select('-__v')
      .lean() as ServiceProviderDocument

    if (!profile) {
      throw new Error('Profile not found')
    }

    // Transform MongoDB document to match our schema
    const transformedProfile: ServiceProviderProfile = {
      serviceProviderType: profile.serviceProviderType as ServiceProviderProfile['serviceProviderType'],
      serviceName: profile.serviceName,
      address: profile.address,
      city: profile.city,
      stateProvince: profile.stateProvince,
      zipPostalCode: profile.zipPostalCode,
      primaryContact1Name: profile.primaryContact1Name,
      primaryContact1Designation: profile.primaryContact1Designation,
      primaryContactNumber: profile.primaryContactNumber,
      contact2Name: profile.contact2Name,
      contact2Designation: profile.contact2Designation,
      alternateContactNumber: profile.alternateContactNumber,
      alternateEmailId: profile.alternateEmailId,
      websiteUrl: profile.websiteUrl,
      logoUrl: profile.logoUrl,
    }

    return {
      success: true,
      data: transformedProfile
    }
  } catch (error: any) {
    console.error('Error fetching profile:', error)
    return { error: error.message }
  }
}

export async function updateServiceProviderProfile(data: ServiceProviderProfile) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new Error('Not authenticated')
    }

    await connectDB()

    const updatedProfile = await ServiceProvider.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(session.user.id) },
      { 
        ...data,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-__v').lean() as ServiceProviderDocument

    if (!updatedProfile) {
      throw new Error('Profile not found')
    }

    // Transform MongoDB document to match our schema
    const transformedProfile: ServiceProviderProfile = {
      serviceProviderType: updatedProfile.serviceProviderType as ServiceProviderProfile['serviceProviderType'],
      serviceName: updatedProfile.serviceName,
      address: updatedProfile.address,
      city: updatedProfile.city,
      stateProvince: updatedProfile.stateProvince,
      zipPostalCode: updatedProfile.zipPostalCode,
      primaryContact1Name: updatedProfile.primaryContact1Name,
      primaryContact1Designation: updatedProfile.primaryContact1Designation,
      primaryContactNumber: updatedProfile.primaryContactNumber,
      contact2Name: updatedProfile.contact2Name,
      contact2Designation: updatedProfile.contact2Designation,
      alternateContactNumber: updatedProfile.alternateContactNumber,
      alternateEmailId: updatedProfile.alternateEmailId,
      websiteUrl: updatedProfile.websiteUrl,
      logoUrl: updatedProfile.logoUrl,
    }

    return {
      success: true,
      data: transformedProfile
    }
  } catch (error: any) {
    console.error('Error updating profile:', error)
    return { error: error.message }
  }
} 