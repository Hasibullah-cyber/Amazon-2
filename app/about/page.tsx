import { Card } from "@/components/ui/card"
import Image from "next/image"

export default function AboutPage() {
  return (
    <div className="bg-gray-100 py-16 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-8 md:p-12 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-black">About Hasib Shop</h1>

          <div className="prose max-w-none">
            <div className="mb-8 relative h-64 w-full">
              <Image
                src="/placeholder.svg?height=400&width=800"
                alt="Hasib Shop Headquarters"
                fill
                className="object-cover rounded-md"
              />
            </div>

            <h2 className="text-2xl font-semibold text-black mb-4">Our Mission</h2>
            <p className="mb-6">
              At Hasib Shop, our mission is to provide high-quality, innovative products that enhance our customers'
              everyday lives. We believe in creating value through exceptional products and outstanding customer
              service.
            </p>

            <h2 className="text-2xl font-semibold text-black mb-4">Our Vision</h2>
            <p className="mb-6">
              To be the most customer-centric company in Bangladesh, where customers can find and discover anything they
              might want to buy online, and endeavor to offer the lowest possible prices.
            </p>

            <h2 className="text-2xl font-semibold text-black mb-4">Our History</h2>
            <p className="mb-6">
              Founded in 2015, Hasib Shop started as a small online store with a limited selection of products. Through
              dedication to quality and customer satisfaction, we've grown into one of Bangladesh's leading e-commerce
              platforms, offering thousands of products across multiple categories.
            </p>

            <h2 className="text-2xl font-semibold text-black mb-4">Our Values</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>
                <strong>Customer Obsession:</strong> We start with the customer and work backwards.
              </li>
              <li>
                <strong>Quality:</strong> We never compromise on the quality of our products.
              </li>
              <li>
                <strong>Integrity:</strong> We operate with honesty and transparency in all we do.
              </li>
              <li>
                <strong>Innovation:</strong> We continuously seek new ways to improve our products and services.
              </li>
              <li>
                <strong>Community:</strong> We are committed to making a positive impact in the communities we serve.
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-black mb-4">Our Team</h2>
            <p className="mb-6">
              Our diverse team of professionals is passionate about delivering the best possible shopping experience.
              From our customer service representatives to our logistics experts, everyone at Hasib Shop is committed to
              our mission and values.
            </p>

            <h2 className="text-2xl font-semibold text-black mb-4">Contact Us</h2>
            <p className="mb-2">
              If you have any questions or would like to learn more about Hasib Shop, please don't hesitate to contact
              us:
            </p>
            <p>
              Email: contact@hasibshop.com
              <br />
              Phone: +880 1XXXXXXXXX
              <br />
              Address: 123 Commerce Street, Business District, Dhaka, Bangladesh
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
