import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { sql } from "@/lib/db"
import { encrypt } from "@/lib/crypto"

export async function PUT(request: NextRequest, { params }: { params: { id: string; variableId: string } }) {
  try {
    const user = await getSession()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { key, value, description, isSecret } = await request.json()

    if (!key || !value) {
      return NextResponse.json({ error: "Clave y valor son requeridos" }, { status: 400 })
    }

    const variables = await sql`
      SELECT v.id FROM variables v
      JOIN projects p ON v.project_id = p.id
      WHERE v.id = ${params.variableId} AND p.id = ${params.id} AND p.user_id = ${user.id}
    `

    if (variables.length === 0) {
      return NextResponse.json({ error: "Variable no encontrada" }, { status: 404 })
    }

    // Check if key already exists in this project (excluding current variable)
    const existingVariables = await sql`
      SELECT id FROM variables 
      WHERE project_id = ${params.id} AND key = ${key} AND id != ${params.variableId}
    `

    if (existingVariables.length > 0) {
      return NextResponse.json({ error: "Ya existe una variable con esta clave" }, { status: 409 })
    }

    // Encrypt value if it's a secret
    const finalValue = isSecret ? encrypt(value) : value

    const updatedVariables = await sql`
      UPDATE variables 
      SET key = ${key}, value = ${finalValue}, description = ${description}, is_secret = ${isSecret}, updated_at = NOW()
      WHERE id = ${params.variableId}
      RETURNING *
    `

    return NextResponse.json(updatedVariables[0])
  } catch (error) {
    console.error("Update variable error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
