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

  // Ensure cartItems is an array to prevent length errors
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
    // Validate form
    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.city) {
      toast({
        variant: "destructive",
        title: "Required Fields Missing",
        description: "Please fill in all required fields"
      })
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address"
      })
      return
    }

    // Phone validation
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
      // Store checkout data in multiple ways for reliability
      if (typeof window !== 'undefined') {
        localStorage.setItem('checkout-data', JSON.stringify(formData))
        sessionStorage.setItem('checkout-data', JSON.stringify(formData))
      }

      // Navigate to payment page with data
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

  if (!mounted) return null

  return (
    <div className="flex justify-center mt-10">
      <Card className="w-full max-w-lg p-4">
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input name="name" value={formData.name} onChange={handleInputChange} />
            </div>
            <div>
              <Label>Email</Label>
              <Input name="email" value={formData.email} onChange={handleInputChange} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input name="phone" value={formData.phone} onChange={handleInputChange} />
            </div>
            <div>
              <Label>Address</Label>
              <Input name="address" value={formData.address} onChange={handleInputChange} />
            </div>
            <div>
              <Label>City</Label>
              <Input name="city" value={formData.city} onChange={handleInputChange} />
            </div>
            <div>
              <Label>Postal Code</Label>
              <Input name="postalCode" value={formData.postalCode} onChange={handleInputChange} />
            </div>
            <div className="font-semibold">Total: ${total.toFixed(2)}</div>
            <Button onClick={handleContinueToPayment} disabled={isLoading} className="w-full">
              {isLoading ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<div>Loading...</div>}>
        <CheckoutContent />
      </Suspense>
    </ChunkErrorBoundary>
  )
}
