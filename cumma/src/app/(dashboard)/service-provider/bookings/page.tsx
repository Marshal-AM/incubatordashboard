'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Booking {
  startupDetails: {
    logoUrl: string
    startupName: string
  }
  facilityType: string
  bookedOn: string
  validityTill: string
  amount: number
  rentalPlan: string
}

export default function BookingsPage() {
  const { data: session } = useSession()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch('/api/bookings')
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch bookings')
        }
        
        setBookings(data)
      } catch (error) {
        console.error('Error fetching bookings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!bookings.length) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">No bookings found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">View all booking status</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We are glad to see you again
        </p>
      </div>

      <div className="bg-white rounded-lg p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Startup Details</TableHead>
              <TableHead>Requested For</TableHead>
              <TableHead>Booked On</TableHead>
              <TableHead>Validity till</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10">
                      <Image
                        src={booking.startupDetails.logoUrl}
                        alt={booking.startupDetails.startupName}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{booking.startupDetails.startupName}</p>
                      <p className="text-sm text-muted-foreground">
                        Requested For: {booking.facilityType}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{booking.facilityType}</TableCell>
                <TableCell>{new Date(booking.bookedOn).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(booking.validityTill).toLocaleDateString()}</TableCell>
                <TableCell>₹{booking.amount.toLocaleString('en-IN')}/mo</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 