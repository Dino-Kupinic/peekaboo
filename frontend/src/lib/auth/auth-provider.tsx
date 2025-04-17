import React, { useEffect, useState } from "react"
import { AuthContext } from "@/lib/auth/authContext.tsx"

export type AuthContextType = {
  token: string | null
  setToken: (token: string | null) => void
  logout: () => void
  isAuthenticated: boolean
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("session")
    if (stored) setTokenState(stored)
  }, [])

  const setToken = (token: string | null) => {
    if (token) {
      localStorage.setItem("session", token)
    } else {
      localStorage.removeItem("session")
    }
    setTokenState(token)
  }

  const logout = async () => {
    if (token) {
      try {
        await fetch(`http://localhost:3000/logout`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      } catch (err) {
        console.error("logout error", err)
      }
    }
    setToken(null)
  }

  return (
    <AuthContext value={{ token, setToken, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext>
  )
}
