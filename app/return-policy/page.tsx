import { Card } from "@/components/ui/card"

export default function ReturnPolicyPage() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-16 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="glass-card p-8 md:p-12 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            Return Policy
          </h1>

          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Return Policy</h2>
            <p className="mb-4">
              At Hasib Shop, we want you to be completely satisfied with your purchase. If you're not satisfied, we
              offer a simple return process.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Return Period</h3>
            <p className="mb-4">
              You have 14 days from the date of delivery to return your item for a full refund or exchange. To be
              eligible for a return, your item must be unused and in the same condition that you received it, with all
              original packaging and tags attached.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">How to Return</h3>
            <ol className="list-decimal pl-6 mb-6 space-y-2">
              <li>
                Contact our customer service team at returns@hasibshop.com or call +880 1XXXXXXXXX to initiate your
                return.
              </li>
              <li>Our team will provide you with a return authorization number and instructions.</li>
              <li>Pack the item securely in its original packaging if possible.</li>
              <li>Include your order number and return authorization number with your return.</li>
              <li>Ship the item to the address provided by our customer service team.</li>
            </ol>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Refunds</h3>
            <p className="mb-4">
              Once we receive and inspect your return, we will notify you of the approval or rejection of your refund.
              If approved, your refund will be processed, and a credit will automatically be applied to your original
              method of payment within 7-10 business days.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Return Shipping Costs</h3>
            <p className="mb-4">
              The customer is responsible for return shipping costs unless the item is defective or we made an error in
              your order. In these cases, we will provide a prepaid shipping label.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Non-Returnable Items</h3>
            <p className="mb-4">Some items cannot be returned, including:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Items that have been used or show signs of wear</li>
              <li>Items without original packaging or tags</li>
              <li>Personalized or custom-made items</li>
              <li>Downloadable software products</li>
              <li>Gift cards</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Damaged or Defective Items</h3>
            <p className="mb-4">
              If you receive a damaged or defective item, please contact our customer service team immediately. We will
              arrange for a replacement or refund at no additional cost to you.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Contact Us</h3>
            <p className="mb-4">
              If you have any questions about our return policy, please contact our customer service team at
              returns@hasibshop.com or call us at +880 1XXXXXXXXX.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
