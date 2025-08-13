import { NextResponse } from "next/server"
import { clearSession } from "@/lib/session"

export async function POST() {
  try {
    await clearSession()
    return NextResponse.json({ message: "Sesión cerrada exitosamente" })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
