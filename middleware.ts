import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { securityHeaders } from "@/lib/security"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const response = NextResponse.next()

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/api/auth/login", "/api/auth/register"]

  if (publicRoutes.includes(pathname)) {
    return response
  }

  // Check if user is authenticated
  const user = await getSession()

  if (!user) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
