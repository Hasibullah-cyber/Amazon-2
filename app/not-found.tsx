import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center max-w-md px-6">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">Sorry, we couldn't find the page you're looking for. It may have been moved or doesn't exist.</p>
        <div className="space-y-4">
          <Link 
            href="/" 
            className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Go back home
          </Link>
          <div className="text-sm text-gray-500">
            <Link href="/#categories" className="text-blue-600 hover:underline">Browse Categories</Link>
            {" | "}
            <Link href="/#contact" className="text-blue-600 hover:underline">Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  )
}