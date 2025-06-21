"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CreditCard, Truck, Wallet } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PaymentPage() {
  const router = useRouter()
  const [cart, setCart] = useState<any[]>([])
  const [selectedPayment, setSelectedPayment] = useState("Cash on Delivery")
  const [address, setAddress] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [city, setCity] = useState("")

  useEffect(() => {
    const storedCart = localStorage.getItem("cart")
    if (storedCart) {
      setCart(JSON.parse(storedCart))
    }
  }, [])

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 120
  const vat = Math.round(subtotal * 0.1)
  const totalAmount = subtotal + shipping + vat

  const handlePlaceOrder = () => {
    const order = {
      orderId: "#HS-" + Date.now(),
      cartItems: cart,
      subtotal,
      vat,
      shipping,
      totalAmount,
      paymentMethod: selectedPayment,
      transactionId: "",
      estimatedDelivery: "1-2 business days",
      name,
      address,
      phone,
      city,
    }

    localStorage.setItem("order", JSON.stringify(order))
    localStorage.removeItem("cart")
    router.push("/order-confirmation")
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
                onChange={(e) => setSelectedPayment(e.target.value)}
              />
              <span>Online Payment</span>
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
        </Card>

        {/* Address & Summary */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-2 flex items-center">
            <Truck className="w-5 h-5 mr-2" /> Shipping Information
          </h2>
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border px-3 py-2 rounded text-sm"
          />
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border px-3 py-2 rounded text-sm"
          />
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full border px-3 py-2 rounded text-sm"
          />
          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border px-3 py-2 rounded text-sm"
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

          <Button className="w-full mt-4" onClick={handlePlaceOrder}>
            Place Order
          </Button>
        </Card>
      </div>
    </div>
  )
}
