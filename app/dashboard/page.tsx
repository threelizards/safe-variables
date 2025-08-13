import { getSession } from "@/lib/session"
import { sql } from "@/lib/db"
import { redirect } from "next/navigation"
import { ProjectsGrid } from "@/components/projects-grid"
import { CreateProjectDialog } from "@/components/create-project-dialog"
import { DashboardHeader } from "@/components/dashboard-header"

export default async function DashboardPage() {
  const user = await getSession()

  if (!user) {
    redirect("/login")
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

  const projectsWithCounts = projects.map((project) => ({
    ...project,
    variableCount: Number(project.variable_count),
    secretCount: Number(project.secret_count),
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <DashboardHeader user={user} />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mis Proyectos</h1>
            <p className="text-muted-foreground mt-2">
              Gestiona las variables y contraseñas de tus proyectos de forma segura
            </p>
          </div>
          <CreateProjectDialog />
        </div>
        <ProjectsGrid projects={projectsWithCounts} />
      </main>
    </div>
  )
}
