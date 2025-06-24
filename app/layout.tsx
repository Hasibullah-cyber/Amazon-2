import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { CartProvider } from "@/components/cart-provider";
import { AuthProvider } from "@/components/auth-provider";
import { AdminAuthProvider } from "@/components/admin-auth-provider";
import { Toaster } from "@/components/ui/toaster";
import AIChatWrapper from "@/components/ai-chat-wrapper"
import { ChunkErrorBoundary } from "@/components/chunk-error-boundary"

const inter = Inter({ subsets: ["latin"] });

// Add chunk loading error handling
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('ChunkLoadError')) {
      console.log('ChunkLoadError detected, reloading page...');
      window.location.reload();
    }
  });
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased min-h-screen bg-background`}
        suppressHydrationWarning
      >
        <ChunkErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <AuthProvider>
              <AdminAuthProvider>
                <CartProvider>
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                      {children}
                    </main>
                    <Footer />
                  </div>
                  <AIChatWrapper />
                  <Toaster />
                </CartProvider>
              </AdminAuthProvider>
            </AuthProvider>
          </ThemeProvider>
        </ChunkErrorBoundary>
      </body>
    </html>
  );
}