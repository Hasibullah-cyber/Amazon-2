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
    if (typeof window !== "undefined") {
      setMounted(true)
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart)
          if (Array.isArray(parsedCart)) {
            console.log("CartProvider: Loaded cart from localStorage:", parsedCart)
            setCartItems(parsedCart)
          }
        } catch (error) {
          console.error("Failed to parse cart from localStorage:", error)
          localStorage.removeItem("cart")
        }
      }
    }
  }, [])

  // Save cart and recalculate total whenever it changes
  useEffect(() => {
    if (mounted) {
      if (cartItems.length > 0) {
        localStorage.setItem("cart", JSON.stringify(cartItems))
      } else {
        localStorage.removeItem("cart")
      }
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    setTotalPrice(subtotal)
  }, [cartItems, mounted])

  // ✅ Add item or increase quantity if exists
  const addToCart = (item: CartItem) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id)

      const updatedItems = existingItem
        ? prevItems.map((i) =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + (item.quantity || 1) }
              : i
          )
        : [...prevItems, { ...item, quantity: item.quantity || 1 }]

      if (mounted) {
        localStorage.setItem("cart", JSON.stringify(updatedItems))
      }

      return updatedItems
    })
  }

  // ✅ Remove item and clear localStorage if cart is empty
  const removeFromCart = (id: number) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.filter((item) => item.id !== id)

      if (mounted) {
        if (updatedItems.length === 0) {
          localStorage.removeItem("cart")
        } else {
          localStorage.setItem("cart", JSON.stringify(updatedItems))
        }
      }

      return updatedItems
    })
  }

  // ✅ Update quantity (or remove if 0)
  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id)
      return
    }

    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )

      if (mounted) {
        localStorage.setItem("cart", JSON.stringify(updatedItems))
      }

      return updatedItems
    })
  }

  // ✅ Clear cart
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
        cart: cartItems,
        items: cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalPrice,
        total: totalPrice,
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
