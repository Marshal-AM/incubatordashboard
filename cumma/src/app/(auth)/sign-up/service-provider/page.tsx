"use client"

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

import { Input } from '@/components/ui/input'
import { LoadingButton } from '@/components/ui/loading-button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { serviceProviderSignUpSchema } from '@/lib/validations/auth'
import { registerServiceProvider } from '@/lib/actions/auth'

type FormData = z.infer<typeof serviceProviderSignUpSchema>

export default function ServiceProviderSignUp() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(serviceProviderSignUpSchema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      const result = await registerServiceProvider(data)
      
      if (result.error) {
        throw new Error(result.error)
      }

      // Sign in the user
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (signInResult?.error) {
        throw new Error(signInResult.error)
      }

      // Redirect to dashboard
      router.push('/service-provider/dashboard')
    } catch (error) {
      console.error('Registration error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Complete Your Service Provider Profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please provide all the required information to complete your profile
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Input
            {...register('email')}
            type="email"
            placeholder="Email *"
            className="h-12"
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Input
            {...register('password')}
            type="password"
            placeholder="Password *"
            className="h-12"
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Input
            {...register('serviceName')}
            type="text"
            placeholder="Service Name *"
            className="h-12"
          />
          {errors.serviceName && (
            <p className="text-sm text-destructive">{errors.serviceName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Service Provider Type *</label>
          <Select onValueChange={(value) => setValue('serviceProviderType', value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
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
            <p className="text-sm text-destructive">{errors.serviceProviderType.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Input
            {...register('address')}
            type="text"
            placeholder="Address *"
            className="h-12"
          />
          {errors.address && (
            <p className="text-sm text-destructive">{errors.address.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Input
              {...register('city')}
              type="text"
              placeholder="City *"
              className="h-12"
            />
            {errors.city && (
              <p className="text-sm text-destructive">{errors.city.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Input
              {...register('stateProvince')}
              type="text"
              placeholder="State/Province *"
              className="h-12"
            />
            {errors.stateProvince && (
              <p className="text-sm text-destructive">{errors.stateProvince.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Input
              {...register('zipPostalCode')}
              type="text"
              placeholder="ZIP/Postal Code *"
              className="h-12"
            />
            {errors.zipPostalCode && (
              <p className="text-sm text-destructive">{errors.zipPostalCode.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Input
              {...register('primaryContact1Name')}
              type="text"
              placeholder="Primary Contact Name *"
              className="h-12"
            />
            {errors.primaryContact1Name && (
              <p className="text-sm text-destructive">{errors.primaryContact1Name.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Input
            {...register('primaryContact1Designation')}
            type="text"
            placeholder="Primary Contact Designation *"
            className="h-12"
          />
          {errors.primaryContact1Designation && (
            <p className="text-sm text-destructive">{errors.primaryContact1Designation.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Input
            {...register('primaryContactNumber')}
            type="tel"
            placeholder="Primary Contact Number *"
            className="h-12"
          />
          {errors.primaryContactNumber && (
            <p className="text-sm text-destructive">{errors.primaryContactNumber.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Input
            {...register('contact2Name')}
            type="text"
            placeholder="Secondary Contact Name (Optional)"
            className="h-12"
          />
          {errors.contact2Name && (
            <p className="text-sm text-destructive">{errors.contact2Name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Input
            {...register('contact2Designation')}
            type="text"
            placeholder="Secondary Contact Designation (Optional)"
            className="h-12"
          />
          {errors.contact2Designation && (
            <p className="text-sm text-destructive">{errors.contact2Designation.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Input
            {...register('alternateContactNumber')}
            type="tel"
            placeholder="Alternate Contact Number (Optional)"
            className="h-12"
          />
          {errors.alternateContactNumber && (
            <p className="text-sm text-destructive">{errors.alternateContactNumber.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Input
            {...register('alternateEmailId')}
            type="email"
            placeholder="Alternate Email ID (Optional)"
            className="h-12"
          />
          {errors.alternateEmailId && (
            <p className="text-sm text-destructive">{errors.alternateEmailId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Input
            {...register('websiteUrl')}
            type="url"
            placeholder="Website URL (Optional)"
            className="h-12"
          />
          {errors.websiteUrl && (
            <p className="text-sm text-destructive">{errors.websiteUrl.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="terms"
          onCheckedChange={(checked) => {
            if (checked) setValue('terms', true)
          }}
        />
        <label
          htmlFor="terms"
          className="text-sm text-muted-foreground"
        >
          By Signing up, you agree to our terms of service and policy.
        </label>
      </div>
      {errors.terms && (
        <p className="text-sm text-destructive">{errors.terms.message}</p>
      )}

      <LoadingButton type="submit" className="w-full h-12" loading={isSubmitting}>
        Create Account <span className="ml-2">→</span>
      </LoadingButton>

      <div className="text-center text-sm">
        Already have an account?{' '}
        <Link href="/sign-in" className="font-medium text-primary hover:underline">
          Go to Sign in
        </Link>
      </div>
    </form>
  )
} 