
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import TaxInfo from "@/components/tax-info"
import AddToCartButton from "../add-to-cart"
import { Star, StarHalf, ChevronRight } from "lucide-react"

// Enhanced product database with more realistic products
const subcategoryProducts = {
  // Electronics subcategories
  "mobile-phones": {
    name: "Mobile Phones",
    description: "Latest smartphones and mobile devices",
    products: [
      {
        id: 1001,
        name: "iPhone 15 Pro Max",
        description: "Latest Apple smartphone with advanced camera system, titanium design, and A17 Pro chip. Features 6.7-inch Super Retina XDR display with ProMotion technology, 48MP main camera with 5x telephoto zoom.",
        price: 1299.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.8,
        reviews: 245,
      },
      {
        id: 1002,
        name: "Samsung Galaxy S24 Ultra",
        description: "Premium Android phone with S Pen, 200MP camera, and AI features. Built-in S Pen for productivity and creativity with 6.8-inch Dynamic AMOLED display.",
        price: 1199.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.7,
        reviews: 189,
      },
      {
        id: 1003,
        name: "Google Pixel 8 Pro",
        description: "AI-powered photography smartphone with Magic Eraser, Night Sight, and computational photography features. Features Google's Tensor G3 chip and 7 years of updates.",
        price: 899.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.6,
        reviews: 156,
      },
    ],
  },
  headphones: {
    name: "Headphones & Earphones",
    description: "Premium audio headphones for music lovers",
    products: [
      {
        id: 1004,
        name: "Sony WH-1000XM5",
        description: "Industry-leading noise canceling headphones with 30-hour battery life. Features V1 processor for exceptional sound quality and speak-to-chat technology.",
        price: 399.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.6,
        reviews: 312,
      },
      {
        id: 1005,
        name: "Bose QuietComfort 45",
        description: "Comfortable noise canceling headphones with TriPort acoustic architecture. Features 24-hour battery life and acclaimed Bose noise cancellation.",
        price: 329.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.5,
        reviews: 278,
      },
      {
        id: 1006,
        name: "Apple AirPods Pro 2",
        description: "Next-generation AirPods with adaptive transparency and personalized spatial audio. Features H2 chip and up to 2x more active noise cancellation.",
        price: 249.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.7,
        reviews: 445,
      },
    ],
  },
  laptops: {
    name: "Laptops & Computers",
    description: "High-performance laptops and desktop computers",
    products: [
      {
        id: 1007,
        name: "MacBook Pro 14-inch M3",
        description: "Professional laptop with M3 chip, 14-inch Liquid Retina XDR display, and up to 22 hours of battery life. Perfect for creative professionals.",
        price: 1599.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.8,
        reviews: 156,
      },
      {
        id: 1008,
        name: "Dell XPS 13",
        description: "Ultra-portable laptop with 13th Gen Intel Core processor, 13.4-inch InfinityEdge display, and premium aluminum construction.",
        price: 999.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.5,
        reviews: 203,
      },
      {
        id: 1009,
        name: "Lenovo ThinkPad X1 Carbon",
        description: "Business laptop with military-grade durability, 14-inch 2.8K OLED display, and exceptional keyboard. Features Intel Core i7 and 16GB RAM.",
        price: 1399.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.6,
        reviews: 178,
      },
    ],
  },
  // Fashion subcategories
  clothing: {
    name: "Clothing",
    description: "Latest fashion trends and comfortable wear",
    products: [
      {
        id: 2001,
        name: "Premium Cotton T-Shirt",
        description: "Soft, breathable cotton t-shirt with classic fit. Made from 100% organic cotton with reinforced seams. Available in multiple colors and sizes.",
        price: 29.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.3,
        reviews: 892,
      },
      {
        id: 2002,
        name: "Slim Fit Denim Jeans",
        description: "Classic blue denim jeans with modern slim fit. Made from premium stretch denim for comfort and durability with five-pocket styling.",
        price: 79.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.4,
        reviews: 567,
      },
      {
        id: 2003,
        name: "Wool Blend Sweater",
        description: "Cozy wool blend sweater with ribbed cuffs and hem. Perfect for cold weather with soft texture and classic crew neck design.",
        price: 89.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.5,
        reviews: 234,
      },
    ],
  },
  shoes: {
    name: "Shoes & Footwear",
    description: "Comfortable and stylish footwear for every occasion",
    products: [
      {
        id: 2004,
        name: "Running Sneakers",
        description: "Lightweight running shoes with responsive cushioning and breathable mesh upper. Features advanced sole technology for comfort during long runs.",
        price: 129.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.6,
        reviews: 778,
      },
      {
        id: 2005,
        name: "Leather Dress Shoes",
        description: "Classic leather oxford shoes perfect for formal occasions. Handcrafted from genuine leather with traditional construction.",
        price: 199.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.7,
        reviews: 345,
      },
      {
        id: 2006,
        name: "Casual Canvas Sneakers",
        description: "Versatile canvas sneakers with rubber sole and classic design. Perfect for everyday wear with comfortable fit and durable construction.",
        price: 59.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.2,
        reviews: 456,
      },
    ],
  },
  accessories: {
    name: "Accessories",
    description: "Complete your look with our fashion accessories",
    products: [
      {
        id: 2007,
        name: "Leather Wallet",
        description: "Premium genuine leather wallet with RFID blocking technology. Features multiple card slots, bill compartment, and ID window.",
        price: 49.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.5,
        reviews: 623,
      },
      {
        id: 2008,
        name: "Designer Sunglasses",
        description: "UV protection sunglasses with polarized lenses and lightweight frame. Features anti-glare coating and scratch-resistant lenses.",
        price: 79.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.0,
        reviews: 285,
      },
    ],
  },
  // Beauty subcategories
  skincare: {
    name: "Skincare",
    description: "Nourish and protect your skin with premium skincare",
    products: [
      {
        id: 3001,
        name: "Anti-Aging Face Cream",
        description: "Advanced anti-aging cream with retinol and hyaluronic acid. Reduces fine lines and wrinkles while providing deep hydration with SPF 30.",
        price: 79.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.6,
        reviews: 1234,
      },
      {
        id: 3002,
        name: "Vitamin C Serum",
        description: "Brightening vitamin C serum with 20% L-ascorbic acid. Evens skin tone, reduces dark spots, and provides antioxidant protection.",
        price: 45.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.7,
        reviews: 892,
      },
      {
        id: 3003,
        name: "Gentle Cleansing Foam",
        description: "Mild foam cleanser for sensitive skin with botanical extracts. Removes makeup and impurities without stripping natural oils.",
        price: 24.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.4,
        reviews: 567,
      },
    ],
  },
  makeup: {
    name: "Makeup",
    description: "Express yourself with our vibrant makeup collection",
    products: [
      {
        id: 3004,
        name: "Long-Lasting Foundation",
        description: "Full coverage foundation with 24-hour wear. Available in 40 shades with buildable coverage and natural finish. Contains SPF 25.",
        price: 39.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.5,
        reviews: 678,
      },
      {
        id: 3005,
        name: "Waterproof Mascara",
        description: "Volumizing waterproof mascara that lengthens and defines lashes. Smudge-proof formula with vitamin E for lash conditioning.",
        price: 18.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.3,
        reviews: 445,
      },
      {
        id: 3006,
        name: "Matte Lipstick Set",
        description: "Collection of 6 matte lipsticks in trending colors. Long-wearing formula with comfortable feel and full coverage.",
        price: 59.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.6,
        reviews: 789,
      },
    ],
  },
  // Home & Living subcategories
  furniture: {
    name: "Furniture",
    description: "Stylish and functional furniture for every room",
    products: [
      {
        id: 4001,
        name: "Modern Dining Table",
        description: "Contemporary dining table made from sustainable wood with sleek metal legs. Seats 6 people comfortably with scratch-resistant surface.",
        price: 599.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.7,
        reviews: 234,
      },
      {
        id: 4002,
        name: "Ergonomic Office Chair",
        description: "Comfortable office chair with lumbar support and adjustable height. Features breathable mesh back and padded seat.",
        price: 299.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.5,
        reviews: 456,
      },
      {
        id: 4003,
        name: "Storage Ottoman",
        description: "Multi-functional storage ottoman with hidden compartment. Serves as extra seating, footrest, and storage solution.",
        price: 89.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.3,
        reviews: 178,
      },
    ],
  },
  decor: {
    name: "Home Decor",
    description: "Beautiful decor items to enhance your living space",
    products: [
      {
        id: 4004,
        name: "Scented Candle Set",
        description: "Set of 3 premium scented candles in glass jars with 40+ hour burn time each. Features lavender, vanilla, and eucalyptus scents.",
        price: 34.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.7,
        reviews: 623,
      },
      {
        id: 4005,
        name: "Wall Art Canvas Set",
        description: "Set of 3 modern abstract canvas prints ready to hang. High-quality prints on canvas with wooden frames.",
        price: 79.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.4,
        reviews: 234,
      },
      {
        id: 4006,
        name: "Throw Pillow Collection",
        description: "Set of 4 decorative throw pillows with removable covers. Made from soft cotton blend in complementary colors.",
        price: 49.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.2,
        reviews: 345,
      },
    ],
  },
  kitchen: {
    name: "Kitchen & Dining",
    description: "Essential kitchen tools and dining accessories",
    products: [
      {
        id: 4007,
        name: "Non-Stick Cookware Set",
        description: "Complete 10-piece non-stick cookware set with pots, pans, and lids. Features ceramic non-stick coating and heat-resistant handles.",
        price: 199.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.6,
        reviews: 567,
      },
      {
        id: 4008,
        name: "Coffee Maker",
        description: "Programmable drip coffee maker with 12-cup capacity and thermal carafe. Features auto-brew timer and permanent filter.",
        price: 89.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.4,
        reviews: 378,
      },
    ],
  },
  // Sports subcategories
  fitness: {
    name: "Fitness Equipment",
    description: "Get fit with our premium fitness equipment",
    products: [
      {
        id: 5001,
        name: "Adjustable Dumbbells",
        description: "Space-saving adjustable dumbbells with weight range from 5-50 lbs per dumbbell. Quick-change system and comfortable grip handles.",
        price: 299.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.7,
        reviews: 445,
      },
      {
        id: 5002,
        name: "Yoga Mat Premium",
        description: "Extra-thick yoga mat with superior grip and cushioning. Made from eco-friendly TPE material with alignment lines.",
        price: 59.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.5,
        reviews: 678,
      },
      {
        id: 5003,
        name: "Resistance Bands Set",
        description: "Complete resistance bands set with 5 different resistance levels, door anchor, handles, and ankle straps.",
        price: 39.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.3,
        reviews: 234,
      },
    ],
  },
  outdoor: {
    name: "Outdoor Gear",
    description: "Adventure-ready outdoor equipment and gear",
    products: [
      {
        id: 5004,
        name: "Hiking Backpack",
        description: "Durable 40L hiking backpack with multiple compartments, hydration system compatibility, and rain cover.",
        price: 129.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.6,
        reviews: 345,
      },
      {
        id: 5005,
        name: "Camping Tent",
        description: "4-person waterproof camping tent with easy setup and spacious interior. Features color-coded poles and vestibule area.",
        price: 199.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.4,
        reviews: 178,
      },
    ],
  },
  // Books subcategories
  fiction: {
    name: "Fiction",
    description: "Escape into amazing fictional worlds and stories",
    products: [
      {
        id: 6001,
        name: "The Midnight Library",
        description: "Bestselling novel about infinite possibilities and second chances. A thought-provoking story about life, regret, and endless possibilities.",
        price: 16.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.8,
        reviews: 1234,
      },
      {
        id: 6002,
        name: "Where the Crawdads Sing",
        description: "Coming-of-age mystery novel set in the marshlands of North Carolina. A beautiful story of nature, isolation, and human resilience.",
        price: 15.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.7,
        reviews: 2345,
      },
    ],
  },
  "non-fiction": {
    name: "Non-Fiction",
    description: "Learn and grow with our educational non-fiction books",
    products: [
      {
        id: 6003,
        name: "Atomic Habits",
        description: "Practical guide to building good habits and breaking bad ones. Learn how tiny changes can lead to remarkable results.",
        price: 18.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.9,
        reviews: 3456,
      },
      {
        id: 6004,
        name: "Sapiens: A Brief History",
        description: "Fascinating exploration of human history from the Stone Age to the present. Examines how humans have shaped the world.",
        price: 19.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.6,
        reviews: 1567,
      },
    ],
  },
}

