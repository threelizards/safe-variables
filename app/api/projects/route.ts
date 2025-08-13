import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const user = await getSession()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const projects = await sql`
      SELECT 
        p.*,
        COUNT(v.id) as variable_count,
        COUNT(CASE WHEN v.is_secret = true THEN 1 END) as secret_count
      FROM projects p
      LEFT JOIN variables v ON p.id = v.project_id
      WHERE p.user_id = ${user.id}
      GROUP BY p.id
      ORDER BY p.updated_at DESC
    `

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Get projects error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "El nombre del proyecto es requerido" }, { status: 400 })
    }

    const projects = await sql`
      INSERT INTO projects (name, description, user_id)
      VALUES (${name}, ${description}, ${user.id})
      RETURNING *
    `

    return NextResponse.json(projects[0])
  } catch (error) {
    console.error("Create project error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
