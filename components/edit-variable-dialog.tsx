"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, EyeOff, Lock } from "lucide-react"

interface Variable {
  id: string
  key: string
  value: string
  decryptedValue: string
  description: string | null
  isSecret: boolean
}

interface EditVariableDialogProps {
  variable: Variable
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditVariableDialog({ variable, projectId, open, onOpenChange }: EditVariableDialogProps) {
  const [key, setKey] = useState(variable.key)
  const [value, setValue] = useState(variable.decryptedValue)
  const [description, setDescription] = useState(variable.description || "")
  const [isSecret, setIsSecret] = useState(variable.isSecret)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setKey(variable.key)
    setValue(variable.decryptedValue)
    setDescription(variable.description || "")
    setIsSecret(variable.isSecret)
    setError("")
  }, [variable])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const requestBody = variable.isSecret
        ? { key, description, isSecret: true }
        : { key, value, description, isSecret }

      const response = await fetch(`/api/projects/${projectId}/variables/${variable.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (response.ok) {
        onOpenChange(false)
        router.refresh()
      } else {
        setError(data.error || "Error al actualizar la variable")
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
          <DialogTitle>Editar Variable</DialogTitle>
          <DialogDescription>
            {variable.isSecret
              ? "Solo puedes editar la clave y descripción de variables encriptadas."
              : "Actualiza la información de tu variable."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="key">Clave</Label>
              <Input
                id="key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="EMAIL_PASSWORD"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value" className="flex items-center gap-2">
                Valor
                {variable.isSecret && <Lock className="h-4 w-4 text-muted-foreground" />}
              </Label>
              <Input
                id="value"
                type={isSecret ? "password" : "text"}
                value={variable.isSecret ? "••••••••••••••••" : value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={variable.isSecret ? "Valor encriptado (no editable)" : "threelizards@gmail.com"}
                required={!variable.isSecret}
                disabled={isLoading || variable.isSecret} // Disable value field for encrypted variables
                className={variable.isSecret ? "bg-muted" : ""}
              />
              {variable.isSecret && (
                <p className="text-sm text-muted-foreground">
                  El valor de las variables encriptadas no se puede modificar por seguridad.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contraseña del correo de la empresa"
                disabled={isLoading}
                rows={2}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isSecret"
                checked={isSecret}
                onCheckedChange={setIsSecret}
                disabled={isLoading || variable.isSecret} // Disable switch for already encrypted variables
              />
              <Label htmlFor="isSecret" className="flex items-center gap-2">
                <EyeOff className="h-4 w-4" />
                Variable secreta (se encriptará)
                {variable.isSecret && <Lock className="h-4 w-4 text-muted-foreground" />}
              </Label>
            </div>
            {variable.isSecret && (
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  Esta variable está encriptada. No se puede desencriptar ni modificar su valor por seguridad.
                </AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
