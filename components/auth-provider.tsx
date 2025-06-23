
"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { authManager, AuthState, User } from "@/lib/auth"

interface AuthContextType extends AuthState {
  signOut: () => void
  refreshAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false
  })

  useEffect(() => {
    const unsubscribe = authManager.subscribe(setAuthState)
    return unsubscribe
  }, [])

  const signOut = () => {
    authManager.signOut()
  }

  const refreshAuth = () => {
    setAuthState(authManager.getAuthState())
  }

  return (
    <AuthContext.Provider value={{
      ...authState,
      signOut,
      refreshAuth
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
