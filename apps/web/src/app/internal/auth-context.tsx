"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

type AuthContextType = {
  isAuthenticated: boolean
  login: () => void
  logout: () => void
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const router = useRouter()

  const login = () => {
    setIsAuthenticated(true)
    router.push("/internal")
  }

  const logout = () => {
    setIsAuthenticated(false)
    router.push("/internal/login")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!isAuthenticated && window.location.pathname !== "/internal/login") {
      router.push("/internal/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated && typeof window !== "undefined" && window.location.pathname !== "/internal/login") {
    return null
  }

  return <>{children}</>
}
