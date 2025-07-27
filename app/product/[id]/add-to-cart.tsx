"use client"
import { useState, useEffect } from "react"
import { useCart } from "@/components/cart-provider"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Minus, Plus, ShoppingCart, Zap } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

interface AddToCartButtonProps {
  product: {
    id: string // Changed to string to match cart context
    name: string
    price: number
    image: string
    stock: number
  }
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const { addToCart, cartItems } = useCart()
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()
  const [isAdding, setIsAdding] = useState(false)
  const [isBuyingNow, setIsBuyingNow] = useState(false)

  // Find existing item in cart
  const existingItem = cartItems.find(item => item.id === product.id)
  
  // Adjust max quantity based on stock
  const maxQuantity = Math.min(product.stock, existingItem ? (product.stock - existingItem.quantity) : product.stock)

  useEffect(() => {
    // Reset quantity if product changes
    setQuantity(1)
  }, [product.id])

  const handleAddToCart = () => {
    setIsAdding(true)
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
    })

    toast({
      title: existingItem ? "Cart updated" : "Added to cart",
      description: existingItem 
        ? `Added ${quantity} more to ${product.name} (${existingItem.quantity + quantity} total)`
        : `${quantity} x ${product.name} added to cart`,
      duration: 3000,
    })
    
    setTimeout(() => setIsAdding(false), 500)
  }

  const handleBuyNow = () => {
    setIsBuyingNow(true)
    
    // Add to cart first
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
    })

    // Redirect to checkout
    if (isAuthenticated) {
      router.push("/checkout")
    } else {
      // Save current URL for redirect after login
      sessionStorage.setItem("preAuthUrl", "/checkout")
      router.push("/login")
    }
    
    setTimeout(() => setIsBuyingNow(false), 500)
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const increaseQuantity = () => {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1)
    }
  }

  // Calculate if we can add more of this product
  const canAddMore = maxQuantity > 0
  const maxReached = quantity >= maxQuantity

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <span className="text-sm font-medium mr-4">Quantity:</span>
        <div className="flex items-center border rounded-md border-gray-300">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-none"
            onClick={decreaseQuantity}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="px-4 text-sm min-w-[30px] text-center">{quantity}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-none" 
            onClick={increaseQuantity}
            disabled={maxReached}
            aria-label="Increase quantity"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        {maxReached && (
          <span className="ml-3 text-xs text-red-600">
            Max {maxQuantity} per order
          </span>
        )}
      </div>

      <div className="space-y-2">
        <Button 
          onClick={handleAddToCart} 
          className="w-full py-2 bg-[#febd69] hover:bg-[#f3a847] text-black"
          disabled={!canAddMore || isAdding}
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
              {canAddMore ? "Add to Cart" : "Out of Stock"}
            </>
          )}
        </Button>

        <Button 
          onClick={handleBuyNow} 
          className="w-full py-2 bg-[#FFA41C] hover:bg-[#fa8c00] text-black"
          disabled={!canAddMore || isBuyingNow}
        >
          {isBuyingNow ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Buy Now
            </>
          )}
        </Button>
      </div>
      
      {existingItem && (
        <p className="text-sm text-green-600 mt-2">
          {existingItem.quantity} already in your cart
        </p>
      )}
    </div>
  )
              }
