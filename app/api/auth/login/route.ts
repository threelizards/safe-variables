import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser, generateToken } from "@/lib/auth"
import { setSession } from "@/lib/session"
import { rateLimit, createAuditLog } from "@/lib/security"
import { sanitizeInput } from "@/lib/crypto"

export async function POST(request: NextRequest) {
  const clientIP = request.ip || request.headers.get("x-forwarded-for") || "unknown"

  const rateLimitResult = rateLimit(`login:${clientIP}`, 10, 15 * 60 * 1000) // 10 attempts per 15 minutes

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos de inicio de sesión. Intenta de nuevo más tarde." },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
        },
      },
    )
  }

  try {
    const body = await request.json()
    const email = sanitizeInput(body.email)
    const password = body.password

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    const user = await authenticateUser(email, password)

    if (!user) {
      console.log(
        JSON.stringify(
          createAuditLog({
            action: "LOGIN_FAILED",
            resource: "user",
            ip: clientIP,
            userAgent: request.headers.get("user-agent") || "unknown",
            success: false,
            details: { email },
          }),
        ),
      )

      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    const token = generateToken(user)
    await setSession(token)

    console.log(
      JSON.stringify(
        createAuditLog({
          userId: user.id,
          action: "LOGIN_SUCCESS",
          resource: "user",
          resourceId: user.id,
          ip: clientIP,
          userAgent: request.headers.get("user-agent") || "unknown",
          success: true,
        }),
      ),
    )

    return NextResponse.json({
      message: "Inicio de sesión exitoso",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
