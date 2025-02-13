'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FacilityForm } from '@/components/forms/facility-form'
import { Skeleton } from '@/components/ui/skeleton'

interface Facility {
  _id: string
  details: {
    name: string
    images: string[]
    rentalPlans?: {
      name: string
      price: number
      duration: string
    }[]
  }
  facilityType: FacilityType
  updatedAt: string
  status: string
}

type FacilityType =
  | 'bio-allied-labs'
  | 'manufacturing-labs'
  | 'prototyping-labs'
  | 'raw-space-office'
  | 'raw-space-lab'
  | 'software'
  | 'saas-allied'
  | 'individual-cabin'
  | 'coworking-spaces'
  | 'meeting-rooms'

export default function MyFacilities() {
  const { data: session } = useSession()
  const router = useRouter()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    fetchFacilities()
  }, [session])

  const fetchFacilities = async () => {
    try {
      const response = await fetch('/api/facilities')
      const data = await response.json()
      setFacilities(data)
    } catch (error) {
      toast.error('Failed to fetch facilities')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (facility: Facility) => {
    try {
      console.log('Fetching facility details for:', facility._id)
      const response = await fetch(`/api/facilities/${facility._id}`)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Failed to fetch facility details:', errorText)
        throw new Error('Failed to fetch facility details')
      }
      
      const data = await response.json()
      console.log('Received facility data:', data)
      
      if (!data || !data.details) {
        console.error('Invalid facility data received:', data)
        throw new Error('Invalid facility data received')
      }

      // Restructure the data to match the form's expected format
      const formattedData = {
        ...data,
        ...data.details, // Spread the details at the top level
        facilityType: data.facilityType,
        rentalPlans: data.details.rentalPlans?.map((plan: any) => ({
          name: plan.name,
          price: plan.price,
          duration: plan.duration
        })) || []
      }

      console.log('Formatted data for form:', formattedData)
      setEditingFacility(formattedData)
      setIsEditDialogOpen(true)
    } catch (error) {
      console.error('Error in handleEdit:', error)
      toast.error('Failed to load facility details')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this facility?')) return

    try {
      const response = await fetch(`/api/facilities/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Facility deleted successfully')
        fetchFacilities()
      } else {
        throw new Error('Failed to delete facility')
      }
    } catch (error) {
      toast.error('Failed to delete facility')
    }
  }

  const handleEditSubmit = async (formData: any) => {
    if (!editingFacility) return

    try {
      const response = await fetch(`/api/facilities/${editingFacility._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status: 'pending', // Change status to pending after edit
        }),
      })

      if (response.ok) {
        toast.success('Facility updated successfully')
        setIsEditDialogOpen(false)
        fetchFacilities()
      } else {
        throw new Error('Failed to update facility')
      }
    } catch (error) {
      toast.error('Failed to update facility')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">My Facilities & Services</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your facilities and services
          </p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Facilities & Services</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your facilities and services
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Facility Title</TableHead>
              <TableHead>Date Published</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {facilities.map((facility) => (
              <TableRow key={facility._id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-4">
                    {facility.details.images?.[0] && (
                      <Image
                        src={facility.details.images[0]}
                        alt={facility.details.name}
                        width={48}
                        height={48}
                        className="rounded-md object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium">{facility.details.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {facility.facilityType}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(facility.updatedAt), 'dd.MM.yyyy')}
                </TableCell>
                <TableCell>
                  <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    facility.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : facility.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {facility.status.charAt(0).toUpperCase() + facility.status.slice(1)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(facility)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(facility._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Facility</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-2">
            {editingFacility && (
              <FacilityForm
                type={editingFacility.facilityType}
                initialData={editingFacility.details}
                onSubmit={handleEditSubmit}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 