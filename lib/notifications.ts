
// Notification system for order confirmations
interface EmailTemplate {
  subject: string
  html: string
  text: string
}

interface SMSTemplate {
  message: string
}

// Notification system for order confirmations
interface EmailTemplate {
  subject: string
  html: string
  text: string
}

interface SMSTemplate {
  message: string
}

class NotificationService {
  // Email service (using a mock implementation - replace with your preferred service)
  async sendOrderConfirmationEmail(order: any): Promise<boolean> {
    try {
      const emailTemplate = this.generateOrderConfirmationEmail(order)
      
      // Mock email sending - replace with actual email service like SendGrid, AWS SES, etc.
      console.log('Sending email to:', order.customerEmail)
      console.log('Subject:', emailTemplate.subject)
      console.log('HTML:', emailTemplate.html)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return true
    } catch (error) {
      console.error('Failed to send email:', error)
      return false
    }
  }

  // SMS service (using a mock implementation - replace with your preferred service)
  async sendOrderConfirmationSMS(order: any): Promise<boolean> {
    try {
      const smsTemplate = this.generateOrderConfirmationSMS(order)
      
      // Mock SMS sending - replace with actual SMS service like Twilio, AWS SNS, etc.
      console.log('Sending SMS to:', order.customerPhone)
      console.log('Message:', smsTemplate.message)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return true
    } catch (error) {
      console.error('Failed to send SMS:', error)
      return false
    }
  }

  // Send order status update notifications
  async sendOrderStatusUpdate(order: any, newStatus: string): Promise<void> {
    const statusMessages = {
      processing: 'Your order is now being processed!',
      shipped: 'Great news! Your order has been shipped.',
      delivered: 'Your order has been delivered successfully!',
      cancelled: 'Your order has been cancelled.'
    }

    const message = statusMessages[newStatus as keyof typeof statusMessages]
    if (message) {
      // Send both email and SMS notifications
      await Promise.all([
        this.sendStatusUpdateEmail(order, newStatus, message),
        this.sendStatusUpdateSMS(order, message)
      ])
    }
  }

  private generateOrderConfirmationEmail(order: any): EmailTemplate {
    const itemsHtml = order.items.map((item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong><br>
          Quantity: ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ৳${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `).join('')

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; }
          .order-info { background: #fff; border: 1px solid #ddd; border-radius: 5px; padding: 20px; margin: 20px 0; }
          .total { font-weight: bold; font-size: 18px; color: #28a745; }
          table { width: 100%; border-collapse: collapse; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
            <p>Thank you for your order, ${order.customerName}!</p>
          </div>
          
          <div class="order-info">
            <h2>Order Details</h2>
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Estimated Delivery:</strong> ${order.estimatedDelivery}</p>
            
            <h3>Items Ordered:</h3>
            <table>
              ${itemsHtml}
              <tr>
                <td style="padding: 10px;"><strong>Subtotal:</strong></td>
                <td style="padding: 10px; text-align: right;"><strong>৳${order.subtotal.toFixed(2)}</strong></td>
              </tr>
              <tr>
                <td style="padding: 10px;">Shipping:</td>
                <td style="padding: 10px; text-align: right;">৳${order.shipping.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 10px;">VAT:</td>
                <td style="padding: 10px; text-align: right;">৳${order.vat.toFixed(2)}</td>
              </tr>
              <tr class="total">
                <td style="padding: 15px; border-top: 2px solid #333;"><strong>Total:</strong></td>
                <td style="padding: 15px; text-align: right; border-top: 2px solid #333;"><strong>৳${order.totalAmount.toFixed(2)}</strong></td>
              </tr>
            </table>
            
            <h3>Delivery Address:</h3>
            <p>
              ${order.customerName}<br>
              ${order.address}<br>
              ${order.city}<br>
              Phone: ${order.customerPhone}
            </p>
            
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          </div>
          
          <p>You can track your order status at any time by visiting our website.</p>
          <p>Thank you for shopping with us!</p>
        </div>
      </body>
      </html>
    `

    const text = `
Order Confirmation

Thank you for your order, ${order.customerName}!

Order ID: ${order.orderId}
Order Date: ${new Date(order.createdAt).toLocaleDateString()}
Estimated Delivery: ${order.estimatedDelivery}

Items Ordered:
${order.items.map((item: any) => `- ${item.name} (Qty: ${item.quantity}) - ৳${(item.price * item.quantity).toFixed(2)}`).join('\n')}

Subtotal: ৳${order.subtotal.toFixed(2)}
Shipping: ৳${order.shipping.toFixed(2)}
VAT: ৳${order.vat.toFixed(2)}
Total: ৳${order.totalAmount.toFixed(2)}

Delivery Address:
${order.customerName}
${order.address}
${order.city}
Phone: ${order.customerPhone}

Payment Method: ${order.paymentMethod}

Thank you for shopping with us!
    `

    return {
      subject: `Order Confirmation - ${order.orderId}`,
      html,
      text
    }
  }

  private generateOrderConfirmationSMS(order: any): SMSTemplate {
    return {
      message: `Hi ${order.customerName}! Your order ${order.orderId} has been confirmed. Total: ৳${order.totalAmount.toFixed(2)}. Expected delivery: ${order.estimatedDelivery}. Track your order on our website. Thank you!`
    }
  }

  private async sendStatusUpdateEmail(order: any, status: string, message: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; }
          .status-update { background: #fff; border: 1px solid #ddd; border-radius: 5px; padding: 20px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Status Update</h1>
          </div>
          
          <div class="status-update">
            <h2>Hi ${order.customerName},</h2>
            <p>${message}</p>
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Current Status:</strong> ${status.toUpperCase()}</p>
            <p>You can track your order status at any time by visiting our website.</p>
          </div>
        </div>
      </body>
      </html>
    `

    console.log('Sending status update email to:', order.customerEmail)
    console.log('Status:', status, 'Message:', message)
  }

  private async sendStatusUpdateSMS(order: any, message: string): Promise<void> {
    const smsMessage = `Order Update: ${message} Order ID: ${order.orderId}. Track your order on our website.`
    console.log('Sending status update SMS to:', order.customerPhone)
    console.log('Message:', smsMessage)
  }

  // Convenience method for sending both email and SMS confirmations
  async sendOrderConfirmation(order: any): Promise<{email: boolean, sms: boolean}> {
    const [emailResult, smsResult] = await Promise.all([
      this.sendOrderConfirmationEmail(order),
      this.sendOrderConfirmationSMS(order)
    ])
    
    return {
      email: emailResult,
      sms: smsResult
    }
  }
}

export const notificationService = new NotificationService()
