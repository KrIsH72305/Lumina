import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    if (path === '/') {
      if (!token) return NextResponse.redirect(new URL('/login', req.url))
      
      switch (token.role) {
        case 'ADMIN':
          return NextResponse.redirect(new URL('/admin', req.url))
        case 'MANAGER':
          return NextResponse.redirect(new URL('/manager', req.url))
        case 'EMPLOYEE':
          return NextResponse.redirect(new URL('/employee', req.url))
      }
    }

    if (path.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
    
    if (path.startsWith('/manager') && token?.role !== 'MANAGER' && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
    
    if (path.startsWith('/employee') && token?.role !== 'EMPLOYEE' && token?.role !== 'MANAGER' && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  matcher: ['/', '/admin/:path*', '/manager/:path*', '/employee/:path*'],
}
