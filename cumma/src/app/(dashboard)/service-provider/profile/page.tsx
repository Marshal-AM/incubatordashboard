'use client'

import { useState, useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImageUpload } from '@/components/ui/image-upload'
import { ProfilePicture } from '@/components/ui/profile-picture'
import { useSession } from 'next-auth/react'
import { Pencil, Save } from 'lucide-react'
import { getServiceProviderProfile, updateServiceProviderProfile } from '@/lib/actions/service-provider'
import { toast } from 'sonner'

const profileSchema = z.object({
  serviceProviderType: z.enum([
    'Incubator',
    'Accelerator',
    'Institution/University',
    'Private Coworking Space',
    'Community Space',
    'Cafe'
  ], {
    required_error: "Please select a service provider type",
  }),
  serviceName: z.string().min(1, "Service name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  stateProvince: z.string().min(1, "State/Province is required"),
  zipPostalCode: z.string().min(1, "ZIP/Postal Code is required"),
  primaryContact1Name: z.string().min(1, "Primary contact name is required"),
  primaryContact1Designation: z.string().min(1, "Primary contact designation is required"),
  primaryContactNumber: z.string().min(1, "Primary contact number is required"),
  contact2Name: z.string().optional(),
  contact2Designation: z.string().optional(),
  alternateContactNumber: z.string().optional(),
  alternateEmailId: z.string().email("Please enter a valid email address").optional(),
  websiteUrl: z.string().url("Please enter a valid URL").optional(),
  logoUrl: z.string().optional(),
})

export default function ServiceProviderProfile() {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [logoImages, setLogoImages] = useState<string[]>([])

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const result = await getServiceProviderProfile()
        if (result.error) {
          throw new Error(result.error)
        }

        if (result.data) {
          // Reset form with fetched data
          form.reset(result.data)
          
          // Set logo image if exists
          if (result.data.logoUrl) {
            setLogoImages([result.data.logoUrl])
          }
        }
      } catch (error: any) {
        toast.error('Failed to load profile')
        console.error('Error loading profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [form])

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    try {
      const result = await updateServiceProviderProfile(data)
      
      if (result.error) {
        throw new Error(result.error)
      }

      toast.success('Profile updated successfully')
      setIsEditing(false)
    } catch (error: any) {
      toast.error('Failed to update profile')
      console.error('Error updating profile:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Profile</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your profile information
          </p>
        </div>
        <Button
          variant={isEditing ? "outline" : "default"}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (
            <>
              <Pencil className="h-4 w-4 mr-2" /> Cancel
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" /> Edit Profile
            </>
          )}
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Profile Picture */}
            <div className="flex flex-col items-center space-y-4">
              <FormLabel>Service Provider Logo</FormLabel>
              <ProfilePicture
                imageUrl={form.watch('logoUrl')}
                size={160}
                isEditing={isEditing}
                onImageChange={(urls) => {
                  setLogoImages(urls)
                  form.setValue('logoUrl', urls[0])
                }}
                onImageRemove={() => {
                  setLogoImages([])
                  form.setValue('logoUrl', '')
                }}
                className="mx-auto"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Service Provider Type */}
              <FormField
                control={form.control}
                name="serviceProviderType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Provider Type</FormLabel>
                    <Select
                      disabled={!isEditing}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Incubator">Incubator</SelectItem>
                        <SelectItem value="Accelerator">Accelerator</SelectItem>
                        <SelectItem value="Institution/University">Institution/University</SelectItem>
                        <SelectItem value="Private Coworking Space">Private Coworking Space</SelectItem>
                        <SelectItem value="Community Space">Community Space</SelectItem>
                        <SelectItem value="Cafe">Cafe</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Service Name */}
              <FormField
                control={form.control}
                name="serviceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Name</FormLabel>
                    <FormControl>
                      <Input disabled={!isEditing} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input disabled={!isEditing} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* City */}
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input disabled={!isEditing} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* State/Province */}
              <FormField
                control={form.control}
                name="stateProvince"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province</FormLabel>
                    <FormControl>
                      <Input disabled={!isEditing} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ZIP/Postal Code */}
              <FormField
                control={form.control}
                name="zipPostalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP/Postal Code</FormLabel>
                    <FormControl>
                      <Input disabled={!isEditing} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Primary Contact Name */}
              <FormField
                control={form.control}
                name="primaryContact1Name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Contact Name</FormLabel>
                    <FormControl>
                      <Input disabled={!isEditing} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Primary Contact Designation */}
              <FormField
                control={form.control}
                name="primaryContact1Designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Contact Designation</FormLabel>
                    <FormControl>
                      <Input disabled={!isEditing} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Primary Contact Number */}
              <FormField
                control={form.control}
                name="primaryContactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Contact Number</FormLabel>
                    <FormControl>
                      <Input disabled={!isEditing} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Secondary Contact Name */}
              <FormField
                control={form.control}
                name="contact2Name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Contact Name (Optional)</FormLabel>
                    <FormControl>
                      <Input disabled={!isEditing} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Secondary Contact Designation */}
              <FormField
                control={form.control}
                name="contact2Designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Contact Designation (Optional)</FormLabel>
                    <FormControl>
                      <Input disabled={!isEditing} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Alternate Contact Number */}
              <FormField
                control={form.control}
                name="alternateContactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alternate Contact Number (Optional)</FormLabel>
                    <FormControl>
                      <Input disabled={!isEditing} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Alternate Email */}
              <FormField
                control={form.control}
                name="alternateEmailId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alternate Email (Optional)</FormLabel>
                    <FormControl>
                      <Input disabled={!isEditing} type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Website URL */}
              <FormField
                control={form.control}
                name="websiteUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL (Optional)</FormLabel>
                    <FormControl>
                      <Input disabled={!isEditing} type="url" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isEditing && (
              <div className="flex justify-end">
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  )
} 