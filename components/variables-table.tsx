"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Copy, Edit, Eye, EyeOff, MoreVertical, Trash2, Key } from "lucide-react"
import { EditVariableDialog } from "./edit-variable-dialog"
import { DeleteVariableDialog } from "./delete-variable-dialog"
import { useToast } from "@/hooks/use-toast"

interface Variable {
  id: string
  key: string
  value: string
  decryptedValue: string
  description: string | null
  is_secret: boolean
  created_at: string
  updated_at: string
}

interface VariablesTableProps {
  variables: Variable[]
  projectId: string
}

export function VariablesTable({ variables, projectId }: VariablesTableProps) {
  const [editVariable, setEditVariable] = useState<Variable | null>(null)
  const [deleteVariable, setDeleteVariable] = useState<Variable | null>(null)
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  const toggleSecretVisibility = (variableId: string) => {
    const newVisible = new Set(visibleSecrets)
    if (newVisible.has(variableId)) {
      newVisible.delete(variableId)
    } else {
      newVisible.add(variableId)
    }
    setVisibleSecrets(newVisible)
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copiado",
        description: `${label} copiado al portapapeles`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar al portapapeles",
        variant: "destructive",
      })
    }
  }

  if (variables.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Key className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay variables aún</h3>
          <p className="text-muted-foreground mb-4">Crea tu primera variable para comenzar</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Variables del Proyecto</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clave</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Actualizado</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variables.map((variable) => (
                <TableRow key={variable.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span>{variable.key}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(variable.key, "Clave")}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 max-w-xs">
                      {variable.is_secret ? (
                        <>
                          <span className="font-mono text-sm truncate">
                            {visibleSecrets.has(variable.id) ? variable.decryptedValue : "••••••••"}
                          </span>
                          {visibleSecrets.has(variable.id) && (
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              🔒
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSecretVisibility(variable.id)}
                            className="h-6 w-6 p-0"
                          >
                            {visibleSecrets.has(variable.id) ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(variable.value, "Valor encriptado")}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="font-mono text-sm truncate">{variable.value}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(variable.value, "Valor")}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={variable.is_secret ? "destructive" : "secondary"}>
                      {variable.is_secret ? "Privada" : "Pública"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground truncate max-w-xs block">
                      {variable.description || "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {new Date(variable.updated_at).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditVariable(variable)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteVariable(variable)}
                          className="text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editVariable && (
        <EditVariableDialog
          variable={editVariable}
          projectId={projectId}
          open={!!editVariable}
          onOpenChange={() => setEditVariable(null)}
        />
      )}

      {deleteVariable && (
        <DeleteVariableDialog
          variable={deleteVariable}
          open={!!deleteVariable}
          onOpenChange={() => setDeleteVariable(null)}
        />
      )}
    </>
  )
}
