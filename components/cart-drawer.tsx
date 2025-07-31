"use client"
import { X, Plus, Minus, ShoppingCart } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-provider"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  onCheckout?: () => void
}

export default function CartDrawer({ open, onClose, onCheckout }: CartDrawerProps) {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart()
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    
    if (open) {
      document.body.style.overflow = "hidden"
      document.addEventListener("keydown", handleEsc)
    } else {
      document.body.style.overflow = "auto"
    }
    
    return () => {
      document.body.style.overflow = "auto"
      document.removeEventListener("keydown", handleEsc)
    }
  }, [open, onClose])

  const handleCheckout = async () => {
    setIsProcessing(true)
    
    if (cartItems.length === 0) {
      toast({
        title: "Your cart is empty",
        description: "Add items to your cart before checkout",
        duration: 3000,
      })
      setIsProcessing(false)
      return
    }

    if (!isAuthenticated) {
      sessionStorage.setItem("preAuthUrl", "/checkout")
      toast({
        title: "Sign in required",
        description: "Please sign in to proceed to checkout",
        duration: 3000,
      })
      onClose() // Close drawer before redirect
      router.push("/login")
      setIsProcessing(false)
      return
    }

    onClose() // Close drawer before checkout

    if (onCheckout) {
      onCheckout()
    } else {
      router.push("/checkout")
    }
    
    setIsProcessing(false)
  }

  const handleClearCart = () => {
    clearCart()
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
      duration: 3000,
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity duration-300" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className="absolute inset-y-0 right-0 w-full max-w-md flex">
        <div className="relative w-full bg-white flex flex-col overflow-y-auto shadow-xl transform transition ease-in-out duration-300 translate-x-0">
          <div className="flex items-center justify-between p-4 bg-[#232f3e] text-white">
            <h2 className="text-xl font-bold">Shopping Cart</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="text-white hover:bg-gray-700"
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto mb-4">
                  <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto" />
                </div>
                <p className="text-gray-500 text-lg mb-2">Your cart is empty</p>
                <p className="text-gray-400 mb-6">Add items to get started</p>
                <Button 
                  className="amazon-button w-48" 
                  onClick={onClose}
                >
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                  <h3 className="amazon-title">Items in your cart</h3>
                  <Button 
                    variant="link"
                    className="text-red-600 hover:text-red-800 text-sm"
                    onClick={handleClearCart}
                  >
                    Clear cart
                  </Button>
                </div>
                
                <ul className="divide-y">
                  {cartItems.map((item) => (
                    <li key={`${item.id}-${item.size || ''}-${item.color || ''}`} className="py-4 flex">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden border border-gray-200 rounded-md">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={96}
                          height={96}
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }}
                        />
                      </div>

                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between">
                            <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                              {item.name}
                            </h3>
                            <p className="ml-4 amazon-price">৳{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                          
                          <p className="mt-1 text-xs text-gray-500">৳{item.price.toFixed(2)} each</p>
                          
                          {/* Display variant info if exists */}
                          {item.size && (
                            <p className="mt-1 text-xs text-gray-500">Size: {item.size}</p>
                          )}
                          {item.color && (
                            <p className="mt-1 text-xs text-gray-500">Color: {item.color}</p>
                          )}
                          
                          <p className="mt-1 text-xs text-[#007600]">In Stock</p>
                        </div>

                        <div className="flex flex-1 items-end justify-between text-sm mt-2">
                          <div className="flex items-center border rounded-md border-gray-300">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="px-2 text-sm min-w-[30px] text-center">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-sm amazon-link hover:text-red-600"
                            onClick={() => {
                              removeFromCart(item.id)
                              toast({
                                title: "Removed from cart",
                                description: `${item.name} has been removed from your cart`,
                                duration: 3000,
                              })
                            }}
                            aria-label="Remove item"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Subtotal ({cartItems.reduce((total, item) => total + item.quantity, 0)} items)</p>
                <p className="amazon-price">৳{totalPrice.toFixed(2)}</p>
              </div>
              
              <div className="flex justify-between text-sm text-gray-500">
                <p>VAT (10%)</p>
                <p>৳{(totalPrice * 0.1).toFixed(2)}</p>
              </div>
              
              <div className="flex justify-between text-base font-bold">
                <p>Total</p>
                <p className="amazon-price">৳{(totalPrice * 1.1).toFixed(2)}</p>
              </div>
              
              <p className="text-sm text-gray-500">Shipping calculated at checkout.</p>
              
              <div className="grid gap-3">
                <Button 
                  className="amazon-button w-full py-3" 
                  onClick={handleCheckout}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    "Proceed to Checkout"
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full py-3 text-gray-700 hover:bg-gray-100"
                  onClick={onClose}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
