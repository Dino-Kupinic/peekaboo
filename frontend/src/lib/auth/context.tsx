import React, { createContext, useContext, useState, useEffect } from "react"

type AuthContextType = {
  token: string | null
  setToken: (token: string | null) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

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
    <AuthContext.Provider
      value={{ token, setToken, logout, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside AuthProvider")
  return context
}
