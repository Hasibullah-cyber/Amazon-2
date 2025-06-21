"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

// Enhanced product database for search
const searchDatabase = {
  // Beauty products with brand names
  "fair and lovely": {
    category: "beauty",
    subcategory: "face-creams",
    name: "Fair & Lovely Advanced Multi Vitamin Face Cream",
  },
  "fair & lovely": {
    category: "beauty",
    subcategory: "face-creams",
    name: "Fair & Lovely Advanced Multi Vitamin Face Cream",
  },
  ponds: { category: "beauty", subcategory: "face-creams", name: "Pond's Age Miracle Day Cream" },
  "pond's": { category: "beauty", subcategory: "face-creams", name: "Pond's Age Miracle Day Cream" },
  olay: { category: "beauty", subcategory: "face-creams", name: "Olay Regenerist Micro-Sculpting Cream" },
  nivea: { category: "beauty", subcategory: "face-creams", name: "Nivea Soft Light Moisturizing Cream" },

  // Electronics with brand names
  iphone: { category: "electronics", subcategory: "mobile-phones", name: "iPhone 15 Pro Max" },
  samsung: { category: "electronics", subcategory: "mobile-phones", name: "Samsung Galaxy S24 Ultra" },
  sony: { category: "electronics", subcategory: "headphones", name: "Sony WH-1000XM5" },
  bose: { category: "electronics", subcategory: "headphones", name: "Bose QuietComfort 45" },

  // Generic categories
  "face cream": { category: "beauty", subcategory: "face-creams" },
  moisturizer: { category: "beauty", subcategory: "face-creams" },
  blush: { category: "beauty", subcategory: "blush" },
  mascara: { category: "beauty", subcategory: "eye-makeup" },
  eyeshadow: { category: "beauty", subcategory: "eye-makeup" },
  lipstick: { category: "beauty", subcategory: "lipstick" },

  mobile: { category: "electronics", subcategory: "mobile-phones" },
  phone: { category: "electronics", subcategory: "mobile-phones" },
  smartphone: { category: "electronics", subcategory: "mobile-phones" },
  headphones: { category: "electronics", subcategory: "headphones" },
  earphones: { category: "electronics", subcategory: "headphones" },
  earbuds: { category: "electronics", subcategory: "wireless-earbuds" },

  saree: { category: "fashion", subcategory: "sarees" },
  shirt: { category: "fashion", subcategory: "shirts" },
  jeans: { category: "fashion", subcategory: "jeans" },
  dress: { category: "fashion", subcategory: "dresses" },

  candle: { category: "home-living", subcategory: "candles" },
  "bed sheet": { category: "home-living", subcategory: "bed-sheets" },
  pillow: { category: "home-living", subcategory: "pillows" },
}

export default function RegularSearch() {
  const [query, setQuery] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleSearch = () => {
    if (!query.trim()) return

    const lowerQuery = query.toLowerCase().trim()

    // First, try exact product name match
    const exactMatch = searchDatabase[lowerQuery as keyof typeof searchDatabase]
    if (exactMatch) {
      if (exactMatch.name) {
        toast({
          title: "Product Found!",
          description: `Found: ${exactMatch.name}`,
          duration: 3000,
        })
      } else {
        toast({
          title: "Category Found!",
          description: `Showing products in ${exactMatch.subcategory.replace("-", " ")}`,
          duration: 3000,
        })
      }
      router.push(`/category/${exactMatch.category}/${exactMatch.subcategory}`)
      setQuery("")
      return
    }

    // Try partial matches for brand names and product types
    for (const [key, value] of Object.entries(searchDatabase)) {
      if (lowerQuery.includes(key) || key.includes(lowerQuery)) {
        if (value.name) {
          toast({
            title: "Product Found!",
            description: `Found: ${value.name}`,
            duration: 3000,
          })
        } else {
          toast({
            title: "Category Found!",
            description: `Showing products in ${value.subcategory.replace("-", " ")}`,
            duration: 3000,
          })
        }
        router.push(`/category/${value.category}/${value.subcategory}`)
        setQuery("")
        return
      }
    }

    // Enhanced category matching
    if (
      lowerQuery.includes("face") ||
      lowerQuery.includes("skin") ||
      lowerQuery.includes("beauty") ||
      lowerQuery.includes("makeup") ||
      lowerQuery.includes("cosmetic") ||
      lowerQuery.includes("cream")
    ) {
      toast({
        title: "Beauty & Personal Care",
        description: "Found skincare, makeup, and beauty products for you!",
        duration: 3000,
      })
      router.push("/category/beauty")
      setQuery("")
      return
    }

    if (
      lowerQuery.includes("fashion") ||
      lowerQuery.includes("clothes") ||
      lowerQuery.includes("clothing") ||
      lowerQuery.includes("wear")
    ) {
      toast({
        title: "Fashion",
        description: "Found stylish clothing and accessories for you!",
        duration: 3000,
      })
      router.push("/category/fashion")
      setQuery("")
      return
    }

    if (
      lowerQuery.includes("home") ||
      lowerQuery.includes("house") ||
      lowerQuery.includes("living") ||
      lowerQuery.includes("decor")
    ) {
      toast({
        title: "Home & Living",
        description: "Found home decor and living essentials for you!",
        duration: 3000,
      })
      router.push("/category/home-living")
      setQuery("")
      return
    }

    if (
      lowerQuery.includes("electronic") ||
      lowerQuery.includes("tech") ||
      lowerQuery.includes("gadget") ||
      lowerQuery.includes("device")
    ) {
      toast({
        title: "Electronics",
        description: "Found tech gadgets and electronic devices for you!",
        duration: 3000,
      })
      router.push("/category/electronics")
      setQuery("")
      return
    }

    // If no specific category matches, show all categories
    toast({
      title: "Search Results",
      description: `Searching for "${query}" - browse our categories to find what you need!`,
      duration: 4000,
    })
    router.push("/#categories")
    setQuery("")
  }

  return (
    <div className="relative w-full">
      <Input
        type="search"
        placeholder="Search: Fair and Lovely, iPhone, headphones, sarees..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        className="w-full rounded-l-md rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-black placeholder:text-gray-500"
      />
      <div className="absolute inset-y-0 right-0 flex items-center">
        <Button onClick={handleSearch} className="h-full rounded-l-none bg-[#febd69] hover:bg-[#f3a847] text-black">
          <Search className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
