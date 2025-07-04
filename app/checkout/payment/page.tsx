"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle } from "lucide-react"
import { useCartStore } from "@/store"
import { formatPrice } from "@/lib/utils"
import axios from "axios"

interface Order {
  id: string
  isPaid: boolean
  totalAmount: number
  createdAt: Date
  products: {
    id: string
    name: string
    image: string
    price: number
    quantity: number
  }[]
}

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const [order, setOrder] = useState<Order | null>(null)
  const clearCart = useCartStore((state) => state.clearCart)

  useEffect(() => {
    const getOrder = async () => {
      try {
        const orderId = searchParams.get("orderId")

        const res = await axios.get(`/api/orders/${orderId}`)
        setOrder(res.data)
        clearCart()
      } catch (error) {
        console.log("[confirmation page]", error)
      }
    }

    getOrder()
  }, [])

  if (!order) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">Loading your order...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-2 mb-8">
        <CheckCircle className="text-green-500 w-6 h-6" />
        <h1 className="text-2xl font-semibold">Thank you for your order!</h1>
      </div>
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="mb-4">Order ID: <span className="font-medium">{order.id}</span></p>
        <p className="mb-4">Order Date: <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span></p>
        <p className="mb-4">Payment Status: <span className="font-medium">{order.isPaid ? "Paid" : "Pending"}</span></p>
        <h2 className="text-lg font-semibold mb-2">Products:</h2>
        <ul className="space-y-2 mb-4">
          {order.products.map((product) => (
            <li key={product.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-gray-500">Qty: {product.quantity}</p>
              </div>
              <p>{formatPrice(product.price)}</p>
            </li>
          ))}
        </ul>
        <p className="text-right font-semibold text-lg">
          Total: {formatPrice(order.totalAmount)}
        </p>
      </div>
    </div>
  )
}
