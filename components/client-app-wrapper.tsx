// components/client-app-wrapper.tsx

"use client"

import { useEffect } from "react"
import { CartProvider } from "@/components/cart-provider"
import { WishlistProvider } from "@/components/wishlist-provider"
import { AuthProvider } from "@/components/auth-provider"
import { AdminAuthProvider } from "@/components/admin-auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import RealTimeNotifications from "@/components/real-time-notifications"
import Navbar from "@/components/navbar"
import AIChatAssistant from "@/components/ai-chat-assistant"
import Footer from "@/components/footer"
import { setupFrontendErrorLogger } from "@/lib/debugClient"

export default function ClientAppWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    setupFrontendErrorLogger()
  }, [])

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <AuthProvider>
        <AdminAuthProvider>
          <WishlistProvider>
            <CartProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <AIChatAssistant />
              <Toaster />
              <RealTimeNotifications />
            </CartProvider>
          </WishlistProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
