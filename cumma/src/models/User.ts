import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format'],
  },
  password: {
    type: String,
    minlength: [8, 'Password must be at least 8 characters'],
    default: null,
  },
  userType: {
    type: String,
    enum: ['startup', 'Service Provider'],
    required: [true, 'User type is required'],
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'facebook', 'apple'],
    required: [true, 'Auth provider is required'],
    default: 'local',
  },
  authProviderId: {
    type: String,
    default: null,
  },
  isEmailVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
}, {
  collection: 'Users'
})

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string) {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw error
  }
}

// Update timestamps on save
userSchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

// Export with exact collection name
export default mongoose.models['Users'] || mongoose.model('Users', userSchema, 'Users') 