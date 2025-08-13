import crypto from "crypto"

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(
  identifier: string,
  maxRequests = 10,
  windowMs: number = 15 * 60 * 1000, // 15 minutes
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const key = `rate_limit:${identifier}`

  const current = rateLimitStore.get(key)

  if (!current || now > current.resetTime) {
    // Reset or initialize
    const resetTime = now + windowMs
    rateLimitStore.set(key, { count: 1, resetTime })
    return { allowed: true, remaining: maxRequests - 1, resetTime }
  }

  if (current.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime }
  }

  current.count++
  rateLimitStore.set(key, current)

  return { allowed: true, remaining: maxRequests - current.count, resetTime: current.resetTime }
}

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(sessionToken))
}

// Security headers
export const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
}

// Audit logging
export interface AuditLog {
  userId?: string
  action: string
  resource: string
  resourceId?: string
  ip: string
  userAgent: string
  timestamp: Date
  success: boolean
  details?: any
}

export function createAuditLog(log: Omit<AuditLog, "timestamp">): AuditLog {
  return {
    ...log,
    timestamp: new Date(),
  }
}

// Input validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export function validateProjectName(name: string): boolean {
  return name.length >= 1 && name.length <= 100 && !/[<>]/.test(name)
}

export function validateVariableKey(key: string): boolean {
  return /^[A-Z0-9_]+$/.test(key) && key.length >= 1 && key.length <= 100
}
