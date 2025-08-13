import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { sql } from "@/lib/db"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSession()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const variables = await sql`
      SELECT v.id FROM variables v
      JOIN projects p ON v.project_id = p.id
      WHERE v.id = ${params.id} AND p.user_id = ${user.id}
    `

    if (variables.length === 0) {
      return NextResponse.json({ error: "Variable no encontrada" }, { status: 404 })
    }

    await sql`DELETE FROM variables WHERE id = ${params.id}`

    return NextResponse.json({ message: "Variable eliminada exitosamente" })
  } catch (error) {
    console.error("Delete variable error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
