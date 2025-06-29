"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { authManager, AuthState, User } from "@/lib/auth"

interface AuthContextType extends AuthState {
  signOut: () => void
  refreshAuth: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Initialize auth state immediately
    const currentState = authManager.getAuthState()
    setAuthState({ ...currentState, loading: false })
    
    // Subscribe to auth changes
    const unsubscribe = authManager.subscribe((newState) => {
      setAuthState({ ...newState, loading: false })
    })
    
    return unsubscribe
  }, [])

  const signOut = () => {
    authManager.signOut()
  }

  const refreshAuth = () => {
    setAuthState(authManager.getAuthState())
  }

  // Prevent hydration mismatch by not rendering children until mounted
  if (!mounted) {
    return <AuthContext.Provider value={{
      user: null,
      isAuthenticated: false,
      loading: true,
      signOut,
      refreshAuth,
    }}>
      {children}
    </AuthContext.Provider>
  }

  return (
    <AuthContext.Provider value={{
      ...authState,
      signOut,
      refreshAuth,
      loading: false,
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