
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CreditCard, Truck, Wallet, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { AuthModal } from "@/components/auth-modal"

export const dynamic = 'force-dynamic'

export default function PaymentPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [cart, setCart] = useState<any[]>([])
  const [selectedPayment, setSelectedPayment] = useState("Cash on Delivery")
  const [address, setAddress] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [city, setCity] = useState("")
  const [email, setEmail] = useState("")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentVerified, setPaymentVerified] = useState(false)

  useEffect(() => {
    // Check authentication first
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }

    const storedCart = localStorage.getItem("cart")
    if (storedCart) {
      setCart(JSON.parse(storedCart))
    }

    // Pre-fill user information if available
    if (user) {
      setName(user.name || "")
      setEmail(user.email || "")
    }
  }, [isAuthenticated, user])

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 120
  const vat = Math.round(subtotal * 0.1)
  const totalAmount = subtotal + shipping + vat

  const processOnlinePayment = async () => {
    setIsProcessingPayment(true)
    
    // Simulate payment processing
    try {
      // In a real app, you would integrate with a payment gateway here
      // For demo purposes, we'll simulate a payment process
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Simulate payment success (in real app, this would come from payment gateway)
      const paymentSuccess = Math.random() > 0.1 // 90% success rate for demo
      
      if (paymentSuccess) {
        setPaymentVerified(true)
        return true
      } else {
        throw new Error("Payment failed")
      }
    } catch (error) {
      alert("Payment failed. Please try again.")
      return false
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }

    if (!name || !address || !phone || !city || !email) {
      alert("Please fill in all required fields")
      return
    }

    // For online payment, verify payment first
    if (selectedPayment === "Online Payment") {
      if (!paymentVerified) {
        const paymentSuccess = await processOnlinePayment()
        if (!paymentSuccess) {
          return
        }
      }
    }

    const order = {
      orderId: "HS-" + Date.now(),
      cartItems: cart,
      subtotal,
      vat,
      shipping,
      totalAmount,
      paymentMethod: selectedPayment,
      transactionId: selectedPayment === "Online Payment" ? "TXN-" + Date.now() : "",
      estimatedDelivery: "1-2 business days",
      name,
      address,
      phone,
      city,
      email,
      userId: user?.id,
      paymentVerified: selectedPayment === "Online Payment" ? paymentVerified : true
    }

    localStorage.setItem("order", JSON.stringify(order))
    localStorage.removeItem("cart")
    router.push("/order-confirmation")
  }

  // Redirect to home if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="p-8 max-w-md mx-auto text-center">
          <Lock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to proceed with checkout</p>
          <Button onClick={() => setShowAuthModal(true)} className="w-full">
            Sign In to Continue
          </Button>
        </Card>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
        {/* Payment Options */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-2 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" /> Payment Method
          </h2>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="payment"
                value="Online Payment"
                checked={selectedPayment === "Online Payment"}
                onChange={(e) => {
                  setSelectedPayment(e.target.value)
                  setPaymentVerified(false)
                }}
              />
              <span>Online Payment (Secure)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="payment"
                value="Cash on Delivery"
                checked={selectedPayment === "Cash on Delivery"}
                onChange={(e) => setSelectedPayment(e.target.value)}
              />
              <span>Cash on Delivery</span>
            </label>
          </div>

          {selectedPayment === "Online Payment" && !paymentVerified && (
            <div className="mt-4 p-4 border rounded-lg bg-blue-50">
              <p className="text-sm text-blue-800 mb-3">
                Complete your payment to proceed with the order
              </p>
              <Button 
                onClick={processOnlinePayment} 
                disabled={isProcessingPayment}
                className="w-full"
              >
                {isProcessingPayment ? "Processing Payment..." : "Pay Now"}
              </Button>
            </div>
          )}

          {selectedPayment === "Online Payment" && paymentVerified && (
            <div className="mt-4 p-4 border rounded-lg bg-green-50">
              <p className="text-sm text-green-800">
                ✅ Payment verified successfully
              </p>
            </div>
          )}
        </Card>

        {/* Address & Summary */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-2 flex items-center">
            <Truck className="w-5 h-5 mr-2" /> Shipping Information
          </h2>
          <input
            type="text"
            placeholder="Your Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border px-3 py-2 rounded text-sm"
            required
          />
          <input
            type="email"
            placeholder="Email Address *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded text-sm"
            required
          />
          <input
            type="text"
            placeholder="Address *"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border px-3 py-2 rounded text-sm"
            required
          />
          <input
            type="text"
            placeholder="City *"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full border px-3 py-2 rounded text-sm"
            required
          />
          <input
            type="text"
            placeholder="Phone *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border px-3 py-2 rounded text-sm"
            required
          />

          <h3 className="text-lg font-medium mt-4">Order Summary</h3>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>৳{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>৳{shipping}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT (10%):</span>
              <span>৳{vat}</span>
            </div>
            <hr />
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>৳{totalAmount}</span>
            </div>
          </div>

          <Button 
            className="w-full mt-4" 
            onClick={handlePlaceOrder}
            disabled={
              !name || !address || !phone || !city || !email ||
              (selectedPayment === "Online Payment" && !paymentVerified) ||
              isProcessingPayment
            }
          >
            {isProcessingPayment ? "Processing..." : "Place Order"}
          </Button>
        </Card>
      </div>
    </div>
  )
}
