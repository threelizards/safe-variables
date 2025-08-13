"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertTriangle } from "lucide-react"

interface Variable {
  id: string
  key: string
}

interface DeleteVariableDialogProps {
  variable: Variable
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteVariableDialog({ variable, open, onOpenChange }: DeleteVariableDialogProps) {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/variables/${variable.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        onOpenChange(false)
        router.refresh()
      } else {
        setError(data.error || "Error al eliminar la variable")
      }
    } catch (error) {
      setError("Error de conexión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Eliminar Variable
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres eliminar la variable "{variable.key}"? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Eliminando...
              </>
            ) : (
              "Eliminar Variable"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
