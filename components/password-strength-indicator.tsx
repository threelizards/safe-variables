"use client"

import { validatePasswordStrength } from "@/lib/crypto"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle } from "lucide-react"

interface PasswordStrengthIndicatorProps {
  password: string
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  if (!password) return null

  const validation = validatePasswordStrength(password)
  const strengthLabels = ["Muy débil", "Débil", "Regular", "Buena", "Fuerte", "Muy fuerte"]
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-emerald-500",
  ]

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Fortaleza de la contraseña</span>
        <span className={`text-sm font-medium ${validation.score >= 4 ? "text-green-600" : "text-orange-600"}`}>
          {strengthLabels[validation.score]}
        </span>
      </div>
      <Progress value={(validation.score / 5) * 100} className="h-2" />
      {validation.errors.length > 0 && (
        <div className="space-y-1">
          {validation.errors.map((error, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-red-600">
              <XCircle className="h-3 w-3" />
              {error}
            </div>
          ))}
        </div>
      )}
      {validation.isValid && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="h-3 w-3" />
          Contraseña segura
        </div>
      )}
    </div>
  )
}
