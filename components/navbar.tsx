
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingCart, Menu, X, User, MapPin, LogOut, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-provider"
import { useWishlist } from "@/components/wishlist-provider"
import { useAuth } from "@/components/auth-provider"
import { useAdminAuth } from "@/components/admin-auth-provider"
import { AuthModal } from "@/components/auth-modal"
import { AdminLoginModal } from "@/components/admin-login-modal"
import CartDrawer from "@/components/cart-drawer"
import AIEnhancedSearch from "@/components/ai-enhanced-search"
import { useToast } from "@/hooks/use-toast"
import { Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const { cartItems } = useCart()
  const { wishlistItems } = useWishlist()
  const { user, isAuthenticated, signOut } = useAuth()
  const { admin, isAdminAuthenticated, adminSignOut } = useAdminAuth()
  const { toast } = useToast()

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0)
  

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode)
    setIsAuthOpen(true)
  }

  const handleSignOut = () => {
    signOut()
    setIsUserMenuOpen(false)
    toast({
      title: "Signed out successfully",
      description: "You have been signed out of your account.",
      duration: 3000,
    })
  }

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Main header */}
      <div className="amazon-header">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <span className="text-xl sm:text-2xl font-bold text-white">Hasib Shop</span>
            </Link>

            {/* Search bar - takes most space */}
            <div className="flex-1 max-w-3xl">
              <AIEnhancedSearch />
            </div>

            {/* Right side icons */}
            <div className="flex items-center gap-2">
              {/* Profile Icon */}
              {isAuthenticated ? (
                <div className="flex items-center text-white p-3 hover:bg-gray-700 rounded-md transition-colors min-w-[44px] min-h-[44px]">
                  <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => openAuthModal('signin')}
                  className="flex items-center text-white p-3 hover:bg-gray-700 rounded-md transition-colors min-w-[44px] min-h-[44px]"
                  aria-label="Profile"
                >
                  <User className="h-6 w-6" />
                </button>
              )}

              

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="flex items-center text-white p-3 hover:bg-gray-700 rounded-md transition-colors min-w-[44px] min-h-[44px]"
                aria-label="Wishlist"
              >
                <div className="relative">
                  <Heart className="h-6 w-6" />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#f08804] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-bold">
                      {wishlistItems.length}
                    </span>
                  )}
                </div>
              </Link>

              {/* Cart */}
              <button
                className="flex items-center text-white p-3 hover:bg-gray-700 rounded-md transition-colors min-w-[44px] min-h-[44px]"
                onClick={() => setIsCartOpen(true)}
                aria-label="Shopping cart"
              >
                <div className="relative">
                  <ShoppingCart className="h-6 w-6" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#f08804] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-bold">
                      {totalItems}
                    </span>
                  )}
                </div>
              </button>

              {/* Three bars menu */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center text-white p-3 hover:bg-gray-700 rounded-md transition-colors min-w-[44px] min-h-[44px]"
                  aria-label="Menu"
                >
                  <div className="flex flex-col space-y-1">
                    <div className="w-5 h-0.5 bg-white"></div>
                    <div className="w-5 h-0.5 bg-white"></div>
                    <div className="w-5 h-0.5 bg-white"></div>
                  </div>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border z-50">
                    <div className="py-2">
                      {isAuthenticated ? (
                        <>
                          <div className="px-4 py-3 border-b bg-gray-50">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                                {user?.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{user?.name}</p>
                                <p className="text-sm text-gray-500">{user?.email}</p>
                              </div>
                            </div>
                          </div>

                          <Link
                            href="/order-history"
                            className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 text-gray-700"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            My Orders
                          </Link>

                          <Link
                            href="/track-order"
                            className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 text-gray-700"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Track Order
                          </Link>

                          <div className="border-t my-1"></div>

                          {isAdminAuthenticated ? (
                            <Link
                              href="/admin"
                              className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 text-blue-600"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Admin Panel
                            </Link>
                          ) : (
                            <button
                              onClick={() => {
                                setIsAdminLoginOpen(true)
                                setIsUserMenuOpen(false)
                              }}
                              className="flex items-center w-full px-4 py-3 text-sm hover:bg-gray-50 text-blue-600"
                            >
                              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                              Admin Login
                            </button>
                          )}

                          <div className="border-t my-1"></div>

                          <button
                            onClick={handleSignOut}
                            className="flex items-center w-full px-4 py-3 text-sm hover:bg-gray-50 text-red-600"
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            Sign Out
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="px-4 py-3 border-b bg-gray-50">
                            <p className="text-sm text-gray-600">Welcome to Hasib Shop</p>
                          </div>

                          <button
                            onClick={() => {
                              openAuthModal('signin')
                              setIsUserMenuOpen(false)
                            }}
                            className="flex items-center w-full px-4 py-3 text-sm hover:bg-gray-50 text-blue-600"
                          >
                            <User className="w-4 h-4 mr-3" />
                            Sign In
                          </button>

                          <button
                            onClick={() => {
                              openAuthModal('signup')
                              setIsUserMenuOpen(false)
                            }}
                            className="flex items-center w-full px-4 py-3 text-sm hover:bg-gray-50 text-green-600"
                          >
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Sign Up
                          </button>

                          <div className="border-t my-1"></div>

                          <button
                            onClick={() => {
                              setIsAdminLoginOpen(true)
                              setIsUserMenuOpen(false)
                            }}
                            className="flex items-center w-full px-4 py-3 text-sm hover:bg-gray-50 text-gray-600"
                          >
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Admin Access
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile hamburger menu */}
              <div className="md:hidden">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                  className="text-white"
                >
                  {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation bar */}
      <div className="amazon-nav">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-10">
            <div className="flex items-center space-x-4 text-sm">
              <Link href="/#categories" className="text-white hover:text-gray-300">
                All Categories
              </Link>
              <Link href="/category/electronics" className="text-white hover:text-gray-300">
                Electronics
              </Link>
              <Link href="/category/fashion" className="text-white hover:text-gray-300">
                Fashion
              </Link>
              <Link href="/category/home-living" className="text-white hover:text-gray-300 hidden sm:block">
                Home & Living
              </Link>
              <Link href="/category/beauty" className="text-white hover:text-gray-300 hidden sm:block">
                Beauty
              </Link>
              <Link href="/#about" className="text-white hover:text-gray-300 hidden lg:block">
                About Us
              </Link>
              <Link href="/#contact" className="text-white hover:text-gray-300 hidden lg:block">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#232f3e] border-t border-gray-700">
          <div className="container mx-auto px-4 py-3 space-y-2">
            <Link
              href="/#categories"
              className="block text-white hover:text-gray-300 py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              All Categories
            </Link>
            <Link
              href="/category/electronics"
              className="block text-white hover:text-gray-300 py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Electronics
            </Link>
            <Link
              href="/category/fashion"
              className="block text-white hover:text-gray-300 py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Fashion
            </Link>
            <Link
              href="/category/home-living"
              className="block text-white hover:text-gray-300 py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home & Living
            </Link>
            <Link
              href="/category/beauty"
              className="block text-white hover:text-gray-300 py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Beauty
            </Link>
            <Link 
              href="/#about" 
              className="block text-white hover:text-gray-300 py-2" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              href="/#contact"
              className="block text-white hover:text-gray-300 py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        </div>
      )}

      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        initialMode={authMode}
      />
      <AdminLoginModal 
        isOpen={isAdminLoginOpen} 
        onClose={() => setIsAdminLoginOpen(false)} 
      />
    </header>
  )
}
