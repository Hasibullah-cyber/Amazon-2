import { Card } from "@/components/ui/card"
import Image from "next/image"

export default function OurStoryPage() {
  return (
    <div className="bg-gray-100 py-16 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-8 md:p-12 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-black">Our Story</h1>

          <div className="prose max-w-none">
            <div className="mb-8 relative h-64 w-full">
              <Image
                src="/placeholder.svg?height=400&width=800"
                alt="Hasib Shop Journey"
                fill
                className="object-cover rounded-md"
              />
            </div>

            <h2 className="text-2xl font-semibold text-black mb-4">The Beginning</h2>
            <p className="mb-6">
              Hasib Shop was founded in 2015 by a young entrepreneur with a vision to revolutionize online shopping in
              Bangladesh. Starting with just a small selection of electronics products, our founder worked tirelessly
              from a small apartment in Dhaka.
            </p>

            <h2 className="text-2xl font-semibold text-black mb-4">Early Challenges</h2>
            <p className="mb-6">
              The early days weren't easy. With limited resources and facing stiff competition from established
              retailers, we had to innovate constantly. Our focus on customer service and product quality helped us
              stand out in a crowded marketplace.
            </p>

            <div className="my-8 relative h-64 w-full">
              <Image
                src="/placeholder.svg?height=400&width=800"
                alt="Hasib Shop Growth"
                fill
                className="object-cover rounded-md"
              />
            </div>

            <h2 className="text-2xl font-semibold text-black mb-4">Growth and Expansion</h2>
            <p className="mb-6">
              By 2018, we had expanded our product range to include fashion, home goods, and beauty products. Our
              customer base grew rapidly, and we moved to a larger warehouse to accommodate our growing inventory. We
              also expanded our team, bringing in experts in e-commerce, logistics, and customer service.
            </p>

            <h2 className="text-2xl font-semibold text-black mb-4">Technological Innovation</h2>
            <p className="mb-6">
              In 2020, we launched our mobile app, making it even easier for customers to shop on the go. We also
              implemented advanced logistics systems to improve delivery times and reduce costs. These technological
              innovations helped us serve our customers better and stay ahead of the competition.
            </p>

            <div className="my-8 relative h-64 w-full">
              <Image
                src="/placeholder.svg?height=400&width=800"
                alt="Hasib Shop Today"
                fill
                className="object-cover rounded-md"
              />
            </div>

            <h2 className="text-2xl font-semibold text-black mb-4">Where We Are Today</h2>
            <p className="mb-6">
              Today, Hasib Shop is one of Bangladesh's leading e-commerce platforms, offering thousands of products
              across multiple categories. We serve customers throughout the country and have begun expanding into
              neighboring markets. Despite our growth, we remain committed to our founding principles: quality products,
              exceptional service, and customer satisfaction.
            </p>

            <h2 className="text-2xl font-semibold text-black mb-4">Looking to the Future</h2>
            <p className="mb-6">
              As we look to the future, we're excited about the opportunities ahead. We're investing in new
              technologies, expanding our product range, and exploring new markets. But no matter how much we grow,
              we'll always stay true to our roots and the vision that started it all: to provide the best possible
              shopping experience for our customers.
            </p>

            <div className="text-center mt-8">
              <p className="italic">
                "Our journey has been incredible, but we're just getting started. The best is yet to come."
              </p>
              <p className="font-semibold mt-2">- Founder, Hasib Shop</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
