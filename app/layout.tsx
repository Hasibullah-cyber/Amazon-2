// app/layout.tsx

import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { cn } from "@/lib/utils"
import ClientAppWrapper from "@/components/client-app-wrapper"

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
      <body className={cn(inter.className, "antialiased min-h-screen flex flex-col")}>
        <ClientAppWrapper>{children}</ClientAppWrapper>
      </body>
    </html>
  )
}
