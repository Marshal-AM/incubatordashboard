'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

import { Input } from '@/components/ui/input'
import { LoadingButton } from '@/components/ui/loading-button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const startupSchema = z.object({
  startupName: z.string().min(1, 'Startup name is required'),
  contactName: z.string().min(1, 'Contact name is required'),
  contactNumber: z.string().min(1, 'Contact number is required'),
})

const serviceProviderSchema = z.object({
  serviceProviderName: z.string().min(1, 'Service provider name is required'),
  serviceProviderType: z.enum([
    'Incubator',
    'Accelerator',
    'Institution/University',
    'Private Coworking Space',
    'Community Space',
    'Cafe',
  ], {
    required_error: 'Please select a service provider type',
  }),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  stateProvince: z.string().min(1, 'State/Province is required'),
  zipPostalCode: z.string().min(1, 'ZIP/Postal Code is required'),
  primaryContactName: z.string().min(1, 'Primary contact name is required'),
  primaryContactDesignation: z.string().min(1, 'Primary contact designation is required'),
  primaryContactNumber: z.string().min(1, 'Primary contact number is required'),
})

interface OAuthCompletionProps {
  userType: 'startup' | 'Service Provider'
}

export function OAuthCompletion({ userType }: OAuthCompletionProps) {
  const router = useRouter()
  const { data: session, update } = useSession()
  const schema = userType === 'startup' ? startupSchema : serviceProviderSchema

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userType }),
      })

      if (!response.ok) {
        throw new Error('Failed to complete profile')
      }

      // Update session with new user type
      await update({ userType })

      // Redirect to appropriate dashboard
      router.push(userType === 'startup' ? '/startup/dashboard' : '/service-provider/dashboard')
    } catch (error) {
      console.error('Profile completion error:', error)
    }
  }

  if (userType === 'startup') {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Input
            {...register('startupName')}
            placeholder="Startup Name"
            className="h-12"
          />
          {errors.startupName && (
            <p className="text-sm text-destructive">{errors.startupName.message as string}</p>
          )}
        </div>

        <div className="space-y-2">
          <Input
            {...register('contactName')}
            placeholder="Contact Name"
            className="h-12"
          />
          {errors.contactName && (
            <p className="text-sm text-destructive">{errors.contactName.message as string}</p>
          )}
        </div>

        <div className="space-y-2">
          <Input
            {...register('contactNumber')}
            placeholder="Contact Number"
            className="h-12"
          />
          {errors.contactNumber && (
            <p className="text-sm text-destructive">{errors.contactNumber.message as string}</p>
          )}
        </div>

        <LoadingButton type="submit" className="w-full h-12" loading={isSubmitting}>
          Complete Profile
        </LoadingButton>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Input
          {...register('serviceProviderName')}
          placeholder="Service Provider Name"
          className="h-12"
        />
        {errors.serviceProviderName && (
          <p className="text-sm text-destructive">{errors.serviceProviderName.message as string}</p>
        )}
      </div>

      <div className="space-y-2">
        <Select
          onValueChange={(value) => setValue('serviceProviderType', value)}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Select provider type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Incubator">Incubator</SelectItem>
            <SelectItem value="Accelerator">Accelerator</SelectItem>
            <SelectItem value="Institution/University">Institution/University</SelectItem>
            <SelectItem value="Private Coworking Space">Private Coworking Space</SelectItem>
            <SelectItem value="Community Space">Community Space</SelectItem>
            <SelectItem value="Cafe">Cafe</SelectItem>
          </SelectContent>
        </Select>
        {errors.serviceProviderType && (
          <p className="text-sm text-destructive">{errors.serviceProviderType.message as string}</p>
        )}
      </div>

      <div className="space-y-2">
        <Input
          {...register('address')}
          placeholder="Address"
          className="h-12"
        />
        {errors.address && (
          <p className="text-sm text-destructive">{errors.address.message as string}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Input
            {...register('city')}
            placeholder="City"
            className="h-12"
          />
          {errors.city && (
            <p className="text-sm text-destructive">{errors.city.message as string}</p>
          )}
        </div>

        <div className="space-y-2">
          <Input
            {...register('stateProvince')}
            placeholder="State/Province"
            className="h-12"
          />
          {errors.stateProvince && (
            <p className="text-sm text-destructive">{errors.stateProvince.message as string}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Input
          {...register('zipPostalCode')}
          placeholder="ZIP/Postal Code"
          className="h-12"
        />
        {errors.zipPostalCode && (
          <p className="text-sm text-destructive">{errors.zipPostalCode.message as string}</p>
        )}
      </div>

      <div className="space-y-2">
        <Input
          {...register('primaryContactName')}
          placeholder="Primary Contact Name"
          className="h-12"
        />
        {errors.primaryContactName && (
          <p className="text-sm text-destructive">{errors.primaryContactName.message as string}</p>
        )}
      </div>

      <div className="space-y-2">
        <Input
          {...register('primaryContactDesignation')}
          placeholder="Primary Contact Designation"
          className="h-12"
        />
        {errors.primaryContactDesignation && (
          <p className="text-sm text-destructive">{errors.primaryContactDesignation.message as string}</p>
        )}
      </div>

      <div className="space-y-2">
        <Input
          {...register('primaryContactNumber')}
          placeholder="Primary Contact Number"
          className="h-12"
        />
        {errors.primaryContactNumber && (
          <p className="text-sm text-destructive">{errors.primaryContactNumber.message as string}</p>
        )}
      </div>

      <LoadingButton type="submit" className="w-full h-12" loading={isSubmitting}>
        Complete Profile
      </LoadingButton>
    </form>
  )
} 