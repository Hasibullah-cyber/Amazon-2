import { Card } from "@/components/ui/card"

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-16 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="glass-card p-8 md:p-12 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            Privacy Policy
          </h1>

          <div className="prose max-w-none">
            <p className="mb-4">Last updated: June 13, 2025</p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Introduction</h2>
            <p className="mb-4">
              Hasib Shop ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains
              how we collect, use, disclose, and safeguard your information when you visit our website or make a
              purchase.
            </p>
            <p className="mb-4">
              Please read this Privacy Policy carefully. By accessing or using our website, you acknowledge that you
              have read, understood, and agree to be bound by all the terms outlined in this Privacy Policy.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Information We Collect</h2>
            <p className="mb-4">We collect information that you provide directly to us when you:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Create an account</li>
              <li>Make a purchase</li>
              <li>Sign up for our newsletter</li>
              <li>Contact our customer service</li>
              <li>Participate in surveys or promotions</li>
            </ul>

            <p className="mb-4">The types of information we may collect include:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Personal information (name, email address, phone number, shipping address)</li>
              <li>Payment information (credit card details, billing address)</li>
              <li>Order history and preferences</li>
              <li>Communications with our customer service team</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">How We Use Your Information</h2>
            <p className="mb-4">We may use the information we collect for various purposes, including to:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about your orders, products, and services</li>
              <li>Provide customer support</li>
              <li>Send you marketing communications (if you've opted in)</li>
              <li>Improve our website and services</li>
              <li>Detect and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Sharing Your Information</h2>
            <p className="mb-4">We may share your information with:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Service providers who perform services on our behalf (payment processors, shipping companies)</li>
              <li>Business partners with your consent</li>
              <li>Legal authorities when required by law</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Data Security</h2>
            <p className="mb-4">
              We implement appropriate security measures to protect your personal information. However, no method of
              transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute
              security.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Rights</h2>
            <p className="mb-4">
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Access to your personal information</li>
              <li>Correction of inaccurate information</li>
              <li>Deletion of your information</li>
              <li>Objection to certain processing activities</li>
              <li>Data portability</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Changes to This Privacy Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy from time to time. The updated version will be indicated by an updated
              "Last Updated" date. We encourage you to review this Privacy Policy frequently to stay informed about how
              we are protecting your information.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Us</h2>
            <p className="mb-4">
              If you have any questions or concerns about this Privacy Policy or our data practices, please contact us
              at:
            </p>
            <p className="mb-4">
              Email: privacy@hasibshop.com
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
