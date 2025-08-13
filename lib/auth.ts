import bcrypt from "bcryptjs"
import { sql } from "./db"
import { validatePasswordStrength } from "./crypto"
import { validateEmail } from "./security"

export interface User {
  id: string
  email: string
  name: string | null
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Simplified token generation without JWT library
export function generateToken(user: User): string {
  const payload = {
    userId: user.id,
    email: user.email,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  }
  return Buffer.from(JSON.stringify(payload)).toString("base64")
}

export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString())
    if (payload.exp < Date.now()) {
      return null // Token expired
    }
    return { userId: payload.userId, email: payload.email }
  } catch {
    return null
  }
}

export async function createUser(email: string, password: string, name?: string) {
  // Validate email format
  if (!validateEmail(email)) {
    throw new Error("Formato de email inválido")
  }

  // Validate password strength
  const passwordValidation = validatePasswordStrength(password)
  if (!passwordValidation.isValid) {
    throw new Error(`Contraseña débil: ${passwordValidation.errors.join(", ")}`)
  }

  const hashedPassword = await hashPassword(password)

  const users = await sql`
    INSERT INTO users (email, password, name)
    VALUES (${email.toLowerCase().trim()}, ${hashedPassword}, ${name?.trim()})
    RETURNING id, email, name
  `

  return users[0]
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const users = await sql`
    SELECT id, email, name, password FROM users WHERE email = ${email}
  `

  const user = users[0]
  if (!user) return null

  const isValid = await verifyPassword(password, user.password)
  if (!isValid) return null

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  }
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await sql`
    SELECT id, email, name FROM users WHERE id = ${id}
  `

  return users[0] || null
}