// Updated category mappings
const categorySlugMapping: Record<string, string> = {
  electronics: "Electronics",
  fashion: "Fashion",
  beauty: "Beauty",
  "home-living": "Home & Living",
  sports: "Sports & Outdoors",
  books: "Books",
}

export default function SubcategoryPage({
  params,
}: {
  params: { slug: string; subcategory: string }
}) {
  const subcategory = subcategoryProducts[params.subcategory as keyof typeof subcategoryProducts]
  
  if (!subcategory) {
    notFound()
  }

  const categoryName = categorySlugMapping[params.slug] || params.slug

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
    }

    const remainingStars = 5 - Math.ceil(rating)
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />)
    }

    return stars
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/category/${params.slug}`} className="hover:text-blue-600 capitalize">
              {categoryName}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{subcategory.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{subcategory.name}</h1>
          <p className="text-gray-600 text-lg">{subcategory.description}</p>
          <p className="text-sm text-gray-500 mt-2">
            {subcategory.products.length} products available
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subcategory.products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <Link href={`/product/${product.id}`}>
                <div className="aspect-square p-4">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="w-full h-full object-contain hover:scale-105 transition-transform"
                  />
                </div>
              </Link>
              
              <div className="p-4 pt-0">
                <Link href={`/product/${product.id}`}>
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {renderStars(product.rating)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating} ({product.reviews})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold text-gray-900">
                    ৳{product.price.toFixed(2)}
                  </span>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <AddToCartButton product={product} />
                  <Link 
                    href={`/product/${product.id}`}
                    className="block w-full text-center py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {subcategory.products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found in this subcategory.</p>
            <Link 
              href={`/category/${params.slug}`}
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              Browse other subcategories
            </Link>
          </div>
        )}

        <TaxInfo />
      </div>
    </div>
  )
}
