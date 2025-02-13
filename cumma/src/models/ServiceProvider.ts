import mongoose from 'mongoose'

const serviceProviderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
  serviceProviderType: {
    type: String,
    enum: [
      'Incubator',
      'Accelerator',
      'Institution/University',
      'Private Coworking Space',
      'Community Space',
      'Cafe'
    ],
    required: [true, 'Service provider type is required'],
  },
  serviceName: {
    type: String,
    required: [true, 'Service name is required'],
    minLength: 1,
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    minLength: 1,
  },
  features: {
    type: [{ type: String }],
    default: [],
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    minLength: 1,
  },
  stateProvince: {
    type: String,
    required: [true, 'State/Province is required'],
    minLength: 1,
  },
  zipPostalCode: {
    type: String,
    required: [true, 'ZIP/Postal Code is required'],
    minLength: 1,
  },
  primaryContact1Name: {
    type: String,
    required: [true, 'Primary contact name is required'],
    minLength: 1,
  },
  primaryContact1Designation: {
    type: String,
    required: [true, 'Primary contact designation is required'],
    minLength: 1,
  },
  contact2Name: {
    type: String,
    default: null,
  },
  contact2Designation: {
    type: String,
    default: null,
  },
  primaryContactNumber: {
    type: String,
    required: [true, 'Primary contact number is required'],
    minLength: 1,
  },
  alternateContactNumber: {
    type: String,
    default: null,
  },
  primaryEmailId: {
    type: String,
    required: [true, 'Primary email is required'],
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format'],
  },
  alternateEmailId: {
    type: String,
    default: null,
    validate: {
      validator: function(v: string | null) {
        if (!v) return true
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v)
      },
      message: 'Invalid alternate email format',
    },
  },
  logoUrl: {
    type: String,
    default: null,
  },
  websiteUrl: {
    type: String,
    default: null,
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
  collection: 'Service Provider'
})

// Update timestamps on save
serviceProviderSchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models['Service Provider'] || mongoose.model('Service Provider', serviceProviderSchema, 'Service Provider') 