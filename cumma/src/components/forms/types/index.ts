import { z } from 'zod'

export const RENTAL_PLANS = ['Annual', 'Monthly', 'Weekly', 'One Day (24 Hours)'] as const

export interface RentalPlan {
  name: typeof RENTAL_PLANS[number]
  price: number
  duration: typeof RENTAL_PLANS[number]
}

export type FacilityType = 
  | 'individual-cabin'
  | 'coworking-spaces'
  | 'meeting-rooms'
  | 'bio-allied-labs'
  | 'manufacturing-labs'
  | 'prototyping-labs'
  | 'software'
  | 'saas-allied'
  | 'raw-space-office'
  | 'raw-space-lab'

export interface BaseFormFields {
  name: string
  description: string
  images: string[]
  videoLink?: string
  rentalPlans: RentalPlan[]
  subscriptionPlans?: RentalPlan[]
  rentPerYear?: number
  rentPerMonth?: number
  rentPerWeek?: number
  dayPassRent?: number
}

export interface LabEquipment {
  labName: string
  equipmentName: string
  capacityAndMake: string
}

export interface SoftwareEquipment {
  softwareName: string
  version: string
}

export interface SaasEquipment {
  equipmentName: string
  capacityAndMake: string
}

export interface AreaDetails {
  area: number
  type: 'Covered' | 'Uncovered'
  furnishing: 'Furnished' | 'Not Furnished'
  customisation: 'Open to Customisation' | 'Cannot be Customised'
}

export interface IndividualCabinFields extends BaseFormFields {
  totalCabins: number
  availableCabins: number
}

export interface CoworkingSpaceFields extends BaseFormFields {
  totalSeats: number
  availableSeats: number
}

export interface MeetingRoomFields extends BaseFormFields {
  totalRooms: number
  seatingCapacity: number
  totalTrainingRoomSeaters: number
}

export interface LabFields extends BaseFormFields {
  equipment: LabEquipment[]
}

export interface SoftwareFields extends BaseFormFields {
  equipment: SoftwareEquipment[]
}

export interface SaasFields extends BaseFormFields {
  equipment: SaasEquipment[]
}

export interface RawSpaceOfficeFields extends BaseFormFields {
  areaDetails: AreaDetails[]
}

export interface RawSpaceLabFields extends BaseFormFields {
  areaDetails: AreaDetails[]
}

export type FormData = 
  | IndividualCabinFields
  | CoworkingSpaceFields
  | MeetingRoomFields
  | LabFields
  | SoftwareFields
  | SaasFields
  | RawSpaceOfficeFields
  | RawSpaceLabFields

export interface FacilityFormProps {
  onSubmit: (data: FormData) => void
  onChange?: () => void
  initialData?: any
} 