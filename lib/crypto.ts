const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "your-32-character-secret-key-here"

// Simple encryption using base64 encoding (for demo purposes)
// In production, you should use proper encryption
export function encrypt(text: string): string {
  if (!text) throw new Error("Text to encrypt cannot be empty")

  try {
    // Simple base64 encoding with a basic transformation
    const encoded = btoa(unescape(encodeURIComponent(text)))
    const key = ENCRYPTION_KEY.slice(0, 16)

    // Simple XOR-like transformation
    let result = ""
    for (let i = 0; i < encoded.length; i++) {
      const charCode = encoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      result += String.fromCharCode(charCode)
    }

    return btoa(result)
  } catch (error) {
    throw new Error("Failed to encrypt data")
  }
}

export function decrypt(encryptedData: string): string {
  if (!encryptedData) throw new Error("Encrypted data cannot be empty")

  try {
    const key = ENCRYPTION_KEY.slice(0, 16)
    const decoded = atob(encryptedData)

    // Reverse the XOR transformation
    let result = ""
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      result += String.fromCharCode(charCode)
    }

    return decodeURIComponent(escape(atob(result)))
  } catch (error) {
    throw new Error("Failed to decrypt data: Invalid or corrupted data")
  }
}

export function validatePasswordStrength(password: string): {
  isValid: boolean
  errors: string[]
  score: number
} {
  const errors: string[] = []
  let score = 0

  if (password.length < 8) {
    errors.push("La contraseña debe tener al menos 8 caracteres")
  } else if (password.length >= 12) {
    score += 2
  } else {
    score += 1
  }

  if (!/[a-z]/.test(password)) {
    errors.push("La contraseña debe contener al menos una letra minúscula")
  } else {
    score += 1
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("La contraseña debe contener al menos una letra mayúscula")
  } else {
    score += 1
  }

  if (!/\d/.test(password)) {
    errors.push("La contraseña debe contener al menos un número")
  } else {
    score += 1
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push("La contraseña debe contener al menos un carácter especial")
  } else {
    score += 2
  }

  // Check for common patterns
  if (/(.)\1{2,}/.test(password)) {
    errors.push("La contraseña no debe contener caracteres repetidos consecutivos")
    score -= 1
  }

  if (/123|abc|qwe|password|admin/i.test(password)) {
    errors.push("La contraseña no debe contener patrones comunes")
    score -= 2
  }

  return {
    isValid: errors.length === 0 && score >= 4,
    errors,
    score: Math.max(0, Math.min(5, score)),
  }
}

export function generateSecurePassword(length = 16): string {
  const lowercase = "abcdefghijklmnopqrstuvwxyz"
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const numbers = "0123456789"
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?"

  const allChars = lowercase + uppercase + numbers + symbols

  let password = ""

  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("")
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/['"]/g, "") // Remove quotes that could cause SQL issues
    .substring(0, 1000) // Limit length
}
