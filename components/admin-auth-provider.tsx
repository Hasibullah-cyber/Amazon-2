
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
    return await adminAuthManager.adminSignIn(username, password)
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
