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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RENTAL_PLANS, RawSpaceLabFields, FacilityFormProps } from '../types'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  videoLink: z.string().optional(),
  selectedRentalPlans: z.array(z.enum(RENTAL_PLANS)).min(1, 'At least one rental plan is required'),
  areaDetails: z.array(z.object({
    area: z.number().min(1, 'Area must be greater than 0'),
    type: z.enum(['Covered', 'Uncovered']),
    furnishing: z.enum(['Furnished', 'Not Furnished']),
    customisation: z.enum(['Open to Customisation', 'Cannot be Customised']),
  })).min(1, 'At least one area detail is required'),
  rentPerYear: z.number().optional(),
  rentPerMonth: z.number().optional(),
  rentPerWeek: z.number().optional(),
  dayPassRent: z.number().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface AreaDetail {
  area: number
  type: 'Covered' | 'Uncovered'
  furnishing: 'Furnished' | 'Not Furnished'
  customisation: 'Open to Customisation' | 'Cannot be Customised'
}

export function RawSpaceLabForm({ onSubmit, onChange, initialData }: FacilityFormProps) {
  const [images, setImages] = useState<string[]>(initialData?.images || [])
  const [areaDetails, setAreaDetails] = useState<AreaDetail[]>(
    initialData?.areaDetails || [{
      area: 0,
      type: 'Covered',
      furnishing: 'Not Furnished',
      customisation: 'Open to Customisation'
    }]
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      images: initialData?.images || [],
      videoLink: initialData?.videoLink || '',
      selectedRentalPlans: initialData?.rentalPlans?.map((plan: any) => plan.name) || [],
      areaDetails: initialData?.areaDetails || [{
        area: 0,
        type: 'Covered',
        furnishing: 'Not Furnished',
        customisation: 'Open to Customisation'
      }],
      rentPerYear: initialData?.rentalPlans?.find((plan: any) => plan.name === 'Annual')?.price || undefined,
      rentPerMonth: initialData?.rentalPlans?.find((plan: any) => plan.name === 'Monthly')?.price || undefined,
      rentPerWeek: initialData?.rentalPlans?.find((plan: any) => plan.name === 'Weekly')?.price || undefined,
      dayPassRent: initialData?.rentalPlans?.find((plan: any) => plan.name === 'One Day (24 Hours)')?.price || undefined,
    },
  })

  const handleImageUpload = (newImages: string[]) => {
    setImages(newImages)
    form.setValue('images', newImages)
    onChange?.()
  }

  const addAreaDetail = () => {
    setAreaDetails([...areaDetails, {
      area: 0,
      type: 'Covered',
      furnishing: 'Not Furnished',
      customisation: 'Open to Customisation',
    }])
    const currentAreaDetails = form.getValues('areaDetails')
    form.setValue('areaDetails', [...currentAreaDetails, {
      area: 0,
      type: 'Covered',
      furnishing: 'Not Furnished',
      customisation: 'Open to Customisation',
    }])
  }

  const removeAreaDetail = (index: number) => {
    const newAreaDetails = areaDetails.filter((_, i) => i !== index)
    setAreaDetails(newAreaDetails)
    const currentAreaDetails = form.getValues('areaDetails')
    form.setValue('areaDetails', currentAreaDetails.filter((_, i) => i !== index))
  }

  const handleFormSubmit = async (values: FormValues) => {
    try {
      console.log('Form submission started - Raw Space Lab Form')
      console.log('Form values:', values)
      
      if (images.length === 0) {
        console.log('Validation failed: No images uploaded')
        form.setError('root', {
          type: 'manual',
          message: 'Please upload at least one image'
        })
        return
      }

      // Validate area details
      const validAreaDetails = values.areaDetails.filter(area => 
        area.area > 0 && 
        area.type && 
        area.furnishing && 
        area.customisation
      )

      if (validAreaDetails.length === 0) {
        console.log('Validation failed: No valid area details')
        form.setError('root', {
          type: 'manual',
          message: 'Please add at least one area detail with all fields filled'
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

      // Prepare final submission data
      const submissionData = {
        type: 'raw-space-lab',
        name: values.name,
        description: values.description,
        images,
        videoLink: values.videoLink || '',
        areaDetails: validAreaDetails.map(area => ({
          area: Number(area.area),
          type: area.type,
          furnishing: area.furnishing,
          customisation: area.customisation
        })),
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
      setAreaDetails([{
        area: 0,
        type: 'Covered',
        furnishing: 'Not Furnished',
        customisation: 'Open to Customisation'
      }])
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
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="images"
          render={() => (
            <FormItem>
              <FormLabel>Images</FormLabel>
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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="videoLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video Link (Optional)</FormLabel>
              <FormControl>
                <Input {...field} />
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

        {form.watch('selectedRentalPlans')?.includes('Annual') && (
          <FormField
            control={form.control}
            name="rentPerYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Yearly Rent</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {form.watch('selectedRentalPlans')?.includes('Monthly') && (
          <FormField
            control={form.control}
            name="rentPerMonth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Rent</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {form.watch('selectedRentalPlans')?.includes('Weekly') && (
          <FormField
            control={form.control}
            name="rentPerWeek"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weekly Rent</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {form.watch('selectedRentalPlans')?.includes('One Day (24 Hours)') && (
          <FormField
            control={form.control}
            name="dayPassRent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Day Pass Rent</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Area Details</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addAreaDetail}
            >
              Add Area
            </Button>
          </div>
          {areaDetails.map((_, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
              <FormField
                control={form.control}
                name={`areaDetails.${index}.area`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area (sq ft)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`areaDetails.${index}.type`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Covered">Covered</SelectItem>
                        <SelectItem value="Uncovered">Uncovered</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`areaDetails.${index}.furnishing`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Furnishing</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select furnishing" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Furnished">Furnished</SelectItem>
                        <SelectItem value="Not Furnished">Not Furnished</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`areaDetails.${index}.customisation`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customisation</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customisation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Open to Customisation">Open to Customisation</SelectItem>
                        <SelectItem value="Cannot be Customised">Cannot be Customised</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {index > 0 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeAreaDetail(index)}
                  className="mt-2"
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
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