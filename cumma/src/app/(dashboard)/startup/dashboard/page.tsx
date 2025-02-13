'use client'

import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'

export default function StartupDashboard() {
  const { data: session } = useSession()

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">Startup Dashboard</h1>
        <Button
          variant="outline"
          onClick={() => signOut({ callbackUrl: '/sign-in' })}
        >
          Sign Out
        </Button>
      </div>

      <div className="bg-card rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-medium mb-4">Welcome back!</h2>
        <p className="text-muted-foreground">
          This is a placeholder dashboard for startups. More features coming soon!
        </p>
        <pre className="mt-4 p-4 bg-muted rounded-md">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  )
} 