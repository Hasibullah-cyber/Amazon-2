import { CheckCircle } from "lucide-react"

export default function AboutSection() {
  return (
    <section id="about" className="py-16 sm:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">About Hasib Shop</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Learn more about our mission, values, and what makes us different.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h3 className="text-2xl font-bold text-black mb-6">Our Mission</h3>
            <p className="text-gray-700 mb-6">
              At Hasib Shop, our mission is to provide high-quality, innovative products that enhance our customers'
              everyday lives. We believe in creating value through exceptional products and outstanding customer
              service.
            </p>

            <h3 className="text-2xl font-bold text-black mb-6">Why Choose Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-[#007600] mr-2 flex-shrink-0" />
                <span className="text-gray-700">Premium quality products sourced from trusted manufacturers</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-[#007600] mr-2 flex-shrink-0" />
                <span className="text-gray-700">Exceptional customer service and support</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-[#007600] mr-2 flex-shrink-0" />
                <span className="text-gray-700">Fast and reliable shipping worldwide</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-[#007600] mr-2 flex-shrink-0" />
                <span className="text-gray-700">30-day money-back guarantee on all products</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-[#007600] mr-2 flex-shrink-0" />
                <span className="text-gray-700">Sustainable and eco-friendly packaging</span>
              </li>
            </ul>
          </div>

          <div className="order-1 lg:order-2">
            <div className="bg-white border border-gray-200 rounded-sm p-8 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-black mb-6 text-center">Our Values</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="text-center p-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🌟</span>
                    </div>
                    <h4 className="text-lg font-semibold text-black mb-2">Quality</h4>
                    <p className="text-gray-600">We never compromise on the quality of our products.</p>
                  </div>

                  <div className="text-center p-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🤝</span>
                    </div>
                    <h4 className="text-lg font-semibold text-black mb-2">Integrity</h4>
                    <p className="text-gray-600">We operate with honesty and transparency in all we do.</p>
                  </div>

                  <div className="text-center p-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">💡</span>
                    </div>
                    <h4 className="text-lg font-semibold text-black mb-2">Innovation</h4>
                    <p className="text-gray-600">We continuously seek new ways to improve our products.</p>
                  </div>

                  <div className="text-center p-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">❤️</span>
                    </div>
                    <h4 className="text-lg font-semibold text-black mb-2">Customer Focus</h4>
                    <p className="text-gray-600">Our customers are at the heart of everything we do.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
