import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react"

export default function Footer() {
  return (
    <footer>
      {/* Back to top button */}
      <div className="bg-[#37475A] text-white text-center py-3 hover:bg-[#485769] cursor-pointer">
        <Link href="#top" className="text-sm">
          Back to top
        </Link>
      </div>

      {/* Main footer */}
      <div className="bg-[#232F3E] text-white py-8">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-3 text-base">Get to Know Us</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white hover:underline">
                  About Hasib Shop
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-300 hover:text-white hover:underline">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/our-story" className="text-gray-300 hover:text-white hover:underline">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/corporate-responsibility" className="text-gray-300 hover:text-white hover:underline">
                  Corporate Responsibility
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-3 text-base">Shop with Us</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/category/electronics" className="text-gray-300 hover:text-white hover:underline">
                  Electronics
                </Link>
              </li>
              <li>
                <Link href="/category/fashion" className="text-gray-300 hover:text-white hover:underline">
                  Fashion
                </Link>
              </li>
              <li>
                <Link href="/category/home-living" className="text-gray-300 hover:text-white hover:underline">
                  Home & Living
                </Link>
              </li>
              <li>
                <Link href="/category/beauty" className="text-gray-300 hover:text-white hover:underline">
                  Beauty & Personal Care
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-3 text-base">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shipping-policy" className="text-gray-300 hover:text-white hover:underline">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="text-gray-300 hover:text-white hover:underline">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white hover:underline">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-300 hover:text-white hover:underline">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-3 text-base">Connect with Us</h3>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-300 hover:text-white">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-[#131A22] text-white py-4 text-center text-xs">
        <div className="container mx-auto px-4">
          <Link href="/" className="text-white font-bold text-lg mb-2 inline-block">
            Hasib Shop
          </Link>
          <p className="mt-2">&copy; {new Date().getFullYear()} Hasib Shop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
