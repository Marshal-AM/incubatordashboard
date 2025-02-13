"use client"

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

import { Input } from '@/components/ui/input'
import { LoadingButton } from '@/components/ui/loading-button'
import { Checkbox } from '@/components/ui/checkbox'
import { startupSignUpSchema } from '@/lib/validations/auth'
import { registerStartup } from '@/lib/actions/auth'

type FormData = z.infer<typeof startupSignUpSchema>

export default function StartupSignUp() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(startupSignUpSchema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      const result = await registerStartup(data)
      
      if (result.error) {
        throw new Error(result.error)
      }

      // Sign in the user
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (signInResult?.error) {
        throw new Error(signInResult.error)
      }

      // Redirect to dashboard
      router.push('/startup/dashboard')
    } catch (error) {
      console.error('Registration error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Create an account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create an account to explore more features on Cumma.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Input
            {...register('email')}
            type="email"
            placeholder="Ex: weebsitestudio@gmail.com"
            className="h-12"
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Input
            {...register('password')}
            type="password"
            placeholder="Ex: Abcd@12345"
            className="h-12"
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Input
            {...register('startupName')}
            type="text"
            placeholder="Startup Name"
            className="h-12"
          />
          {errors.startupName && (
            <p className="text-sm text-destructive">{errors.startupName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Input
            {...register('contactName')}
            type="text"
            placeholder="Contact Name"
            className="h-12"
          />
          {errors.contactName && (
            <p className="text-sm text-destructive">{errors.contactName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Input
            {...register('contactNumber')}
            type="tel"
            placeholder="Contact Number / WhatsApp Number"
            className="h-12"
          />
          {errors.contactNumber && (
            <p className="text-sm text-destructive">{errors.contactNumber.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="terms"
          onCheckedChange={(checked) => {
            if (checked) setValue('terms', true)
          }}
        />
        <label
          htmlFor="terms"
          className="text-sm text-muted-foreground"
        >
          By Signing up, you agree to our terms of service and policy.
        </label>
      </div>
      {errors.terms && (
        <p className="text-sm text-destructive">{errors.terms.message}</p>
      )}

      <LoadingButton type="submit" className="w-full h-12" loading={isSubmitting}>
        Create Account <span className="ml-2">→</span>
      </LoadingButton>

      <div className="text-center text-sm">
        Already have an account?{' '}
        <Link href="/sign-in" className="font-medium text-primary hover:underline">
          Go to Sign in
        </Link>
      </div>
    </form>
  )
} 