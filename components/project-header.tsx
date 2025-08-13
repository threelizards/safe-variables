"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Lock } from "lucide-react"
import { useRouter } from "next/navigation"

interface Project {
  id: string
  name: string
  description: string | null
}

interface ProjectHeaderProps {
  project: Project
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const router = useRouter()

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Lock className="w-4 h-4 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-semibold">SecureVault</h2>
          </div>
        </div>
      </div>
    </header>
  )
}
