'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCart } from '@/components/cart-provider'
import { useAuth } from '@/components/auth-provider'
import { useToast } from '@/hooks/use-toast'
import { ChunkErrorBoundary } from '@/components/chunk-error-boundary'

function CheckoutContent() {
  const router = useRouter()
  const { cartItems } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()

  const safeCartItems = Array.isArray(cartItems) ? cartItems : []
  const total = safeCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleContinueToPayment = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.city) {
      toast({
        variant: "destructive",
        title: "Required Fields Missing",
        description: "Please fill in all required fields"
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address"
      })
      return
    }

    if (formData.phone.length < 10) {
      toast({
        variant: "destructive",
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number"
      })
      return
    }

    setIsLoading(true)

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('checkout-data', JSON.stringify(formData))
        sessionStorage.setItem('checkout-data', JSON.stringify(formData))
      }

      const encodedData = encodeURIComponent(JSON.stringify(formData))
      router.push(`/checkout/payment?data=${encodedData}`)
    } catch (error) {
      console.error('Error navigating to payment:', error)
      toast({
        variant: "destructive",
        title: "Navigation Error",
        description: "Failed to proceed to payment. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (mounted && safeCartItems.length === 0) {
      router.push('/')
    }
  }, [mounted, safeCartItems.length, router])

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading checkout...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (safeCartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some items to your cart before checkout.</p>
            <Button onClick={() => router.push('/')}>Continue Shopping</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const subtotal = total
  const shipping = 100
  const finalTotal = subtotal + shipping

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="01XXXXXXXXX"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Street address, apartment, suite, etc."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {safeCartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">৳{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}

                  <hr />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>৳{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>৳{shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>৳{finalTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleContinueToPayment} 
                    className="w-full amazon-button" 
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Continue to Payment'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading checkout...</p>
            </CardContent>
          </Card>
        </div>
      }>
        <CheckoutContent />
      </Suspense>
    </ChunkErrorBoundary>
  )
                }
