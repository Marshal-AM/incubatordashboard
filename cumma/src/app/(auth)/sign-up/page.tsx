import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function SignUpChoice() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Create an account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose your account type to get started
        </p>
      </div>

      <div className="grid gap-4">
        <Link href="/sign-up/startup" className="w-full">
          <Button className="w-full h-12">
            Continue as Startup <span className="ml-2">→</span>
          </Button>
        </Link>
        <Link href="/sign-up/service-provider" className="w-full">
          <Button variant="outline" className="w-full h-12">
            Continue as Service Provider <span className="ml-2">→</span>
          </Button>
        </Link>
      </div>

      <div className="text-center text-sm">
        Already have an account?{' '}
        <Link href="/sign-in" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  )
} 