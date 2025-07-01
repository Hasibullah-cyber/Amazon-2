
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

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

    // Create transporter with Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    // Create detailed HTML email content
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; margin-bottom: 20px; }
          .order-info { background: #fff; border: 1px solid #ddd; border-radius: 5px; padding: 20px; margin: 20px 0; }
          .total { font-weight: bold; font-size: 18px; color: #28a745; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          td { padding: 10px; border-bottom: 1px solid #eee; }
          .footer { background: #f8f9fa; padding: 15px; text-align: center; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #007bff; margin: 0;">Order Confirmation</h1>
            <p style="margin: 10px 0 0 0;">Thank you for your order, ${orderDetails.customerName || 'Customer'}!</p>
          </div>
          
          <div class="order-info">
            <h2>Order Details</h2>
            <p><strong>Order ID:</strong> ${orderDetails.orderId || orderDetails.id}</p>
            <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
            
            <h3>Items Ordered:</h3>
            <table>
              ${orderDetails.items ? orderDetails.items.map((item: any) => `
                <tr>
                  <td><strong>${item.name}</strong><br>Quantity: ${item.quantity}</td>
                  <td style="text-align: right;">৳${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('') : '<tr><td colspan="2">Order items not available</td></tr>'}
              <tr style="border-top: 2px solid #007bff;">
                <td><strong>Subtotal:</strong></td>
                <td style="text-align: right;"><strong>৳${orderDetails.subtotal ? orderDetails.subtotal.toFixed(2) : '0.00'}</strong></td>
              </tr>
              <tr>
                <td><strong>Shipping:</strong></td>
                <td style="text-align: right;"><strong>৳${orderDetails.shipping ? orderDetails.shipping.toFixed(2) : '0.00'}</strong></td>
              </tr>
              <tr>
                <td><strong>VAT:</strong></td>
                <td style="text-align: right;"><strong>৳${orderDetails.vat ? orderDetails.vat.toFixed(2) : '0.00'}</strong></td>
              </tr>
              <tr style="background: #f8f9fa;">
                <td class="total">Total Amount:</td>
                <td class="total" style="text-align: right;">৳${orderDetails.totalAmount ? orderDetails.totalAmount.toFixed(2) : orderDetails.total ? orderDetails.total.toFixed(2) : '0.00'}</td>
              </tr>
            </table>
            
            ${orderDetails.address ? `
            <h3>Delivery Address:</h3>
            <p>
              ${orderDetails.address}<br>
              ${orderDetails.city || ''}<br>
              ${orderDetails.phone ? `Phone: ${orderDetails.phone}` : ''}
            </p>
            ` : ''}
          </div>
          
          <div class="footer">
            <p>We'll send you another email when your order ships.</p>
            <p>You can track your order at: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track-order">Track Your Order</a></p>
            <p><strong>Thank you for shopping with Hasib Shop!</strong></p>
          </div>
        </div>
      </body>
      </html>
    `

    // Plain text version
    const textContent = `
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
      
      ${orderDetails.address ? `
      Delivery Address:
      ${orderDetails.address}
      ${orderDetails.city || ''}
      ${orderDetails.phone ? `Phone: ${orderDetails.phone}` : ''}
      ` : ''}
      
      We'll send you another email when your order ships.
      You can track your order at: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track-order
      
      Thank you for shopping with Hasib Shop!
    `

    // Send the email
    const mailOptions = {
      from: `"Hasib Shop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Order Confirmation - ${orderDetails.orderId || orderDetails.id}`,
      text: textContent,
      html: emailContent
    }

    await transporter.sendMail(mailOptions)

    console.log('✅ Email sent successfully to:', email)

    return NextResponse.json({ 
      success: true, 
      message: 'Confirmation email sent successfully'
    })

  } catch (error) {
    console.error('Error sending confirmation email:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send confirmation email' 
    }, { status: 500 })
  }
}
