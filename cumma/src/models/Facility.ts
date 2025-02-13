import mongoose from 'mongoose'

const labEquipmentSchema = new mongoose.Schema({
  labName: { type: String, required: true },
  equipmentName: { type: String, required: true },
  capacityAndMake: { type: String, required: true },
})

const softwareEquipmentSchema = new mongoose.Schema({
  softwareName: { type: String, required: true },
  version: { type: String, required: true },
})

const saasEquipmentSchema = new mongoose.Schema({
  equipmentName: { type: String, required: true },
  capacityAndMake: { type: String, required: true },
})

const areaDetailsSchema = new mongoose.Schema({
  area: { type: Number, required: true },
  type: { type: String, enum: ['Covered', 'Uncovered'], required: true },
  furnishing: { type: String, enum: ['Furnished', 'Not Furnished'], required: true },
  customisation: { type: String, enum: ['Open to Customisation', 'Cannot be Customised'], required: true },
})

const rentalPlanSchema = new mongoose.Schema({
  name: { 
    type: String, 
    enum: ['Annual', 'Monthly', 'Weekly', 'One Day (24 Hours)'],
    required: true 
  },
  price: { type: Number, required: true },
  duration: { 
    type: String, 
    enum: ['Annual', 'Monthly', 'Weekly', 'One Day (24 Hours)'],
    required: true 
  },
})

const baseDetailsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  videoLink: { type: String, default: '' },
  rentalPlans: { 
    type: [rentalPlanSchema], 
    required: true, 
    validate: [(array: unknown[]) => array.length > 0, 'At least one rental plan is required'] 
  },
})

const facilitySchema = new mongoose.Schema({
  serviceProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service Provider',
    required: true,
  },
  facilityType: {
    type: String,
    enum: [
      'individual-cabin',
      'coworking-spaces',
      'meeting-rooms',
      'bio-allied-labs',
      'manufacturing-labs',
      'prototyping-labs',
      'software',
      'saas-allied',
      'raw-space-office',
      'raw-space-lab',
    ],
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'rejected'],
    default: 'pending',
    required: true,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    validate: {
      validator: function(details: any) {
        // Access the document being validated
        const doc = this as any

        // Validate base details
        if (!details.name || !details.description || !Array.isArray(details.images)) {
          return false
        }

        // Validate rental plans
        if (!Array.isArray(details.rentalPlans) || details.rentalPlans.length === 0) {
          return false
        }

        for (const plan of details.rentalPlans) {
          if (!plan.name || !plan.price || !plan.duration) {
            return false
          }
          if (!['Annual', 'Monthly', 'Weekly', 'One Day (24 Hours)'].includes(plan.name)) {
            return false
          }
          if (!['Annual', 'Monthly', 'Weekly', 'One Day (24 Hours)'].includes(plan.duration)) {
            return false
          }
          if (typeof plan.price !== 'number') {
            return false
          }
        }

        // Type-specific validation
        switch (doc.facilityType) {
          case 'individual-cabin':
            return typeof details.totalCabins === 'number' && 
                   typeof details.availableCabins === 'number'

          case 'coworking-spaces':
            return typeof details.totalSeats === 'number' && 
                   typeof details.availableSeats === 'number'

          case 'meeting-rooms':
            return typeof details.totalRooms === 'number' && 
                   typeof details.seatingCapacity === 'number' && 
                   typeof details.totalTrainingRoomSeaters === 'number'

          case 'bio-allied-labs':
          case 'manufacturing-labs':
          case 'prototyping-labs':
            return Array.isArray(details.equipment) && 
                   details.equipment.length > 0 &&
                   details.equipment.every((eq: any) => 
                     eq.labName && eq.equipmentName && eq.capacityAndMake)

          case 'software':
            return Array.isArray(details.equipment) && 
                   details.equipment.length > 0 &&
                   details.equipment.every((eq: any) => 
                     eq.softwareName && eq.version)

          case 'saas-allied':
            return Array.isArray(details.equipment) && 
                   details.equipment.length > 0 &&
                   details.equipment.every((eq: any) => 
                     eq.equipmentName && eq.capacityAndMake)

          case 'raw-space-office':
          case 'raw-space-lab':
            return Array.isArray(details.areaDetails) && 
                   details.areaDetails.length > 0 &&
                   details.areaDetails.every((area: any) => 
                     typeof area.area === 'number' && 
                     ['Covered', 'Uncovered'].includes(area.type) &&
                     ['Furnished', 'Not Furnished'].includes(area.furnishing) &&
                     ['Open to Customisation', 'Cannot be Customised'].includes(area.customisation))

          default:
            return false
        }
      },
      message: 'Invalid facility details for the specified facility type',
    },
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
  collection: 'Facilities'
})

// Update timestamps on save
facilitySchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models['Facilities'] || mongoose.model('Facilities', facilitySchema, 'Facilities') 