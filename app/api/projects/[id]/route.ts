import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSession()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const projects = await sql`
      SELECT * FROM projects WHERE id = ${params.id} AND user_id = ${user.id}
    `

    const project = projects[0]
    if (!project) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    const variables = await sql`
      SELECT * FROM variables WHERE project_id = ${params.id} ORDER BY created_at DESC
    `

    return NextResponse.json({ ...project, variables })
  } catch (error) {
    console.error("Get project error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
      SELECT id FROM projects WHERE id = ${params.id} AND user_id = ${user.id}
    `

    if (projects.length === 0) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    const updatedProjects = await sql`
      UPDATE projects 
      SET name = ${name}, description = ${description}, updated_at = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `

    return NextResponse.json(updatedProjects[0])
  } catch (error) {
    console.error("Update project error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSession()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const projects = await sql`
      SELECT id FROM projects WHERE id = ${params.id} AND user_id = ${user.id}
    `

    if (projects.length === 0) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    await sql`DELETE FROM projects WHERE id = ${params.id}`

    return NextResponse.json({ message: "Proyecto eliminado exitosamente" })
  } catch (error) {
    console.error("Delete project error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
