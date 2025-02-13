import mongoose from 'mongoose'

const startupSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
  startupName: {
    type: String,
    required: [true, 'Startup name is required'],
    minLength: 1,
  },
  contactName: {
    type: String,
    required: [true, 'Contact name is required'],
    minLength: 1,
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    minLength: 1,
  },
  address: {
    type: String,
    default: null,
  },
  logoUrl: {
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
  collection: 'Startups'
})

// Update timestamps on save
startupSchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

// Export with exact collection name
export default mongoose.models['Startups'] || mongoose.model('Startups', startupSchema, 'Startups') 