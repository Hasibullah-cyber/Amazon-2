import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

// Define the categories with their subcategories
const categories = {
  electronics: {
    name: "Electronics",
    description: "Cutting-edge gadgets and devices for modern living",
    subcategories: [
      { name: "Mobile Phones", slug: "mobile-phones", description: "Smartphones and feature phones", count: 45 },
      { name: "Headphones & Earphones", slug: "headphones", description: "Audio devices and accessories", count: 32 },
      { name: "Wireless Earbuds", slug: "wireless-earbuds", description: "True wireless audio", count: 28 },
      { name: "Smartwatches", slug: "smartwatches", description: "Fitness and smart wearables", count: 19 },
      { name: "Cameras", slug: "cameras", description: "Digital cameras and accessories", count: 24 },
      { name: "Power Banks", slug: "power-banks", description: "Portable charging solutions", count: 15 },
      { name: "Speakers", slug: "speakers", description: "Bluetooth and wired speakers", count: 22 },
      { name: "Laptops & Computers", slug: "laptops", description: "Computing devices", count: 18 },
      { name: "Gaming Accessories", slug: "gaming", description: "Gaming gear and accessories", count: 12 },
      { name: "Others", slug: "others", description: "Other electronic items", count: 8 },
    ],
  },
  fashion: {
    name: "Fashion",
    description: "Stylish apparel and accessories for every occasion",
    subcategories: [
      { name: "Sarees", slug: "sarees", description: "Traditional and designer sarees", count: 67 },
      { name: "Shirts", slug: "shirts", description: "Formal and casual shirts", count: 89 },
      { name: "Jeans", slug: "jeans", description: "Denim wear for all", count: 45 },
      { name: "T-Shirts", slug: "t-shirts", description: "Casual and graphic tees", count: 78 },
      { name: "Dresses", slug: "dresses", description: "Party and casual dresses", count: 56 },
      { name: "Sunglasses", slug: "sunglasses", description: "Stylish eyewear", count: 34 },
      { name: "Watches", slug: "watches", description: "Fashion and luxury timepieces", count: 42 },
      { name: "Handbags", slug: "handbags", description: "Bags and purses", count: 38 },
      { name: "Shoes", slug: "shoes", description: "Footwear for all occasions", count: 52 },
      { name: "Others", slug: "others", description: "Other fashion accessories", count: 15 },
    ],
  },
  "home-living": {
    name: "Home & Living",
    description: "Beautiful furnishings and decor for your space",
    subcategories: [
      { name: "Candles & Aromatherapy", slug: "candles", description: "Scented candles and diffusers", count: 28 },
      { name: "Bed Sheets & Linens", slug: "bed-sheets", description: "Comfortable bedding", count: 35 },
      { name: "Pillows & Cushions", slug: "pillows", description: "Decorative and sleeping pillows", count: 42 },
      { name: "Wall Clocks", slug: "wall-clocks", description: "Decorative timepieces", count: 18 },
      { name: "Vases & Planters", slug: "vases", description: "Decorative containers", count: 25 },
      { name: "Lamps & Lighting", slug: "lamps", description: "Indoor lighting solutions", count: 31 },
      { name: "Curtains & Blinds", slug: "curtains", description: "Window treatments", count: 22 },
      { name: "Rugs & Carpets", slug: "rugs", description: "Floor coverings", count: 19 },
      { name: "Kitchen Accessories", slug: "kitchen", description: "Cooking and dining items", count: 47 },
      { name: "Others", slug: "others", description: "Other home items", count: 12 },
    ],
  },
  beauty: {
    name: "Beauty & Personal Care",
    description: "Premium products for your self-care routine",
    subcategories: [
      { name: "Face Creams & Moisturizers", slug: "face-creams", description: "Skincare essentials", count: 45 },
      { name: "Blush & Highlighters", slug: "blush", description: "Cheek makeup products", count: 23 },
      { name: "Eye Makeup", slug: "eye-makeup", description: "Mascara, eyeliner, eyeshadow", count: 38 },
      { name: "Lipstick & Lip Care", slug: "lipstick", description: "Lip color and care", count: 52 },
      { name: "Foundation & Concealer", slug: "foundation", description: "Base makeup products", count: 34 },
      { name: "Skincare Sets", slug: "skincare", description: "Complete skincare routines", count: 28 },
      { name: "Hair Care", slug: "hair-care", description: "Shampoo, conditioner, styling", count: 41 },
      { name: "Perfumes & Fragrances", slug: "perfumes", description: "Scents and body sprays", count: 36 },
      { name: "Nail Care", slug: "nail-care", description: "Nail polish and treatments", count: 19 },
      { name: "Others", slug: "others", description: "Other beauty products", count: 8 },
    ],
  },
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = await params
  const category = categories[slug as keyof typeof categories]

  if (!category) {
    notFound()
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm mb-4">
          <Link href="/" className="text-[#565959] hover:text-[#C7511F] hover:underline">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
          <span className="font-medium">{category.name}</span>
        </div>

        {/* Category Header */}
        <div className="bg-white p-6 mb-6 rounded-sm">
          <h1 className="text-3xl font-bold text-black mb-2">{category.name}</h1>
          <p className="text-gray-600 text-lg">{category.description}</p>
        </div>

        {/* Subcategories Grid */}
        <div className="bg-white p-6 rounded-sm">
          <h2 className="text-2xl font-medium text-black mb-6">Browse {category.name} Categories</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.subcategories.map((subcategory) => (
              <Link
                key={subcategory.slug}
                href={`/category/${slug}/${subcategory.slug}`}
                className="block p-4 border border-gray-200 rounded-sm hover:shadow-md hover:border-[#ff9900] transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-black group-hover:text-[#C7511F] mb-1">{subcategory.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{subcategory.description}</p>
                    <span className="text-xs text-gray-500">{subcategory.count} items</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#ff9900]" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Popular Items Preview */}
        <div className="bg-white p-6 rounded-sm mt-6">
          <h2 className="text-2xl font-medium text-black mb-4">Popular in {category.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="text-center">
                <div className="aspect-square bg-gray-100 rounded-sm mb-2 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Product {item}</span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">Sample Product Name</p>
                <p className="text-sm font-medium amazon-price">৳1,299</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
