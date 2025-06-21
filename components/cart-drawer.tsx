"use client"

import { X, Plus, Minus } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-provider"
import { useToast } from "@/components/ui/use-toast"

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart()
  const { toast } = useToast()

  const handleCheckout = () => {
    // Redirect to location selection page
    window.location.href = "/checkout/payment"
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 w-full max-w-md flex">
        <div className="relative w-full bg-white flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between p-4 bg-[#232f3e] text-white">
            <h2 className="text-xl font-bold">Shopping Cart</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Your Amazon Cart is empty</p>
                <Button className="amazon-button mt-4" onClick={onClose}>
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div>
                <div className="mb-4 pb-2 border-b border-gray-200">
                  <h3 className="amazon-title">Items in your cart</h3>
                </div>
                <ul className="divide-y">
                  {cartItems.map((item) => (
                    <li key={item.id} className="py-4 flex">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden border border-gray-200">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={96}
                          height={96}
                          className="h-full w-full object-contain"
                        />
                      </div>

                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between">
                            <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                            <p className="ml-4 amazon-price">৳{(item.price * item.quantity * 110).toFixed(2)}</p>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">৳{(item.price * 110).toFixed(2)} each</p>
                          <p className="mt-1 text-xs text-[#007600]">In Stock</p>
                        </div>

                        <div className="flex flex-1 items-end justify-between text-sm">
                          <div className="flex items-center border rounded-md border-gray-300">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                              <span className="sr-only">Decrease quantity</span>
                            </Button>
                            <span className="px-2 text-sm">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                              <span className="sr-only">Increase quantity</span>
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-sm amazon-link"
                            onClick={() => removeFromCart(item.id)}
                          >
                            Delete
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
                <p className="amazon-price">৳{(totalPrice * 110).toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <p>VAT (10%)</p>
                <p>৳{(totalPrice * 10).toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-base font-bold">
                <p>Total</p>
                <p className="amazon-price">৳{(totalPrice * 110).toFixed(2)}</p>
              </div>
              <p className="text-sm text-gray-500">Shipping calculated at checkout.</p>
              <div className="grid gap-3">
                <Button className="amazon-button w-full py-2" onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
