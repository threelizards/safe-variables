import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { sql } from "@/lib/db"
import { encrypt } from "@/lib/crypto"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSession()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { key, value, description, isSecret } = await request.json()

    if (!key || !value) {
      return NextResponse.json({ error: "Clave y valor son requeridos" }, { status: 400 })
    }

    const projects = await sql`
      SELECT id FROM projects WHERE id = ${params.id} AND user_id = ${user.id}
    `

    if (projects.length === 0) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    // Check if key already exists in this project
    const existingVariables = await sql`
      SELECT id FROM variables WHERE project_id = ${params.id} AND key = ${key}
    `

    if (existingVariables.length > 0) {
      return NextResponse.json({ error: "Ya existe una variable con esta clave" }, { status: 409 })
    }

    // Encrypt value if it's a secret
    const finalValue = isSecret ? encrypt(value) : value

    const variables = await sql`
      INSERT INTO variables (key, value, description, is_secret, project_id)
      VALUES (${key}, ${finalValue}, ${description}, ${isSecret}, ${params.id})
      RETURNING *
    `

    return NextResponse.json(variables[0])
  } catch (error) {
    console.error("Create variable error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
