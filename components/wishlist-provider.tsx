
"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface WishlistItem {
  id: string
  name: string
  price: number
  image: string
  category: string
}

interface WishlistContextType {
  wishlistItems: WishlistItem[]
  addToWishlist: (item: WishlistItem) => void
  removeFromWishlist: (id: string) => void
  isInWishlist: (id: string) => boolean
  clearWishlist: () => void
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [mounted, setMounted] = useState(false)

  // Load wishlist from localStorage on initial render
  useEffect(() => {
    setMounted(true)
    const savedWishlist = localStorage.getItem("wishlist")
    if (savedWishlist) {
      try {
        setWishlistItems(JSON.parse(savedWishlist))
      } catch (error) {
        console.error("Failed to parse wishlist from localStorage:", error)
      }
    }
  }, [])

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("wishlist", JSON.stringify(wishlistItems))
    }
  }, [wishlistItems, mounted])

  const addToWishlist = (item: WishlistItem) => {
    setWishlistItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id)
      if (existingItem) {
        return prevItems // Item already in wishlist
      }
      return [...prevItems, item]
    })
  }

  const removeFromWishlist = (id: string) => {
    setWishlistItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  const isInWishlist = (id: string) => {
    return wishlistItems.some((item) => item.id === id)
  }

  const clearWishlist = () => {
    setWishlistItems([])
    if (mounted) {
      localStorage.removeItem("wishlist")
    }
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
