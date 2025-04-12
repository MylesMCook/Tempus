import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Skip middleware for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Clone the response
  const response = NextResponse.next()

  // Add security headers
  const headers = response.headers

  // HSTS - Strict Transport Security
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")

  // Prevent clickjacking
  headers.set("X-Frame-Options", "DENY")

  // XSS protection
  headers.set("X-Content-Type-Options", "nosniff")

  // Referrer policy
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  // Permissions Policy (formerly Feature Policy)
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()")

  // Content Security Policy - Less restrictive for API routes
  headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' *; font-src 'self' data:; frame-ancestors 'none';",
  )

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/* (API routes)
     * 2. /_next/* (Next.js internals)
     * 3. /_static/* (inside /public)
     * 4. /_vercel/* (Vercel internals)
     * 5. /favicon.ico, /sitemap.xml (static files)
     */
    "/((?!api|_next|_static|_vercel|favicon.ico|sitemap.xml).*)",
  ],
}
