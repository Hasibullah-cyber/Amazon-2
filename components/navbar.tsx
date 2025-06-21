"use client"

import { useState } from "react"
import Link from "next/link"
import { ShoppingCart, Menu, X, User, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-provider"
import CartDrawer from "@/components/cart-drawer"
import RegularSearch from "@/components/regular-search"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { cartItems } = useCart()

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0)

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
              <div className="text-gray-300 text-xs">Hello, Sign in</div>
              <div className="font-bold">Account & Lists</div>
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
          </div>
        </div>
      )}

      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  )
}
