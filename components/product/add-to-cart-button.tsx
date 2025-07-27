// components/product/add-to-cart-button.tsx
"use client"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { useToast } from '@/hooks/use-toast'
import { useState } from "react"

interface Product {
  id: string
  name: string
  price: number
  image: string
  stock?: number
}

interface AddToCartButtonProps {
  product: Product
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart, cartItems } = useCart()
  const { toast } = useToast()
  const [isAdding, setIsAdding] = useState(false)
  
  const existingItem = cartItems.find(item => item.id === product.id)
  const availableStock = product.stock || Infinity
  const inCartQuantity = existingItem?.quantity || 0
  const canAddMore = availableStock > inCartQuantity

  const handleAddToCart = () => {
    if (!canAddMore) {
      toast({
        title: "Cannot add more",
        description: `You've reached the maximum quantity for ${product.name}`,
        variant: "destructive",
      })
      return
    }

    setIsAdding(true)
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    })

    toast({
      title: existingItem ? "Cart updated" : "Added to cart",
      description: existingItem 
        ? `Added another ${product.name} (${inCartQuantity + 1} total)`
        : `${product.name} added to cart`,
    })
    
    setTimeout(() => setIsAdding(false), 500)
  }

  return (
    <Button 
      className="w-full py-1 text-sm bg-[#febd69] hover:bg-[#f3a847] text-black"
      onClick={handleAddToCart}
      disabled={isAdding || !canAddMore}
    >
      {isAdding ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {existingItem ? "Updating..." : "Adding..."}
        </span>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4 mr-2" />
          {canAddMore ? "Add to Cart" : "Max Reached"}
        </>
      )}
    </Button>
  )
}
