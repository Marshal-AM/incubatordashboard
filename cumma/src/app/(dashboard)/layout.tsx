'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ProfilePicture } from '@/components/ui/profile-picture'
import { getServiceProviderProfile } from '@/lib/actions/service-provider'
import { useEffect, useState } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user?.userType === 'Service Provider') {
        const result = await getServiceProviderProfile()
        if (result.success) {
          setProfile(result.data)
        }
      }
    }

    fetchProfile()
  }, [session])

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="flex h-20 items-center justify-between px-6 sm:px-8">
          <div className="flex items-center gap-8">
            <Link href={session?.user?.userType === 'startup' ? '/startup/dashboard' : '/service-provider/dashboard'}>
              <Image
                src="/logo.png"
                alt="Cumma Logo"
                width={150}
                height={32}
                priority
              />
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium">
              Welcome back, {profile?.serviceName || 'User'}!
            </span>
            <div className="h-12 w-12">
              <ProfilePicture
                imageUrl={profile?.logoUrl}
                size={48}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      {children}
    </div>
  )
} 