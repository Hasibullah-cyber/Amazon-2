// Notification system for order confirmations
interface EmailTemplate {
  subject: string
  html: string
  text: string
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
      // Send only email notifications
      await this.sendStatusUpdateEmail(order, newStatus, message)
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
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 30px 20px; text-align: center; border-radius: 8px; margin-bottom: 30px; }
          .header h1 { color: #007bff; margin: 0 0 10px 0; font-size: 28px; }
          .order-info { background: #fff; border: 2px solid #e9ecef; border-radius: 8px; padding: 30px; margin: 20px 0; }
          .order-info h2 { color: #495057; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
          .order-info h3 { color: #6c757d; margin-top: 25px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          td { padding: 12px; border-bottom: 1px solid #dee2e6; }
          .total-row { background: #f8f9fa; font-weight: bold; }
          .final-total { background: #e3f2fd; color: #1976d2; font-size: 18px; font-weight: bold; }
          .footer { background: #f8f9fa; padding: 25px; text-align: center; border-radius: 8px; margin-top: 30px; }
          .footer p { margin: 8px 0; }
          .footer a { color: #007bff; text-decoration: none; font-weight: bold; }
          .footer a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
            <p>Thank you for your order, ${order.customerName || 'Customer'}!</p>
          </div>

          <div class="order-info">
            <h2>Order Details</h2>
            <p><strong>Order ID:</strong> ${order.orderId || order.id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt || Date.now()).toLocaleDateString()}</p>
            <p><strong>Estimated Delivery:</strong> ${order.estimatedDelivery || 'To be confirmed'}</p>

            <h3>Items Ordered:</h3>
            <table>
              ${itemsHtml}
              <tr class="total-row">
                <td>Subtotal:</td>
                <td style="text-align: right;">৳${order.subtotal ? order.subtotal.toFixed(2) : '0.00'}</td>
              </tr>
              <tr class="total-row">
                <td>Shipping:</td>
                <td style="text-align: right;">৳${order.shipping ? order.shipping.toFixed(2) : '0.00'}</td>
              </tr>
              <tr class="total-row">
                <td>VAT:</td>
                <td style="text-align: right;">৳${order.vat ? order.vat.toFixed(2) : '0.00'}</td>
              </tr>
              <tr class="final-total">
                <td>Total Amount:</td>
                <td style="text-align: right;">৳${order.totalAmount ? order.totalAmount.toFixed(2) : order.total ? order.total.toFixed(2) : '0.00'}</td>
              </tr>
            </table>

            ${order.address ? `
            <h3>Delivery Address:</h3>
            <p>
              <strong>${order.customerName}</strong><br>
              ${order.address}<br>
              ${order.city || ''}<br>
              ${order.customerPhone ? `Phone: ${order.customerPhone}` : ''}
            </p>
            ` : ''}

            <h3>Payment Information:</h3>
            <p><strong>Payment Method:</strong> ${order.paymentMethod || 'Not specified'}</p>
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

  private async sendStatusUpdateEmail(order: any, newStatus: string, message: string): Promise<void> {
    console.log('Sending status update email to:', order.customerEmail)
    console.log('Status update message:', message)
  }

  // Convenience method for sending email confirmation only
  async sendOrderConfirmation(order: any): Promise<{email: boolean}> {
    const emailResult = await this.sendOrderConfirmationEmail(order)

    return {
      email: emailResult
    }
  }
}

export const notificationService = new NotificationService()