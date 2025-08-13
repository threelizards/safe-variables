"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, EyeOff, FolderOpen, MoreVertical, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { DeleteProjectDialog } from "./delete-project-dialog"
import { EditProjectDialog } from "./edit-project-dialog"

interface Project {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
  variableCount: number
  secretCount: number
}

interface ProjectsGridProps {
  projects: Project[]
}

export function ProjectsGrid({ projects }: ProjectsGridProps) {
  const router = useRouter()
  const [deleteProject, setDeleteProject] = useState<Project | null>(null)
  const [editProject, setEditProject] = useState<Project | null>(null)

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No tienes proyectos aún</h3>
        <p className="text-muted-foreground mb-4">Crea tu primer proyecto para comenzar a gestionar variables</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                  {project.description && (
                    <CardDescription className="mt-1 line-clamp-2">{project.description}</CardDescription>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/project/${project.id}`)}>
                      <FolderOpen className="mr-2 h-4 w-4" />
                      Abrir
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setEditProject(project)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeleteProject(project)}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {project.variableCount} variables
                  </Badge>
                  {project.secretCount > 0 && (
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <EyeOff className="h-3 w-3" />
                      {project.secretCount} secretas
                    </Badge>
                  )}
                </div>
              </div>
              <Button onClick={() => router.push(`/project/${project.id}`)} className="w-full" variant="outline">
                <FolderOpen className="mr-2 h-4 w-4" />
                Abrir Proyecto
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                Actualizado{" "}
                {new Date(project.updated_at).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {deleteProject && (
        <DeleteProjectDialog
          project={deleteProject}
          open={!!deleteProject}
          onOpenChange={() => setDeleteProject(null)}
        />
      )}

      {editProject && (
        <EditProjectDialog project={editProject} open={!!editProject} onOpenChange={() => setEditProject(null)} />
      )}
    </>
  )
}
