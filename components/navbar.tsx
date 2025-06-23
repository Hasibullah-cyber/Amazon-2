"use client"

import { useState } from "react"
import Link from "next/link"
import { ShoppingCart, Menu, X, User, MapPin, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-provider"
import { useAuth } from "@/components/auth-provider"
import { useAdminAuth } from "@/components/admin-auth-provider"
import { AuthModal } from "@/components/auth-modal"
import { AdminLoginModal } from "@/components/admin-login-modal"
import CartDrawer from "@/components/cart-drawer"
import RegularSearch from "@/components/regular-search"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false)
  const { cartItems } = useCart()
  const { user, isAuthenticated, signOut } = useAuth()
  const { admin, isAdminAuthenticated, adminSignOut } = useAdminAuth()

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0)

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode)
    setIsAuthOpen(true)
  }

  const handleSignOut = () => {
    signOut()
    setIsUserMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Main header */}
      <div className="amazon-header">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center h-16">
            {/* Logo */}
            <Link href="/" className="mr-4 flex-shrink-0">
              <span className="text-2xl font-bold text-white">Hasib Shop</span>
            </Link>

            {/* Delivery location */}
            <div className="hidden md:flex items-center mr-4 text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              <div>
                <div className="text-gray-300 text-xs">Deliver to</div>
                <div className="font-bold">Bangladesh</div>
              </div>
            </div>

            {/* Search bar */}
            <div className="flex flex-1 mx-4">
              <RegularSearch />
            </div>

            {/* Account & Orders */}
            <div className="hidden md:block mr-4 text-sm">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden md:block">{user?.name}</span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50">
                      <div className="py-1">
                        <div className="px-4 py-2 border-b">
                          <p className="font-medium">{user?.name}</p>
                          <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>
                        <Link
                          href="/track-order"
                          className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Track Order
                        </Link>
                        {isAdminAuthenticated ? (
                          <Link
                            href="/admin"
                            className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 text-blue-600"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Admin Panel
                          </Link>
                        ) : (
                          <button
                            onClick={() => {
                              setIsAdminLoginOpen(true)
                              setIsUserMenuOpen(false)
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 text-blue-600"
                          >
                            Admin Login
                          </button>
                        )}
                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openAuthModal('signin')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={() => setIsAdminLoginOpen(true)}
                    className="px-4 py-2 text-sm font-medium bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Admin
                  </button>
                </div>
              )}
            </div>

            <div className="hidden md:block mr-4 text-sm">
              <div className="text-gray-300 text-xs">Returns</div>
              <div className="font-bold">& Orders</div>
            </div>

            {/* Cart */}
            <button
              className="flex items-center text-white"
              onClick={() => setIsCartOpen(true)}
              aria-label="Shopping cart"
            >
              <div className="relative">
                <ShoppingCart className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#f08804] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="ml-1 font-bold">Cart</span>
            </button>

            {/* Mobile menu button */}
            <div className="md:hidden ml-4">
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
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
              <Link href="/category/home-living" className="text-white hover:text-gray-300">
                Home & Living
              </Link>
              <Link href="/category/beauty" className="text-white hover:text-gray-300">
                Beauty
              </Link>
              <Link href="/#about" className="text-white hover:text-gray-300 hidden md:block">
                About Us
              </Link>
              <Link href="/#contact" className="text-white hover:text-gray-300 hidden md:block">
                Contact
              </Link>
              <Link href="/track-order">
                <Button variant="outline" size="sm" className="hidden md:flex">
                  Track Order
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#232f3e] border-t border-gray-700">
          <div className="container mx-auto px-4 py-3 space-y-3">
            <div className="flex items-center space-x-3 text-white">
              <User className="h-5 w-5" />
              <span className="font-medium">Hello, Sign in</span>
            </div>
            <Link
              href="/#categories"
              className="block text-white hover:text-gray-300"
              onClick={() => setIsMenuOpen(false)}
            >
              All Categories
            </Link>
            <Link
              href="/category/electronics"
              className="block text-white hover:text-gray-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Electronics
            </Link>
            <Link
              href="/category/fashion"
              className="block text-white hover:text-gray-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Fashion
            </Link>
            <Link
              href="/category/home-living"
              className="block text-white hover:text-gray-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Home & Living
            </Link>
            <Link
              href="/category/beauty"
              className="block text-white hover:text-gray-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Beauty
            </Link>
            <Link href="/#about" className="block text-white hover:text-gray-300" onClick={() => setIsMenuOpen(false)}>
              About Us
            </Link>
            <Link
              href="/#contact"
              className="block text-white hover:text-gray-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
              {isAuthenticated ? (
                <div className="border-t pt-4 mt-4">
                  <div className="px-4 py-2">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  <Link
                    href="/track-order"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-package h-4 w-4 mr-2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="m12 22 8-4"/><path d="M4 18l8-4"/><path d="m2 12 8-4 8 4"/></svg>
                    My Orders
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut()
                      setIsMenuOpen(false)
                    }}
                    className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="border-t pt-4 mt-4 space-y-2">
                  <button
                    onClick={() => {
                      openAuthModal('signin')
                      setIsMenuOpen(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      openAuthModal('signup')
                      setIsMenuOpen(false)
                    }}
                    className="block w-full text-left px-4 py-2 bg-blue-600 text-white rounded-md mx-4"
                  >
                    Sign Up
                  </button>
                </div>
              )}
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