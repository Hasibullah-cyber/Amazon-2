import Image from "next/image"

export default function SuccessStorySection() {
  return (
    <section id="success-story" className="py-16 sm:py-24 bg-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">Our Success Story</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From a small startup to a thriving business, our journey has been incredible.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-sm p-6 sm:p-10 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2">
              <div className="relative h-80 w-full rounded-sm overflow-hidden">
                <Image
                  src="/placeholder.svg?height=400&width=400"
                  alt="Hasib Shop Founder"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="md:w-1/2">
              <h3 className="text-2xl font-bold text-black mb-4">From Vision to Reality</h3>
              <p className="text-gray-700 mb-4">
                Hasib Shop started as a small dream in 2015. Our founder had a vision to create a platform where
                customers could find premium products that truly enhance their lives.
              </p>
              <p className="text-gray-700 mb-4">
                With dedication and a commitment to quality, we've grown from a small online store to a trusted brand
                with thousands of satisfied customers worldwide.
              </p>
              <p className="text-gray-700">
                Our success is built on our core values: exceptional quality, outstanding customer service, and
                continuous innovation. We're proud of how far we've come and excited about where we're going.
              </p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-4">
              <div className="text-4xl font-bold text-black mb-2">10K+</div>
              <p className="text-gray-600">Happy Customers</p>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold text-black mb-2">50+</div>
              <p className="text-gray-600">Countries Served</p>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold text-black mb-2">100+</div>
              <p className="text-gray-600">Premium Products</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
