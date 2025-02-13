'use server'

import { z } from 'zod'
import { startupSignUpSchema, serviceProviderSignUpSchema } from '@/lib/validations/auth'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Startup from '@/models/Startup'
import ServiceProvider from '@/models/ServiceProvider'
import mongoose from 'mongoose'
import crypto from 'crypto'

// Function to generate random alphanumeric ID
function generateAuthProviderId(length: number = 24): string {
  return crypto.randomBytes(length)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, length);
}

export async function registerStartup(data: z.infer<typeof startupSignUpSchema>) {
  try {
    console.log('Connecting to database...')
    await connectDB()
    
    // Ensure database connection is established
    if (!mongoose.connection.db) {
      throw new Error('Database connection not established')
    }
    console.log('Connected to database')

    // Start a session for transaction
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      // Check if user already exists
      console.log('Checking for existing user...')
      const existingUser = await User.findOne({ email: data.email }).session(session)
      if (existingUser) {
        throw new Error('User already exists')
      }
      console.log('No existing user found')

      // Create user using Mongoose model
      console.log('Creating user...')
      const user = await User.create([{
        email: data.email,
        password: data.password, // Will be hashed by the pre-save middleware
        userType: 'startup',
        authProvider: 'local',
        authProviderId: generateAuthProviderId(),
        isEmailVerified: false,
      }], { session })
      
      const userId = user[0]._id
      console.log('User created:', userId)

      // Create startup using Mongoose model
      console.log('Creating startup profile...')
      const startup = await Startup.create([{
        userId: userId,
        startupName: data.startupName,
        contactName: data.contactName,
        contactNumber: data.contactNumber,
      }], { session })
      
      console.log('Startup profile created:', startup[0]._id)

      // Commit the transaction
      await session.commitTransaction()
      console.log('Transaction committed successfully')

      return { success: true }
    } catch (error) {
      // If an error occurred, abort the transaction
      await session.abortTransaction()
      throw error
    } finally {
      // End the session
      session.endSession()
    }
  } catch (error: any) {
    console.error('Registration error:', error)
    return { error: error.message }
  }
}

export async function registerServiceProvider(data: z.infer<typeof serviceProviderSignUpSchema>) {
  try {
    console.log('Connecting to database...')
    await connectDB()
    
    // Ensure database connection is established
    if (!mongoose.connection.db) {
      throw new Error('Database connection not established')
    }
    console.log('Connected to database')

    // Start a session for transaction
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      // Check if user already exists
      console.log('Checking for existing user...')
      const existingUser = await User.findOne({ email: data.email }).session(session)
      if (existingUser) {
        throw new Error('User already exists')
      }
      console.log('No existing user found')

      // Create user using Mongoose model
      console.log('Creating user...')
      const user = await User.create([{
        email: data.email,
        password: data.password, // Will be hashed by the pre-save middleware
        userType: 'Service Provider',
        authProvider: 'local',
        authProviderId: generateAuthProviderId(),
        isEmailVerified: false,
      }], { session })
      
      const userId = user[0]._id
      console.log('User created:', userId)

      // Create service provider using Mongoose model
      console.log('Creating service provider profile...')
      const serviceProvider = await ServiceProvider.create([{
        userId: userId,
        serviceProviderType: data.serviceProviderType,
        serviceName: data.serviceName,
        address: data.address,
        city: data.city,
        stateProvince: data.stateProvince,
        zipPostalCode: data.zipPostalCode,
        primaryContact1Name: data.primaryContact1Name,
        primaryContact1Designation: data.primaryContact1Designation,
        primaryContactNumber: data.primaryContactNumber,
        primaryEmailId: data.email,
        features: [],
        ...(data.contact2Name && { contact2Name: data.contact2Name }),
        ...(data.contact2Designation && { contact2Designation: data.contact2Designation }),
        ...(data.alternateContactNumber && { alternateContactNumber: data.alternateContactNumber }),
        ...(data.alternateEmailId && { alternateEmailId: data.alternateEmailId }),
        ...(data.websiteUrl && { websiteUrl: data.websiteUrl }),
      }], { session })
      
      console.log('Service provider profile created:', serviceProvider[0]._id)

      // Commit the transaction
      await session.commitTransaction()
      console.log('Transaction committed successfully')

      return { success: true }
    } catch (error) {
      // If an error occurred, abort the transaction
      await session.abortTransaction()
      throw error
    } finally {
      // End the session
      session.endSession()
    }
  } catch (error: any) {
    console.error('Registration error:', error)
    return { error: error.message }
  }
} 