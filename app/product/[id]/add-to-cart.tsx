"use client"

import { useState } from "react"
import { useCart } from "@/components/cart-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"

interface AddToCartButtonProps {
  product: {
    id: number
    name: string
    price: number
    image: string
  }
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()
  const { toast } = useToast()

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
    })

    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.name} has been added to your cart.`,
      duration: 3000,
    })
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const increaseQuantity = () => {
    setQuantity(quantity + 1)
  }

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
          >
            <Minus className="h-3 w-3" />
            <span className="sr-only">Decrease quantity</span>
          </Button>
          <span className="px-4 text-sm">{quantity}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={increaseQuantity}>
            <Plus className="h-3 w-3" />
            <span className="sr-only">Increase quantity</span>
          </Button>
        </div>
      </div>

      <Button onClick={handleAddToCart} className="amazon-button w-full py-2">
        Add to Cart
      </Button>

      <Button className="amazon-button-secondary w-full py-2">Buy Now</Button>
    </div>
  )
}
