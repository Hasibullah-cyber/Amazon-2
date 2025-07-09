import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { email, orderDetails } = await request.json()

    // Validate input
    if (!email || !orderDetails) {
      return NextResponse.json(
        { success: false, error: 'Email and order details are required' },
        { status: 400 }
      )
    }

    // Verify email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Missing email credentials in environment variables')
      return NextResponse.json(
        { success: false, error: 'Email service not configured' },
        { status: 500 }
      )
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    // Verify SMTP connection
    try {
      await transporter.verify()
    } catch (error) {
      console.error('SMTP connection failed:', error)
      return NextResponse.json(
        { success: false, error: 'Email service authentication failed' },
        { status: 500 }
      )
    }

    // Generate email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          .total { font-weight: bold; font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation #${orderDetails.orderId}</h1>
            <p>Thank you for your order!</p>
          </div>
          
          <h2>Order Summary</h2>
          <table>
            ${orderDetails.items?.map((item: any) => `
              <tr>
                <td>${item.name} (x${item.quantity})</td>
                <td>৳${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr>
              <td><strong>Total</strong></td>
              <td class="total">৳${orderDetails.totalAmount?.toFixed(2)}</td>
            </tr>
          </table>
          
          <p>We'll notify you when your order ships.</p>
        </div>
      </body>
      </html>
    `

    const emailText = `
      Order Confirmation #${orderDetails.orderId}
      ==================================
      
      Thank you for your order!
      
      Order Summary:
      ${orderDetails.items?.map((item: any) => 
        `${item.name} x ${item.quantity} = ৳${(item.price * item.quantity).toFixed(2)}`
      ).join('\n')}
      
      Total: ৳${orderDetails.totalAmount?.toFixed(2)}
      
      We'll notify you when your order ships.
    `

    // Send email
    await transporter.sendMail({
      from: `"Hasib Shop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Order Confirmation #${orderDetails.orderId}`,
      text: emailText,
      html: emailHtml
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Confirmation email sent successfully' 
    })

  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send confirmation email' },
      { status: 500 }
    )
  }
}
