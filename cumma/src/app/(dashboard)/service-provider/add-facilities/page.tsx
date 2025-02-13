'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
  Building2,
  Users,
  VideoIcon,
  Microscope,
  MonitorPlay,
  LayoutDashboard,
  ChevronRight,
} from 'lucide-react'
import { FacilityForm } from '@/components/forms/facility-form'
import type { FacilityType } from '@/components/forms/facility-form'
import { toast } from 'sonner'

const facilityTypes: Array<{
  id: FacilityType
  name: string
  icon: any
  description: string
}> = [
  {
    id: 'individual-cabin',
    name: 'Individual Cabin',
    icon: Building2,
    description: 'Private office spaces for focused work',
  },
  {
    id: 'coworking-spaces',
    name: 'Coworking Spaces',
    icon: Users,
    description: 'Shared workspace for collaboration',
  },
  {
    id: 'meeting-rooms',
    name: 'Meeting/Board Rooms',
    icon: VideoIcon,
    description: 'Conference and training facilities',
  },
  {
    id: 'bio-allied-labs',
    name: 'Bio & Allied Labs',
    icon: Microscope,
    description: 'Specialized bio and allied science laboratories',
  },
  {
    id: 'manufacturing-labs',
    name: 'Manufacturing Labs',
    icon: Microscope,
    description: 'Advanced manufacturing facilities',
  },
  {
    id: 'prototyping-labs',
    name: 'Prototyping Labs',
    icon: Microscope,
    description: 'Rapid prototyping and development facilities',
  },
  {
    id: 'software',
    name: 'Specialized Softwares',
    icon: MonitorPlay,
    description: 'Professional software solutions',
  },
  {
    id: 'saas-allied',
    name: 'Saas & Allied Facilities',
    icon: MonitorPlay,
    description: 'Software as a Service and related solutions',
  },
  {
    id: 'raw-space-office',
    name: 'Raw Space (Office)',
    icon: LayoutDashboard,
    description: 'Customizable office space for your needs',
  },
  {
    id: 'raw-space-lab',
    name: 'Raw Space (Lab)',
    icon: LayoutDashboard,
    description: 'Customizable laboratory space for your needs',
  },
]

export default function AddFacilities() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<FacilityType | null>(null)
  const [hasFormChanges, setHasFormChanges] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredTypes = facilityTypes.filter(type =>
    type.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleTypeChange = (newType: FacilityType) => {
    // If there are unsaved changes and user is switching to a different type
    if (hasFormChanges && selectedType !== newType) {
      const confirmed = window.confirm(
        'You have unsaved changes in the current form. Switching to a different facility type will clear all entered data. Are you sure you want to proceed?'
      )
      if (!confirmed) {
        return
      }
    }
    setSelectedType(newType)
    setHasFormChanges(false)
  }

  const handleSubmit = async (data: any) => {
    console.log('Main component - handleSubmit called')
    if (!selectedType) {
      console.log('No facility type selected')
      toast.error('Please select a facility type')
      return
    }

    setIsSubmitting(true)
    try {
      // Log the complete data being submitted
      const submissionData = {
        type: selectedType,
        ...data
      }
      console.log('Main component - Submitting facility data:', submissionData)
      
      const response = await fetch('/api/facilities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      })

      console.log('Main component - Response status:', response.status)
      const result = await response.json()
      console.log('Main component - Response data:', result)
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit facility for approval')
      }

      // Show success message
      toast.success('Facility submitted for approval successfully')
      
      // Reset form state
      setHasFormChanges(false)
      // Clear selected type to show facility type selection
      setSelectedType(null)
      
      return result
    } catch (error) {
      console.error('Main component - Error submitting facility:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit facility for approval')
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFormChange = () => {
    setHasFormChanges(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Add New Facilities</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We are glad to see you again
        </p>
      </div>

      {/* Search Input */}
      <div className="max-w-md">
        <Input
          type="text"
          placeholder="Facility Title"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-12"
        />
      </div>

      {/* Facility Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleTypeChange(type.id)}
            className={cn(
              'flex items-start gap-4 p-4 rounded-lg border transition-all duration-200',
              selectedType === type.id
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-gray-200 bg-white hover:border-primary/50 hover:shadow-sm'
            )}
            disabled={isSubmitting}
          >
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <type.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-medium">{type.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {type.description}
              </p>
            </div>
            <ChevronRight className={cn(
              'h-5 w-5 text-gray-400 transition-transform',
              selectedType === type.id && 'transform rotate-90'
            )} />
          </button>
        ))}
      </div>

      {/* Dynamic Form */}
      {selectedType && (
        <div className="mt-8 p-6 bg-white rounded-lg border">
          <FacilityForm 
            type={selectedType} 
            onSubmit={handleSubmit} 
            onChange={handleFormChange}
          />
        </div>
      )}
    </div>
  )
} 