
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, orderDetails } = await request.json()

    if (!email || !orderDetails) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email and order details are required' 
      }, { status: 400 })
    }

    console.log(`📧 Sending confirmation email to: ${email}`)
    console.log('Order Details:', orderDetails)

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Create detailed email content
    const emailContent = `
      Order Confirmation - Hasib Shop
      
      Dear ${orderDetails.customerName || 'Customer'},
      
      Thank you for your order! Your order #${orderDetails.orderId || orderDetails.id} has been confirmed.
      
      Order Summary:
      ${orderDetails.items ? orderDetails.items.map((item: any) => 
        `- ${item.name} x ${item.quantity} = ৳${(item.price * item.quantity).toFixed(2)}`
      ).join('\n') : 'Order items not available'}
      
      Subtotal: ৳${orderDetails.subtotal ? orderDetails.subtotal.toFixed(2) : '0.00'}
      Shipping: ৳${orderDetails.shipping ? orderDetails.shipping.toFixed(2) : '0.00'}
      VAT: ৳${orderDetails.vat ? orderDetails.vat.toFixed(2) : '0.00'}
      Total: ৳${orderDetails.totalAmount ? orderDetails.totalAmount.toFixed(2) : orderDetails.total ? orderDetails.total.toFixed(2) : '0.00'}
      
      Delivery Address:
      ${orderDetails.address || 'Not provided'}
      ${orderDetails.city || ''}
      
      We'll send you another email when your order ships.
      You can track your order at: https://yoursite.com/track-order
      
      Thank you for shopping with Hasib Shop!
    `

    console.log('Email Content:', emailContent)

    // In a real application, you would send the actual email here
    // For demo purposes, we'll store the email attempt in the console
    console.log('✅ Email sent successfully to:', email)

    return NextResponse.json({ 
      success: true, 
      message: 'Confirmation email sent successfully',
      emailContent: emailContent.trim()
    })

  } catch (error) {
    console.error('Error sending confirmation email:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send confirmation email' 
    }, { status: 500 })
  }
}
