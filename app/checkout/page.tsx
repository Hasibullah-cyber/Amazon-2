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
  const { cartItems, clearCart } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()

  // Safely handle cartItems with better error checking
  const [safeCartItems, setSafeCartItems] = useState<any[]>([])
  const [isLoadingCart, setIsLoadingCart] = useState(true)
  
  useEffect(() => {
    try {
      if (cartItems && Array.isArray(cartItems)) {
        setSafeCartItems(cartItems)
      } else {
        setSafeCartItems([])
      }
    } catch (error) {
      console.error('Error processing cart items:', error)
      setSafeCartItems([])
    } finally {
      setIsLoadingCart(false)
    }
  }, [cartItems])

  const total = safeCartItems.reduce((sum, item) => {
    const price = parseFloat(item?.price || 0)
    const quantity = parseInt(item?.quantity || 0)
    return sum + (price * quantity)
  }, 0)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Safely initialize form data with user info
  useEffect(() => {
    try {
      if (user) {
        setFormData(prev => ({
          ...prev,
          name: user.name || '',
          email: user.email || ''
        }))
      }
    } catch (error) {
      console.error('Error setting user data:', error)
    }
    setMounted(true)
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const { name, value } = e.target
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    } catch (error) {
      console.error('Error updating form:', error)
    }
  }

  const validateForm = () => {
    const requiredFields = ['name', 'email', 'phone', 'address', 'city']
    const missingFields = requiredFields.filter(field => !formData[field]?.trim())
    
    if (missingFields.length > 0) {
      toast({
        variant: "destructive",
        title: "Required Fields Missing",
        description: `Please fill in: ${missingFields.join(', ')}`
      })
      return false
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address"
      })
      return false
    }

    // Phone validation
    if (formData.phone.length < 10) {
      toast({
        variant: "destructive",
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number"
      })
      return false
    }

    return true
  }

  const handleContinueToPayment = async () => {
    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Store checkout data safely
      const checkoutData = {
        ...formData,
        timestamp: new Date().toISOString()
      }

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('checkout-data', JSON.stringify(checkoutData))
          sessionStorage.setItem('checkout-data', JSON.stringify(checkoutData))
        } catch (storageError) {
          console.error('Storage error:', storageError)
        }
      }

      // Navigate to payment page
      const encodedData = encodeURIComponent(JSON.stringify(checkoutData))
      await router.push(`/checkout/payment?data=${encodedData}`)
      
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

  // Redirect if cart is empty after mounting
  useEffect(() => {
    if (mounted && !isLoadingCart && safeCartItems.length === 0) {
      router.push('/')
    }
  }, [mounted, isLoadingCart, safeCartItems.length, router])

  // Loading state
  if (!mounted || isLoadingCart) {
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

  // Empty cart state
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
          {/* Customer Information Form */}
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
                      placeholder="Enter your full name"
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
                      placeholder="Enter your email"
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
                        placeholder="City"
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
                        placeholder="Postal code"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {safeCartItems.map((item, index) => (
                    <div key={item?.id || index} className="flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="font-medium">{item?.name || 'Unknown Item'}</h4>
                        <p className="text-sm text-gray-600">Qty: {item?.quantity || 0}</p>
                      </div>
                      <p className="font-medium">
                        ৳{((item?.price || 0) * (item?.quantity || 0)).toFixed(2)}
                      </p>
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
