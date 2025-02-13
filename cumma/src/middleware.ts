import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { withAuth } from 'next-auth/middleware'

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req })
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith('/sign-in') ||
                      req.nextUrl.pathname.startsWith('/sign-up')

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL(
          token.userType === 'startup' ? '/startup/dashboard' : '/service-provider/dashboard',
          req.url
        ))
      }
      return null
    }

    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/sign-in?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    // Handle route protection based on user type
    if (token.userType === 'startup' && req.nextUrl.pathname.startsWith('/service-provider')) {
      return NextResponse.redirect(new URL('/startup/dashboard', req.url))
    }

    if (token.userType === 'Service Provider' && req.nextUrl.pathname.startsWith('/startup')) {
      return NextResponse.redirect(new URL('/service-provider/dashboard', req.url))
    }

    // Allow access to protected routes
    return null
  },
  {
    callbacks: {
      authorized: () => true
    },
  }
)

// Protect specific routes
export const config = {
  matcher: [
    '/startup/:path*',
    '/service-provider/:path*',
    '/sign-in',
    '/sign-up',
    '/auth/complete-profile'
  ]
} 