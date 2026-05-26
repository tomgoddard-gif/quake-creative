import { NextRequest, NextResponse } from 'next/server'

const ADMIN_ROUTES = [
  '/plan',
  '/history',
  '/insights',
  '/settings',
  // legacy routes (kept for backward compatibility)
  '/ideas',
  '/planning',
  '/production',
  '/library',
  '/builder',
  '/personas',
  '/performance',
  '/templates',
]
const CLIENT_ROUTES = ['/briefs']
const API_BEARER_ROUTES = ['/api/meta/sync', '/api/meta/top-performers', '/api/meta/fatigue-alerts']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/login') || pathname.startsWith('/_next') || pathname === '/') {
    return NextResponse.next()
  }

  if (API_BEARER_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const role = request.cookies.get('role')?.value

  if (!role) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (role === 'client' && ADMIN_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/briefs', request.url))
  }

  if (role === 'admin' && CLIENT_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/plan', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
