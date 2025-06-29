import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { CartProvider } from "@/components/cart-provider"
import { WishlistProvider } from "@/components/wishlist-provider"
import { AuthProvider } from "@/components/auth-provider"
import { AdminAuthProvider } from "@/components/admin-auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import RealTimeNotifications from "@/components/real-time-notifications"
import { cn } from "@/lib/utils"
import "@/lib/test-data"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Hasib Shop - Premium Online Shopping Experience",
  description: "Discover amazing products with fast delivery and great customer service.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "antialiased")}>
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
                  {children}
                  <Toaster />
                  <RealTimeNotifications />
                </CartProvider>
              </WishlistProvider>
            </AdminAuthProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}