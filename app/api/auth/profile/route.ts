import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { sql } from "@/lib/db"

export async function PUT(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const data = await request.json()

    const result = await sql`
      UPDATE users SET
        name = ${data.name},
        bio = ${data.bio},
        company = ${data.company},
        position = ${data.position},
        avatar_url = ${data.avatar_url},
        birth_date = ${data.birth_date || null},
        phone = ${data.phone},
        location = ${data.location},
        website = ${data.website},
        linkedin = ${data.linkedin},
        github = ${data.github},
        timezone = ${data.timezone},
        updated_at = NOW()
      WHERE id = ${user.id}
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
