import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface User {
  id: string
  name: string | null
  email: string
  bio: string | null
  company: string | null
  position: string | null
  avatar_url: string | null
  birth_date: string | null
  phone: string | null
  location: string | null
  website: string | null
  linkedin: string | null
  github: string | null
  timezone: string | null
  theme_preference: string | null
  created_at: string
  updated_at: string
}

export { sql }
