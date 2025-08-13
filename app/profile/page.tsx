import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { ProfileView } from "@/components/profile-view"
import { sql } from "@/lib/db"

export default async function ProfilePage() {
  const user = await getSession()

  if (!user) {
    redirect("/login")
  }

  const result = await sql`
    SELECT 
      id, name, email, bio, company, position, avatar_url,
      birth_date, phone, location, website, linkedin, github,
      timezone, theme_preference, created_at, updated_at
    FROM users 
    WHERE id = ${user.id}
  `

  const userProfile = result[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <ProfileView user={userProfile} />
    </div>
  )
}
