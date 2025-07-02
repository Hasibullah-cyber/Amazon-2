
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useCart } from '@/components/cart-provider'
import { useAuth } from '@/components/auth-provider'
import { useToast } from '@/hooks/use-toast'
import { ChunkErrorBoundary } from '@/components/chunk-error-boundary'

interface CheckoutData {
  name: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
}

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { cartItems, totalPrice, clearCart } = useCart()
  const items = cartItems || []
  const total = totalPrice || 0
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [paymentMethod, setPaymentMethod] = useState('cash-on-delivery')
  const [isProcessing, setIsProcessing] = useState(false)
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)

  useEffect(() => {
    console.log('PaymentContent: Loading checkout data...')
    
    // Get checkout data from URL params first
    const dataParam = searchParams.get('data')
    if (dataParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(dataParam))
        console.log('PaymentContent: Data from URL params:', decoded)
        setCheckoutData(decoded)
        return
      } catch (error) {
        console.error('Error parsing checkout data from URL:', error)
      }
    }

    // Fallback to sessionStorage first, then localStorage
    if (typeof window !== 'undefined') {
      let stored = sessionStorage.getItem('checkout-data')
      if (!stored) {
        stored = localStorage.getItem('checkout-data')
      }
      
      if (stored) {
        try {
          const parsedData = JSON.parse(stored)
          console.log('PaymentContent: Data from storage:', parsedData)
          setCheckoutData(parsedData)
          return
        } catch (error) {
          console.error('Error parsing stored checkout data:', error)
        }
      }
    }

    // If no checkout data found, redirect back to checkout
    console.log('PaymentContent: No checkout data found, redirecting...')
    router.push('/checkout')
  }, [searchParams, router])

  // Separate effect for cart validation
  useEffect(() => {
    if (items.length === 0) {
      console.log('PaymentContent: No cart items, redirecting to cart...')
      router.push('/cart')
      return
    }
  }, [items.length, router])

  const handlePlaceOrder = async () => {
    if (!checkoutData) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Missing checkout information. Please go back to checkout."
      })
      return
    }

    if (items.length === 0) {
      toast({
        variant: "destructive",
        title: "Error", 
        description: "Your cart is empty"
      })
      return
    }

    setIsProcessing(true)

    try {
      const orderData = {
        customerName: checkoutData.name,
        customerEmail: checkoutData.email,
        customerPhone: checkoutData.phone,
        address: checkoutData.address,
        city: checkoutData.city,
        postalCode: checkoutData.postalCode,
        country: 'Bangladesh',
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        subtotal: total,
        shipping: 100,
        tax: 0,
        totalAmount: total + 100,
        paymentMethod: paymentMethod === 'cash-on-delivery' ? 'Cash on Delivery' : 'Online Payment'
      }

      console.log('Placing order with data:', orderData)

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      })

      const result = await response.json()
      console.log('Order response:', result)

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Failed to place order')
      }

      if (result.success) {
        // Clear cart
        clearCart()
        
        // Clear checkout data
        if (typeof window !== 'undefined') {
          localStorage.removeItem('checkout-data')
        }

        toast({
          title: "Order Placed Successfully!",
          description: `Your order ${result.orderId} has been placed successfully.`
        })

        // Redirect to order confirmation with order data
        const confirmationData = {
          orderId: result.orderId,
          trackingNumber: result.trackingNumber,
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          totalAmount: orderData.totalAmount,
          paymentMethod: orderData.paymentMethod,
          estimatedDelivery: result.order?.estimatedDelivery || '3-5 business days',
          items: orderData.items
        }

        const encodedData = encodeURIComponent(JSON.stringify(confirmationData))
        router.push(`/order-confirmation?data=${encodedData}`)
      } else {
        throw new Error(result.error || 'Failed to place order')
      }

    } catch (error) {
      console.error('Error placing order:', error)
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: error instanceof Error ? error.message : "Failed to place order. Please try again."
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (!checkoutData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-4">Loading Payment Page...</h2>
            <p className="text-gray-600">Please wait while we load your checkout information.</p>
            <Button 
              onClick={() => router.push('/checkout')} 
              variant="outline" 
              className="mt-4"
            >
              Return to Checkout
            </Button>
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
        <h1 className="text-3xl font-bold mb-8">Payment</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Method */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash-on-delivery" id="cod" />
                    <Label htmlFor="cod">Cash on Delivery</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="online" id="online" />
                    <Label htmlFor="online">Online Payment (Coming Soon)</Label>
                  </div>
                </RadioGroup>

                {paymentMethod === 'online' && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">
                      Online payment options will be available soon. Please use Cash on Delivery for now.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {checkoutData.name}</p>
                  <p><strong>Email:</strong> {checkoutData.email}</p>
                  <p><strong>Phone:</strong> {checkoutData.phone}</p>
                  <p><strong>Address:</strong> {checkoutData.address}</p>
                  <p><strong>City:</strong> {checkoutData.city}</p>
                  <p><strong>Postal Code:</strong> {checkoutData.postalCode}</p>
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
                  {items.map((item) => (
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
                    onClick={handlePlaceOrder} 
                    className="w-full amazon-button" 
                    size="lg"
                    disabled={isProcessing || paymentMethod === 'online'}
                  >
                    {isProcessing ? 'Processing...' : 'Place Order'}
                  </Button>

                  {paymentMethod === 'online' && (
                    <p className="text-sm text-center text-gray-600">
                      Please select Cash on Delivery to continue
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading payment information...</p>
            </CardContent>
          </Card>
        </div>
      }>
        <PaymentContent />
      </Suspense>
    </ChunkErrorBoundary>
  )
}
