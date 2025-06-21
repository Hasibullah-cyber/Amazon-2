import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function HeroSection() {
  return (
    <section className="relative">
      {/* Hero banner */}
      <div className="relative w-full h-[300px] sm:h-[400px]">
        <Image src="/placeholder.svg?height=600&width=1600" alt="Hero banner" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* Content over the banner */}
      <div className="container mx-auto px-4 relative z-10 -mt-16 sm:-mt-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="amazon-card">
            <h2 className="amazon-title text-xl mb-3">Welcome to Hasib Shop</h2>
            <p className="text-sm mb-4">
              Discover premium products with exceptional quality that elevate your lifestyle.
            </p>
            <Button asChild className="amazon-button w-full">
              <Link href="/#categories">Shop now</Link>
            </Button>
          </div>

          <div className="amazon-card">
            <h2 className="amazon-title text-xl mb-3">Top deals</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center">
                <div className="aspect-square relative mb-1">
                  <Image src="/placeholder.svg?height=150&width=150" alt="Deal 1" fill className="object-contain" />
                </div>
                <p className="text-xs">Up to 40% off</p>
              </div>
              <div className="text-center">
                <div className="aspect-square relative mb-1">
                  <Image src="/placeholder.svg?height=150&width=150" alt="Deal 2" fill className="object-contain" />
                </div>
                <p className="text-xs">Starting at ৳999</p>
              </div>
            </div>
            <Link href="/#products" className="amazon-link text-sm block mt-3">
              See all deals
            </Link>
          </div>

          <div className="amazon-card">
            <h2 className="amazon-title text-xl mb-3">Sign in for the best experience</h2>
            <Button className="amazon-button w-full mb-3">Sign in securely</Button>
            <Link href="/#products" className="amazon-link text-sm">
              New customer? Start here
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
