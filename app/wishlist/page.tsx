
"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useWishlist } from "@/components/wishlist-provider"
import { useCart } from "@/components/cart-provider"
import { useToast } from "@/hooks/use-toast"
import { Heart, ShoppingCart, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist()
  const { addToCart } = useCart()
  const { toast } = useToast()

  const handleAddToCart = (item: any) => {
    addToCart({
      id: parseInt(item.id),
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1
    })
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart.`,
    })
  }

  const handleRemoveFromWishlist = (id: string, name: string) => {
    removeFromWishlist(id)
    toast({
      title: "Removed from wishlist",
      description: `${name} has been removed from your wishlist.`,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600 mt-2">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
            </p>
          </div>
          {wishlistItems.length > 0 && (
            <Button 
              variant="outline" 
              onClick={clearWishlist}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Save items you love to buy them later</p>
            <Button asChild>
              <Link href="/">Continue Shopping</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <Link href={`/product/${item.id}`}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={300}
                      height={300}
                      className="w-full h-48 object-cover"
                    />
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0 bg-white shadow-md hover:bg-red-50"
                    onClick={() => handleRemoveFromWishlist(item.id, item.name)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
                
                <div className="p-4">
                  <Link href={`/product/${item.id}`}>
                    <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                      {item.name}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      ৳{item.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 capitalize">
                      {item.category}
                    </span>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <Button 
                      className="w-full"
                      onClick={() => handleAddToCart(item)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      asChild
                    >
                      <Link href={`/product/${item.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
