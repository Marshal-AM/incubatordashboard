'use client'

import { FacilityType, FormData } from './types'
import { IndividualCabinForm } from './facility-types/individual-cabin'
import { CoworkingSpacesForm } from './facility-types/coworking-spaces'
import { MeetingRoomsForm } from './facility-types/meeting-rooms'
import { BioAlliedLabsForm } from './facility-types/bio-allied-labs'
import { ManufacturingLabsForm } from './facility-types/manufacturing-labs'
import { PrototypingLabsForm } from './facility-types/prototyping-labs'
import { SoftwareForm } from './facility-types/software'
import { SaasAlliedForm } from './facility-types/saas-allied'
import { RawSpaceOfficeForm } from './facility-types/raw-space-office'
import { RawSpaceLabForm } from './facility-types/raw-space-lab'

interface FacilityFormProps {
  type: FacilityType
  onSubmit: (data: FormData) => void
  onChange?: () => void
  initialData?: any
}

export function FacilityForm({ type, onSubmit, onChange, initialData }: FacilityFormProps) {
  // Log the initial data for debugging
  console.log('FacilityForm initialData:', initialData)

  switch (type) {
    case 'individual-cabin':
      return <IndividualCabinForm onSubmit={onSubmit} onChange={onChange} initialData={initialData} />
    case 'coworking-spaces':
      return <CoworkingSpacesForm onSubmit={onSubmit} onChange={onChange} initialData={initialData} />
    case 'meeting-rooms':
      return <MeetingRoomsForm onSubmit={onSubmit} onChange={onChange} initialData={initialData} />
    case 'bio-allied-labs':
      return <BioAlliedLabsForm onSubmit={onSubmit} onChange={onChange} initialData={initialData} />
    case 'manufacturing-labs':
      return <ManufacturingLabsForm onSubmit={onSubmit} onChange={onChange} initialData={initialData} />
    case 'prototyping-labs':
      return <PrototypingLabsForm onSubmit={onSubmit} onChange={onChange} initialData={initialData} />
    case 'software':
      return <SoftwareForm onSubmit={onSubmit} onChange={onChange} initialData={initialData} />
    case 'saas-allied':
      return <SaasAlliedForm onSubmit={onSubmit} onChange={onChange} initialData={initialData} />
    case 'raw-space-office':
      return <RawSpaceOfficeForm onSubmit={onSubmit} onChange={onChange} initialData={initialData} />
    case 'raw-space-lab':
      return <RawSpaceLabForm onSubmit={onSubmit} onChange={onChange} initialData={initialData} />
    // Add other form types here as they are implemented
    default:
      return <div>Form type not implemented: {type}</div>
  }
} 