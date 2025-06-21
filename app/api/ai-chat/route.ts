import { type NextRequest, NextResponse } from "next/server"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

// Helper function for search suggestions
function getSearchSuggestions(message: string): string {
  const lowerMessage = message.toLowerCase()

  if (
    lowerMessage.includes("face") ||
    lowerMessage.includes("skin") ||
    lowerMessage.includes("beauty") ||
    lowerMessage.includes("makeup") ||
    lowerMessage.includes("cream")
  ) {
    return `**Beauty & Personal Care** is perfect for you! 💄
• Luxury Skincare Set (৳14,300) - Complete face care routine
• Facial Massager (৳6,600) - For glowing skin
• Makeup Brush Set (৳5,500) - Professional tools
• Premium Hair Dryer (৳9,900) - Salon-quality styling`
  }

  if (
    lowerMessage.includes("fashion") ||
    lowerMessage.includes("clothes") ||
    lowerMessage.includes("sunglasses") ||
    lowerMessage.includes("wallet")
  ) {
    return `**Fashion** category matches your search! 👔
• Designer Sunglasses (৳8,800) - Stylish eye protection
• Premium Leather Wallet (৳5,500) - Elegant and durable
• Classic Wristwatch (৳17,600) - Timeless design
• Designer Handbag (৳22,000) - Luxury accessory`
  }

  if (
    lowerMessage.includes("home") ||
    lowerMessage.includes("candle") ||
    lowerMessage.includes("decor") ||
    lowerMessage.includes("living")
  ) {
    return `**Home & Living** is what you need! 🏠
• Scented Candle Set (৳3,850) - Relaxing atmosphere
• Luxury Bed Sheets (৳9,900) - Ultimate comfort
• Modern Wall Clock (৳5,500) - Stylish timepiece
• Ceramic Vase Set (৳6,600) - Beautiful decor`
  }

  if (
    lowerMessage.includes("tech") ||
    lowerMessage.includes("electronic") ||
    lowerMessage.includes("headphone") ||
    lowerMessage.includes("phone")
  ) {
    return `**Electronics** category for you! 📱
• Premium Wireless Headphones (৳22,000) - Superior sound
• Smart Fitness Watch (৳16,500) - Health tracking
• Ultra HD Camera (৳33,000) - Professional photos
• Portable Power Bank (৳6,600) - Stay charged`
  }

  return `**Browse our categories:**
• 📱 **Electronics** (৳1,000-৳25,000): Tech gadgets, headphones, cameras
• 👔 **Fashion** (৳500-৳15,000): Sunglasses, wallets, accessories
• � **Home & Living** (৳300-৳8,000): Candles, decor, bedding
• 💄 **Beauty** (৳800-৳12,000): Skincare, makeup, hair care`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, context } = body

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Check if API key is configured and valid
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "AIzaSyBAUxGbH4WJ5g0vdJ2fo4q5NNUbZkQg4vA" || GEMINI_API_KEY.length < 10) {
      return NextResponse.json({
        response: `I'm currently running in offline mode, but I can still help you! 🛍️

**To enable full AI features:**
1. Visit: https://aistudio.google.com/app/apikey
2. Create a new API key
3. Add it to your environment variables as GEMINI_API_KEY

**For your question: "${message}"**
${getSearchSuggestions(message)}

💳 **Payment Options:** bKash, Nagad, Rocket, Cards, Cash on Delivery
🚚 **Delivery:** 1-2 days in Dhaka, 2-4 days nationwide  
💰 **Free shipping** on orders over ৳5,000
🔄 **Returns:** 14-day return policy

What category interests you most?`,
      })
    }

    // Create a context-aware prompt for the shopping assistant
    const systemPrompt = `You are a helpful AI shopping assistant for Hasib Shop, an e-commerce website in Bangladesh. 

Our product categories and popular items:

**Electronics (৳1,000 - ৳25,000):**
- Premium Wireless Headphones (৳22,000)
- Smart Fitness Watch (৳16,500) 
- Ultra HD Camera (৳33,000)
- Portable Power Bank (৳6,600)
- Wireless Earbuds (৳9,900)
- Smart Home Speaker (৳14,300)

**Fashion (৳500 - ৳15,000):**
- Designer Sunglasses (৳8,800)
- Premium Leather Wallet (৳5,500)
- Classic Wristwatch (৳17,600)
- Silk Neck Tie (৳4,400)
- Leather Belt (৳5,060)
- Designer Handbag (৳22,000)

**Home & Living (৳300 - ৳8,000):**
- Scented Candle Set (৳3,850)
- Decorative Throw Pillows (৳3,300)
- Modern Wall Clock (৳5,500)
- Ceramic Vase Set (৳6,600)
- Luxury Bed Sheets (৳9,900)
- Table Lamp (৳7,700)

**Beauty & Personal Care (৳800 - ৳12,000):**
- Luxury Skincare Set (৳14,300)
- Premium Hair Dryer (৳9,900)
- Electric Shaver (৳8,800)
- Makeup Brush Set (৳5,500)
- Perfume Collection (৳13,200)
- Facial Massager (৳6,600)

**Store Information:**
- Payment: bKash, Nagad, Rocket, Credit/Debit Cards, Cash on Delivery
- Delivery: 1-2 days in Dhaka, 2-4 days outside Dhaka
- All prices include 10% VAT
- 14-day return policy on most items
- Free shipping on orders over ৳5,000
- Customer service: contact@hasibshop.com

Please help customers find products, answer questions about policies, and provide helpful shopping advice. Be friendly, concise, and always mention prices in Bangladeshi Taka (৳). If someone asks about face products, skincare, makeup, or beauty items, recommend our Beauty & Personal Care category.

Customer question: ${message}`

    // Make request to Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: systemPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
            stopSequences: [],
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Gemini API error:", response.status, errorText)

      // Handle specific API key errors
      if (response.status === 400 && errorText.includes("API key not valid")) {
        return NextResponse.json({
          response: `🔑 **API Key Setup Required**

To enable full AI chat:
1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key to your .env.local file

**Current Search Help for "${message}":**
${getSearchSuggestions(message)}

Browse our categories above to find what you need! 🛍️`,
        })
      }

      return NextResponse.json({
        response: `I'm having some technical difficulties, but I can still help! 

**For "${message}", try these categories:**
${getSearchSuggestions(message)}

**Popular Products:**
• Electronics: Headphones (৳22,000), Smartwatch (৳16,500)
• Fashion: Sunglasses (৳8,800), Wallet (৳5,500)
• Home: Candle Set (৳3,850), Bed Sheets (৳9,900)
• Beauty: Skincare Set (৳14,300), Hair Dryer (৳9,900)

What interests you most? 🛍️`,
      })
    }

    const responseText = await response.text()
    const data = JSON.parse(responseText)

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      return NextResponse.json({
        response: `Welcome to Hasib Shop! 🛍️

**For "${message}", I recommend:**
${getSearchSuggestions(message)}

**Quick Facts:**
• 💳 Payment: bKash, Nagad, Rocket, Cards, COD
• 🚚 Delivery: 1-2 days in Dhaka
• 💰 Free shipping over ৳5,000
• 🔄 14-day returns

What category interests you? 🛍️`,
      })
    }

    const aiResponse = data.candidates[0].content.parts[0].text

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error("Error in AI chat API:", error)

    // Return a helpful fallback response instead of an error
    return NextResponse.json({
      response: `Welcome to Hasib Shop! 🛍️ I'm here to help you find the perfect products.

**Quick Shopping Guide:**
• 📱 **Electronics**: Latest gadgets and tech accessories
• 👔 **Fashion**: Stylish clothing and accessories  
• 🏠 **Home & Living**: Beautiful decor and essentials
• 💄 **Beauty**: Premium skincare and cosmetics

**Store Info:**
• Payment: bKash, Nagad, Rocket, Cards, COD
• Delivery: 1-2 days in Dhaka, 2-4 days nationwide
• Free shipping on orders over ৳5,000

What category interests you? 🛍️`,
    })
  }
}
