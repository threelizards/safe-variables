import { getSession } from "@/lib/session"
import { sql } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import { ProjectHeader } from "@/components/project-header"
import { VariablesTable } from "@/components/variables-table"
import { CreateVariableDialog } from "@/components/create-variable-dialog"
// import { decrypt } from "@/lib/crypto" // Removed unused import

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const user = await getSession()

  if (!user) {
    redirect("/login")
  }

  const projects = await sql`
    SELECT * FROM projects WHERE id = ${params.id} AND user_id = ${user.id}
  `

  const project = projects[0]
  if (!project) {
    notFound()
  }

  const variables = await sql`
    SELECT * FROM variables WHERE project_id = ${params.id} ORDER BY created_at DESC
  `

  const variablesWithDecrypted = variables.map((variable) => ({
    ...variable,
    // For secret variables, keep the encrypted value to show encryption
    decryptedValue: variable.value, // Show encrypted value instead of decrypting
  }))
  // </CHANGE>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <ProjectHeader project={project} />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
            {project.description && <p className="text-muted-foreground mt-2">{project.description}</p>}
            <p className="text-sm text-muted-foreground mt-1">
              {variables.length} variables • {variables.filter((v) => v.is_secret).length} secretas
            </p>
          </div>
          <CreateVariableDialog projectId={project.id} />
        </div>
        <VariablesTable variables={variablesWithDecrypted} projectId={project.id} />
      </main>
    </div>
  )
}
