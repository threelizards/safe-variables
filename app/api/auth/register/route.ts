import { type NextRequest, NextResponse } from "next/server"
import { createUser, generateToken } from "@/lib/auth"
import { setSession } from "@/lib/session"
import { sql } from "@/lib/db"
import { rateLimit, createAuditLog } from "@/lib/security"
import { sanitizeInput } from "@/lib/crypto"

export async function POST(request: NextRequest) {
  const clientIP = request.ip || request.headers.get("x-forwarded-for") || "unknown"

  const rateLimitResult = rateLimit(`register:${clientIP}`, 5, 15 * 60 * 1000) // 5 attempts per 15 minutes

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos de registro. Intenta de nuevo más tarde." },
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
    const name = body.name ? sanitizeInput(body.name) : undefined
    const email = sanitizeInput(body.email)
    const password = body.password

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()}
    `

    if (existingUsers.length > 0) {
      console.log(
        JSON.stringify(
          createAuditLog({
            action: "REGISTER_FAILED",
            resource: "user",
            ip: clientIP,
            userAgent: request.headers.get("user-agent") || "unknown",
            success: false,
            details: { reason: "email_exists", email },
          }),
        ),
      )

      return NextResponse.json({ error: "Ya existe un usuario con este email" }, { status: 409 })
    }

    const user = await createUser(email, password, name)
    const token = generateToken(user)
    await setSession(token)

    console.log(
      JSON.stringify(
        createAuditLog({
          userId: user.id,
          action: "REGISTER_SUCCESS",
          resource: "user",
          resourceId: user.id,
          ip: clientIP,
          userAgent: request.headers.get("user-agent") || "unknown",
          success: true,
        }),
      ),
    )

    return NextResponse.json({
      message: "Usuario creado exitosamente",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error("Register error:", error)

    console.log(
      JSON.stringify(
        createAuditLog({
          action: "REGISTER_ERROR",
          resource: "user",
          ip: clientIP,
          userAgent: request.headers.get("user-agent") || "unknown",
          success: false,
          details: { error: error instanceof Error ? error.message : "Unknown error" },
        }),
      ),
    )

    if (error instanceof Error && error.message.includes("Contraseña débil")) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
