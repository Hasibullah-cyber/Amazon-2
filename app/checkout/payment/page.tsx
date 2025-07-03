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
      // Generate tracking number if not provided
      const trackingNumber = result.trackingNumber || `TRK${result.orderId || Date.now()}`
      
      // Prepare comprehensive order confirmation data
      const confirmationData = {
        orderId: result.orderId,
        trackingNumber: trackingNumber,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        totalAmount: orderData.totalAmount,
        paymentMethod: orderData.paymentMethod,
        estimatedDelivery: result.order?.estimatedDelivery || '3-5 business days',
        items: orderData.items,
        address: orderData.address,
        city: orderData.city,
        phone: orderData.customerPhone,
        orderDate: new Date().toISOString(),
        subtotal: orderData.subtotal,
        shipping: orderData.shipping,
        tax: orderData.tax
      }

      console.log('Payment: Confirmation data prepared:', confirmationData)

      // Store order data in multiple places for reliability
      if (typeof window !== 'undefined') {
        try {
          // Primary storage
          localStorage.setItem('latest-order', JSON.stringify(confirmationData))
          sessionStorage.setItem('latest-order', JSON.stringify(confirmationData))
          
          // Backup with order ID key
          localStorage.setItem(`order-${result.orderId}`, JSON.stringify(confirmationData))
          
          console.log('Payment: Order data stored successfully')
        } catch (storageError) {
          console.error('Payment: Error storing order data:', storageError)
        }
      }

      // Send confirmation email
      try {
        const emailResponse = await fetch('/api/send-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: orderData.customerEmail,
            orderDetails: {
              orderId: result.orderId,
              customerName: orderData.customerName,
              items: orderData.items,
              subtotal: orderData.subtotal,
              shipping: orderData.shipping,
              vat: orderData.tax,
              totalAmount: orderData.totalAmount,
              address: orderData.address,
              city: orderData.city,
              phone: orderData.customerPhone
            }
          })
        })
        
        if (emailResponse.ok) {
          console.log('Payment: Confirmation email sent successfully')
        } else {
          console.error('Payment: Failed to send confirmation email')
        }
      } catch (emailError) {
        console.error('Payment: Error sending confirmation email:', emailError)
      }

      // Clear cart and checkout data
      clearCart()
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('checkout-data')
        sessionStorage.removeItem('checkout-data')
      }

      toast({
        title: "Order Placed Successfully!",
        description: `Your order ${result.orderId} has been placed successfully.`
      })

      // Navigate to confirmation page with multiple fallback methods
      console.log('Payment: Navigating to order confirmation...')
      
      // Create a comprehensive URL with all necessary data
      const encodedData = encodeURIComponent(JSON.stringify(confirmationData))
      const baseUrl = `/order-confirmation?orderId=${result.orderId}`
      
      // Check if URL would be too long (most browsers handle ~2000 chars)
      const fullUrl = `${baseUrl}&data=${encodedData}`
      
      if (fullUrl.length > 1900) {
        // URL too long, use just order ID and rely on storage
        console.log('Payment: URL too long, using storage method')
        router.replace(`${baseUrl}&stored=true`)
      } else {
        // URL is safe, include data
        console.log('Payment: Using URL with data')
        router.replace(fullUrl)
      }
      
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
