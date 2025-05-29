"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { jwtDecode } from "jwt-decode"

interface User {
  email: string
  name: string
  picture: string
  sub: string
}

interface GoogleJwtPayload {
  email: string
  name: string
  picture: string
  sub: string
  given_name?: string
  family_name?: string
  iss: string
  aud: string
  exp: number
  iat: number
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAuthorized: boolean
  login: (credential: string) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Whitelist de e-mails autorizados
const AUTHORIZED_EMAILS = [
  "marcosvitor1994@gmail.com",
  "vitor.checkmedia@gmail.com", // Adicionando seu e-mail para teste
  "luiz.coelho@naccom.com.br",
  "marcos.santos@naccom.com.br",
  "luiz02coelho@gmail.com",
]

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há um usuário salvo no localStorage
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error("Erro ao carregar usuário salvo:", error)
        localStorage.removeItem("user")
      }
    }
    setLoading(false)
  }, [])

  const login = (credential: string) => {
    try {
      const decoded = jwtDecode<GoogleJwtPayload>(credential)

      console.log("Token decodificado:", decoded) // Para debug

      const userData: User = {
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        sub: decoded.sub,
      }

      console.log("Dados do usuário:", userData) // Para debug

      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
      localStorage.setItem("token", credential)
    } catch (error) {
      console.error("Erro ao decodificar token:", error)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
  }

  const isAuthenticated = !!user
  const isAuthorized = user ? AUTHORIZED_EMAILS.includes(user.email) : false

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAuthorized,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}
