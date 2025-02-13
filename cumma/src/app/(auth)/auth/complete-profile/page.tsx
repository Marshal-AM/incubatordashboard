'use client'

import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { OAuthCompletion } from '@/components/auth/oauth-completion'

export default function CompleteProfile() {
  const searchParams = useSearchParams()
  const userType = searchParams.get('type') as 'startup' | 'Service Provider'

  if (!userType) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-[440px] space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/logo.png"
            alt="FacilitiEase Logo"
            width={200}
            height={40}
            priority
          />
        </div>

        {/* Complete Profile Form */}
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Complete Your Profile</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Please provide additional information to complete your profile
            </p>
          </div>

          <OAuthCompletion userType={userType} />
        </div>
      </div>
    </div>
  )
} 