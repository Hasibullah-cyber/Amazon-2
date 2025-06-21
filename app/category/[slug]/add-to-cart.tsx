"use client"
import { useCart } from "@/components/cart-provider"
import { useToast } from "@/components/ui/use-toast"

interface AddToCartButtonProps {
  product: {
    id: number
    name: string
    price: number
    image: string
  }
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart } = useCart()
  const { toast } = useToast()

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    })

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
      duration: 3000,
    })
  }

  return (
    <button className="amazon-button w-full py-1 text-sm" onClick={handleAddToCart}>
      Add to Cart
    </button>
  )
}
