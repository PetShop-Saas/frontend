import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/', '/login', '/register', '/complete-registration']
const PUBLIC_PATHS = ['/_next', '/favicon.ico', '/public', '/api/auth']

function isPublicPath(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname) || 
    PUBLIC_PATHS.some(prefix => pathname.startsWith(prefix))
}

function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  const cookieHeader = request.headers.get('cookie') || ''
  const tokenMatch = cookieHeader.match(/token=([^;]+)/)
  return tokenMatch ? tokenMatch[1] : null
}

function isValidJWT(token: string): boolean {
  if (!token || token.split('.').length !== 3) {
    return false
  }
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    return payload.exp ? payload.exp * 1000 > Date.now() : true
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }
  
  const token = getTokenFromRequest(request)
  
  if (!token || !isValidJWT(token)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
