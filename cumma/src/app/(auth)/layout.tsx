'use client'

import Image from 'next/image'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      {/* Background image with blur */}
      <div 
        className="absolute inset-0 bg-[url('/auth-bg.jpg')] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/auth-bg.jpg')`
        }}
      >
        <div className="absolute inset-0 backdrop-blur-sm" />
      </div>

      {/* Card Container */}
      <div className="relative w-full max-w-[440px]">
        <div className="bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 rounded-xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image
              src="/logo.png"
              alt="FacilitiEase Logo"
              width={200}
              height={40}
              priority
            />
          </div>

          {children}
        </div>
      </div>
    </div>
  )
} 