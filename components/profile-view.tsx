"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Calendar,
  Phone,
  Globe,
  Linkedin,
  Github,
  Building2,
  Briefcase,
  Clock,
  Palette,
  Edit,
  ArrowLeft,
  Mail,
  Heart,
  Star,
} from "lucide-react"
import { EditProfileDialog } from "@/components/edit-profile-dialog"
import type { User as UserProfile } from "@/lib/db"
import Link from "next/link"

interface ProfileViewProps {
  user: UserProfile
}

export function ProfileView({ user }: ProfileViewProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(user)

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return email[0].toUpperCase()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const memberSince = formatDate(currentUser.created_at)
  const age = calculateAge(currentUser.birth_date)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard
          </Button>
        </Link>
      </div>

      <Card className="mb-8 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 relative">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-4 right-4">
            <Button onClick={() => setIsEditOpen(true)} size="sm" className="gap-2">
              <Edit className="w-4 h-4" />
              Editar Perfil
            </Button>
          </div>
        </div>
        <CardContent className="pt-0">
          <div className="flex flex-col md:flex-row gap-6 -mt-16 relative z-10">
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                <AvatarImage src={currentUser.avatar_url || undefined} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-violet-500 to-pink-500 text-white">
                  {getInitials(currentUser.name, currentUser.email)}
                </AvatarFallback>
              </Avatar>
              <div className="mt-4 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{currentUser.name || "Usuario"}</h1>
                <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4" />
                  {currentUser.email}
                </p>
                {currentUser.position && currentUser.company && (
                  <p className="text-lg text-gray-700 dark:text-gray-200 mt-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    {currentUser.position} en {currentUser.company}
                  </p>
                )}
              </div>
            </div>

            <div className="flex-1 mt-8 md:mt-16">
              {currentUser.bio && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{currentUser.bio}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {age && (
                  <Badge variant="secondary" className="gap-1">
                    <Heart className="w-3 h-3" />
                    {age} años
                  </Badge>
                )}
                {memberSince && (
                  <Badge variant="secondary" className="gap-1">
                    <Star className="w-3 h-3" />
                    Miembro desde {memberSince}
                  </Badge>
                )}
                {currentUser.location && (
                  <Badge variant="secondary" className="gap-1">
                    <MapPin className="w-3 h-3" />
                    {currentUser.location}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              Información de Contacto
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentUser.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{currentUser.phone}</span>
              </div>
            )}
            {currentUser.website && (
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-gray-500" />
                <a
                  href={currentUser.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {currentUser.website}
                </a>
              </div>
            )}
            {currentUser.birth_date && (
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>Cumpleaños: {formatDate(currentUser.birth_date)}</span>
              </div>
            )}
            {currentUser.timezone && (
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>Zona horaria: {currentUser.timezone}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Profesional y Redes
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentUser.company && (
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-gray-500" />
                <span>{currentUser.company}</span>
              </div>
            )}
            {currentUser.linkedin && (
              <div className="flex items-center gap-3">
                <Linkedin className="w-4 h-4 text-blue-600" />
                <a
                  href={currentUser.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  LinkedIn
                </a>
              </div>
            )}
            {currentUser.github && (
              <div className="flex items-center gap-3">
                <Github className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                <a
                  href={currentUser.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  GitHub
                </a>
              </div>
            )}
            {currentUser.theme_preference && (
              <div className="flex items-center gap-3">
                <Palette className="w-4 h-4 text-gray-500" />
                <span>Tema: {currentUser.theme_preference}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <EditProfileDialog
        user={currentUser}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onUserUpdate={setCurrentUser}
      />
    </div>
  )
}
