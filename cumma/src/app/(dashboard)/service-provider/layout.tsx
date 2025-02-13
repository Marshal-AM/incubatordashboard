'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSession, signOut } from 'next-auth/react'
import { LayoutDashboard, CalendarDays, PlusCircle, Building2, UserCircle, LogOut } from 'lucide-react'

export default function ServiceProviderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/sign-in' })
  }

  const navigation = {
    main: [
      {
        name: 'Dashboard',
        href: '/service-provider/dashboard',
        icon: LayoutDashboard,
      },
      {
        name: 'Bookings',
        href: '/service-provider/bookings',
        icon: CalendarDays,
      },
      {
        name: 'Add New Facilities',
        href: '/service-provider/add-facilities',
        icon: PlusCircle,
      },
      {
        name: 'My Services & facilities',
        href: '/service-provider/my-facilities',
        icon: Building2,
      },
    ],
    account: [
      {
        name: 'My Profile',
        href: '/service-provider/profile',
        icon: UserCircle,
      },
      {
        name: 'Logout',
        href: '#',
        icon: LogOut,
        onClick: handleLogout,
      },
    ],
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-[280px] bg-white h-full p-4 flex flex-col gap-8 border-r">
        {/* Main Navigation */}
        <div className="space-y-2">
          <h2 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            MAIN
          </h2>
          <nav className="space-y-1">
            {navigation.main.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-2 py-3 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Account Management */}
        <div className="space-y-2">
          <h2 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            MANAGE ACCOUNT
          </h2>
          <nav className="space-y-1">
            {navigation.account.map((item) => {
              const isActive = pathname === item.href
              if (item.onClick) {
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault()
                      item.onClick()
                    }}
                    className={cn(
                      'flex items-center gap-3 px-2 py-3 text-sm font-medium rounded-lg transition-colors',
                      'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </a>
                )
              }
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-2 py-3 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto bg-[#F8F9FC]">
        {children}
      </main>
    </div>
  )
} 