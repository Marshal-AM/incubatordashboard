'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { ImageUpload } from '@/components/ui/image-upload'
import { RENTAL_PLANS, CoworkingSpaceFields, FacilityFormProps } from '../types'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  videoLink: z.string().optional(),
  selectedRentalPlans: z.array(z.enum(RENTAL_PLANS)).min(1, 'At least one rental plan is required'),
  totalSeats: z.number().min(1, 'Must have at least 1 seat'),
  availableSeats: z.number().min(0),
  rentPerYear: z.number().optional(),
  rentPerMonth: z.number().optional(),
  rentPerWeek: z.number().optional(),
  dayPassRent: z.number().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function CoworkingSpacesForm({ onSubmit, onChange, initialData }: FacilityFormProps) {
  const [images, setImages] = useState<string[]>(initialData?.images || [])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      images: initialData?.images || [],
      videoLink: initialData?.videoLink || '',
      selectedRentalPlans: initialData?.rentalPlans?.map((plan: any) => plan.name) || [],
      totalSeats: initialData?.totalSeats || 0,
      availableSeats: initialData?.availableSeats || 0,
      rentPerYear: initialData?.rentalPlans?.find((plan: any) => plan.name === 'Annual')?.price || undefined,
      rentPerMonth: initialData?.rentalPlans?.find((plan: any) => plan.name === 'Monthly')?.price || undefined,
      rentPerWeek: initialData?.rentalPlans?.find((plan: any) => plan.name === 'Weekly')?.price || undefined,
      dayPassRent: initialData?.rentalPlans?.find((plan: any) => plan.name === 'One Day (24 Hours)')?.price || undefined,
    },
  })

  const selectedRentalPlans = form.watch('selectedRentalPlans') || []

  const handleImageUpload = (newImages: string[]) => {
    setImages(newImages)
    form.setValue('images', newImages)
    onChange?.()
  }

  const handleFormSubmit = async (values: FormValues) => {
    try {
      console.log('Form submission started - Coworking Spaces Form')
      console.log('Form values:', values)
      
      if (images.length === 0) {
        console.log('Validation failed: No images uploaded')
        form.setError('root', {
          type: 'manual',
          message: 'Please upload at least one image'
        })
        return
      }

      if (!values.selectedRentalPlans.length) {
        console.log('Validation failed: No rental plans selected')
        form.setError('root', {
          type: 'manual',
          message: 'Please select at least one rental plan'
        })
        return
      }

      // Check if rent values are provided for selected rental plans
      const rentValidation = values.selectedRentalPlans.every(plan => {
        switch (plan) {
          case 'Annual':
            return !!values.rentPerYear
          case 'Monthly':
            return !!values.rentPerMonth
          case 'Weekly':
            return !!values.rentPerWeek
          case 'One Day (24 Hours)':
            return !!values.dayPassRent
          default:
            return false
        }
      })

      if (!rentValidation) {
        console.log('Validation failed: Missing rent values for selected plans')
        form.setError('root', {
          type: 'manual',
          message: 'Please provide rent values for all selected rental plans'
        })
        return
      }

      // Validate seat counts
      if (values.totalSeats <= 0) {
        console.log('Validation failed: Invalid total seats')
        form.setError('totalSeats', {
          type: 'manual',
          message: 'Total seats must be greater than 0'
        })
        return
      }

      if (values.availableSeats > values.totalSeats) {
        console.log('Validation failed: Available seats exceed total seats')
        form.setError('availableSeats', {
          type: 'manual',
          message: 'Available seats cannot exceed total seats'
        })
        return
      }

      // Prepare final submission data
      const submissionData = {
        type: 'coworking-spaces' as const,
        name: values.name,
        description: values.description,
        images,
        videoLink: values.videoLink || '',
        totalSeats: Number(values.totalSeats),
        availableSeats: Number(values.availableSeats),
        rentalPlans: values.selectedRentalPlans.map(plan => {
          let price = 0;
          switch (plan) {
            case 'Annual':
              price = values.rentPerYear || 0;
              break;
            case 'Monthly':
              price = values.rentPerMonth || 0;
              break;
            case 'Weekly':
              price = values.rentPerWeek || 0;
              break;
            case 'One Day (24 Hours)':
              price = values.dayPassRent || 0;
              break;
          }
          return {
            name: plan,
            price,
            duration: plan
          };
        })
      }

      console.log('Submitting data:', submissionData)
      await onSubmit(submissionData)
      console.log('Form submission successful')
      
      // Reset form state
      form.reset()
      setImages([])
      onChange?.()
    } catch (error) {
      console.error('Form submission error:', error)
      form.setError('root', { 
        type: 'manual',
        message: 'Failed to submit form. Please try again.'
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facility Name *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description *</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="totalSeats"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total No. of Coworking Seaters available *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={0}
                    {...field} 
                    onChange={e => {
                      const value = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value))
                      field.onChange(value)
                    }} 
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="availableSeats"
            render={({ field }) => (
              <FormItem>
                <FormLabel>No. of seats currently available for occupancy *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={0}
                    {...field} 
                    onChange={e => {
                      const value = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value))
                      field.onChange(value)
                    }} 
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormLabel>Kindly upload the photos of your facility *</FormLabel>
          <FormControl>
            <ImageUpload
              value={images}
              onChange={handleImageUpload}
              onRemove={(url) => {
                const newImages = images.filter((image) => image !== url)
                handleImageUpload(newImages)
              }}
            />
          </FormControl>
          {form.formState.errors.root && (
            <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
          )}
        </div>

        <FormField
          control={form.control}
          name="videoLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>If available, kindly attach Video Link for your Facility</FormLabel>
              <FormControl>
                <Input type="url" placeholder="Google Drive / Youtube link" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="selectedRentalPlans"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rental Subscription Plan(s) Available *</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  {RENTAL_PLANS.map((plan) => (
                    <div key={plan} className="flex items-center space-x-2">
                      <Checkbox
                        checked={field.value?.includes(plan)}
                        onCheckedChange={(checked) => {
                          const updatedPlans = checked
                            ? [...(field.value || []), plan]
                            : field.value?.filter((p) => p !== plan) || []
                          field.onChange(updatedPlans)
                          
                          if (!checked) {
                            switch (plan) {
                              case 'Annual':
                                form.setValue('rentPerYear', undefined)
                                break
                              case 'Monthly':
                                form.setValue('rentPerMonth', undefined)
                                break
                              case 'Weekly':
                                form.setValue('rentPerWeek', undefined)
                                break
                              case 'One Day (24 Hours)':
                                form.setValue('dayPassRent', undefined)
                                break
                            }
                          }
                        }}
                      />
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {plan}
                      </label>
                    </div>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {selectedRentalPlans.includes('Annual') && (
            <FormField
              control={form.control}
              name="rentPerYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rent per Year (in Rupees) *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={0}
                      {...field} 
                      onChange={e => {
                        const value = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value))
                        field.onChange(value)
                      }} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {selectedRentalPlans.includes('Monthly') && (
            <FormField
              control={form.control}
              name="rentPerMonth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rent per Month (in Rupees) *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={0}
                      {...field} 
                      onChange={e => {
                        const value = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value))
                        field.onChange(value)
                      }} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {selectedRentalPlans.includes('Weekly') && (
            <FormField
              control={form.control}
              name="rentPerWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rent per Week (in Rupees) *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={0}
                      {...field} 
                      onChange={e => {
                        const value = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value))
                        field.onChange(value)
                      }} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {selectedRentalPlans.includes('One Day (24 Hours)') && (
            <FormField
              control={form.control}
              name="dayPassRent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day Pass Rent (1 Day) (in Rupees) *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={0}
                      {...field} 
                      onChange={e => {
                        const value = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value))
                        field.onChange(value)
                      }} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="w-full md:w-auto bg-primary hover:bg-primary/90"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <span className="mr-2">Submitting...</span>
                <span className="animate-spin">⏳</span>
              </>
            ) : (
              'Submit for Approval'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
} 