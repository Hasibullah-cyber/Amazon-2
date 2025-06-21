import { type NextRequest, NextResponse } from "next/server"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

// Helper function for offline search suggestions
function getOfflineSearchSuggestion(query: string): string {
  const lowerQuery = query.toLowerCase()

  if (
    lowerQuery.includes("face") ||
    lowerQuery.includes("skin") ||
    lowerQuery.includes("beauty") ||
    lowerQuery.includes("makeup") ||
    lowerQuery.includes("cream")
  ) {
    return `🔍 **Search Results for "${query}":**

**Beauty & Personal Care** is perfect for you! 💄
• Luxury Skincare Set (৳14,300) - Complete face care routine
• Facial Massager (৳6,600) - For glowing skin
• Makeup Brush Set (৳5,500) - Professional tools
• Premium Hair Dryer (৳9,900) - Salon-quality styling

**Price Range:** ৳800 - ৳12,000
**Browse:** Beauty & Personal Care category`
  }

  if (
    lowerQuery.includes("fashion") ||
    lowerQuery.includes("clothes") ||
    lowerQuery.includes("sunglasses") ||
    lowerQuery.includes("wallet")
  ) {
    return `🔍 **Search Results for "${query}":**

**Fashion** category matches your search! 👔
• Designer Sunglasses (৳8,800) - Stylish eye protection
• Premium Leather Wallet (৳5,500) - Elegant and durable
• Classic Wristwatch (৳17,600) - Timeless design
• Designer Handbag (৳22,000) - Luxury accessory

**Price Range:** ৳500 - ৳15,000
**Browse:** Fashion category`
  }

  if (
    lowerQuery.includes("home") ||
    lowerQuery.includes("candle") ||
    lowerQuery.includes("decor") ||
    lowerQuery.includes("living")
  ) {
    return `🔍 **Search Results for "${query}":**

**Home & Living** is what you need! 🏠
• Scented Candle Set (৳3,850) - Relaxing atmosphere
• Luxury Bed Sheets (৳9,900) - Ultimate comfort
• Modern Wall Clock (৳5,500) - Stylish timepiece
• Ceramic Vase Set (৳6,600) - Beautiful decor

**Price Range:** ৳300 - ৳8,000
**Browse:** Home & Living category`
  }

  if (
    lowerQuery.includes("tech") ||
    lowerQuery.includes("electronic") ||
    lowerQuery.includes("headphone") ||
    lowerQuery.includes("phone")
  ) {
    return `🔍 **Search Results for "${query}":**

**Electronics** category for you! 📱
• Premium Wireless Headphones (৳22,000) - Superior sound
• Smart Fitness Watch (৳16,500) - Health tracking
• Ultra HD Camera (৳33,000) - Professional photos
• Portable Power Bank (৳6,600) - Stay charged

**Price Range:** ৳1,000 - ৳25,000
**Browse:** Electronics category`
  }

  return `🔍 **Search Results for "${query}":**

**Multiple categories match your search:**
• 📱 **Electronics** (৳1,000-৳25,000): Tech gadgets, headphones, cameras
• 👔 **Fashion** (৳500-৳15,000): Sunglasses, wallets, accessories
• 🏠 **Home & Living** (৳300-৳8,000): Candles, decor, bedding
• 💄 **Beauty** (৳800-৳12,000): Skincare, makeup, hair care

**Browse all categories to find exactly what you need!**`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query } = body

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // Check if API key is configured and valid
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "your_actual_gemini_api_key_here" || GEMINI_API_KEY.length < 10) {
      return NextResponse.json({
        suggestion: getOfflineSearchSuggestion(query),
      })
    }

    const searchPrompt = `You are a product search assistant for Hasib Shop, an e-commerce website in Bangladesh. 

Our product categories and price ranges:

**Electronics (৳1,000 - ৳25,000):**
- Headphones, earbuds, speakers, audio equipment
- Smartwatches, fitness trackers
- Cameras, photography equipment  
- Power banks, chargers, tech accessories

**Fashion (৳500 - ৳15,000):**
- Sunglasses, eyewear
- Wallets, belts, leather goods
- Watches, jewelry, accessories
- Ties, scarves, fashion accessories
- Handbags, purses

**Home & Living (৳300 - ৳8,000):**
- Scented candles, aromatherapy
- Decorative pillows, cushions
- Wall clocks, home decor
- Vases, decorative items
- Bed sheets, bedding, linens
- Lamps, lighting

**Beauty & Personal Care (৳800 - ৳12,000):**
- Skincare sets, face creams, serums
- Hair dryers, styling tools
- Electric shavers, grooming
- Makeup brushes, cosmetic tools
- Perfumes, fragrances
- Facial massagers, beauty devices

User search query: "${query}"

Based on this query, suggest the most relevant products and categories. Be specific about which category matches best, mention price ranges in Bangladeshi Taka (৳), and provide helpful product recommendations. If they search for "face" or beauty-related terms, definitely recommend Beauty & Personal Care category.

Keep the response concise and helpful.`

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
                  text: searchPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 1024,
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
      console.error("Gemini API error:", response.status, await response.text())
      return NextResponse.json({
        suggestion: getOfflineSearchSuggestion(query),
      })
    }

    const responseText = await response.text()
    const data = JSON.parse(responseText)

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      return NextResponse.json({
        suggestion: getOfflineSearchSuggestion(query),
      })
    }

    const suggestion = data.candidates[0].content.parts[0].text

    return NextResponse.json({ suggestion })
  } catch (error) {
    console.error("Error in AI search API:", error)
    return NextResponse.json({
      suggestion: "Browse our product categories to find what you're looking for!",
    })
  }
}
