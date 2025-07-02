"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { adminAuthManager, AdminAuthState } from "@/lib/admin-auth"

const AdminAuthContext = createContext<AdminAuthState & {
  adminSignIn: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  adminSignOut: () => void
}>({
  admin: null,
  isAdminAuthenticated: false,
  adminSignIn: async () => ({ success: false }),
  adminSignOut: () => {}
})

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AdminAuthState>({
    admin: null,
    isAdminAuthenticated: false
  })

  useEffect(() => {
    const unsubscribe = adminAuthManager.subscribe(setAuthState)
    return unsubscribe
  }, [])

  const adminSignIn = async (username: string, password: string) => {
    try {
      // For now, use a simple authentication check
      // In production, you should implement proper JWT tokens
      if (username === 'admin' && password === 'admin123') {
        const user = {
          id: 1,
          username: 'admin',
          email: 'admin@hasibshop.com',
          role: 'admin'
        }
        setUser(user)
        setIsAuthenticated(true)
        localStorage.setItem('adminAuth', JSON.stringify(user))
        return { success: true }
      } else {
        return { success: false, error: 'Invalid credentials' }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  const adminSignOut = () => {
    adminAuthManager.adminSignOut()
  }

  return (
    <AdminAuthContext.Provider
      value={{
        ...authState,
        adminSignIn,
        adminSignOut
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider")
  }
  return context
}