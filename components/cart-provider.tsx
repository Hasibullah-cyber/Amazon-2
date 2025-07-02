"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface CartItem {
  id: number
  name: string
  price: number
  image: string
  quantity: number
}

interface CartContextType {
  cartItems: CartItem[]
  cart: CartItem[] // Alias for backward compatibility
  items: CartItem[] // Another alias
  addToCart: (item: CartItem) => void
  removeFromCart: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  totalPrice: number
  total: number // Alias for backward compatibility
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [mounted, setMounted] = useState(false)

  // Load cart from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMounted(true)
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart)
          if (Array.isArray(parsedCart)) {
            setCartItems(parsedCart)
          }
        } catch (error) {
          console.error("Failed to parse cart from localStorage:", error)
          localStorage.removeItem("cart")
        }
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (mounted && cartItems.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cartItems))
    }

    // Calculate subtotal only (without VAT)
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    setTotalPrice(subtotal)
  }, [cartItems, mounted])

  const addToCart = (item: CartItem) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id)

      if (existingItem) {
        // If item already exists, increase quantity
        return prevItems.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i))
      } else {
        // Otherwise add new item
        return [...prevItems, item]
      }
    })
  }

  const removeFromCart = (id: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id))

    // If cart becomes empty after removal, clear localStorage
    if (mounted && cartItems.length === 1) {
      localStorage.removeItem("cart")
    }
  }

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return

    setCartItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setCartItems([])
    if (mounted) {
      localStorage.removeItem("cart")
    }
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cart: cartItems, // Alias for backward compatibility
        items: cartItems, // Another alias
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalPrice,
        total: totalPrice, // Alias for backward compatibility
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
