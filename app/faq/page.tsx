import { Card } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQPage() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-16 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="glass-card p-8 md:p-12 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h1>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-medium">How do I place an order?</AccordionTrigger>
              <AccordionContent className="text-gray-700">
                <p>
                  To place an order, browse our products, select the items you want to purchase, and add them to your
                  cart. When you're ready to checkout, click on the cart icon, review your order, and follow the
                  checkout process. You'll need to provide your shipping information and payment details to complete
                  your purchase.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-medium">What payment methods do you accept?</AccordionTrigger>
              <AccordionContent className="text-gray-700">
                <p>We accept various payment methods including:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>bKash</li>
                  <li>Nagad</li>
                  <li>Rocket</li>
                  <li>Credit/Debit Cards</li>
                  <li>Cash on Delivery (for orders within Bangladesh)</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-medium">
                How long will it take to receive my order?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                <p>Delivery times depend on your location:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Dhaka City: 1-2 business days</li>
                  <li>Outside Dhaka: 2-4 business days</li>
                  <li>Remote Areas: 3-7 business days</li>
                </ul>
                <p className="mt-2">
                  You can track your order using the tracking number provided in your shipping confirmation email.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-medium">What is your return policy?</AccordionTrigger>
              <AccordionContent className="text-gray-700">
                <p>
                  We offer a 14-day return policy for most items. Products must be unused, in their original packaging,
                  and with all tags attached. Please visit our{" "}
                  <a href="/return-policy" className="text-purple-600 hover:underline">
                    Return Policy
                  </a>{" "}
                  page for more detailed information.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-lg font-medium">Do you offer international shipping?</AccordionTrigger>
              <AccordionContent className="text-gray-700">
                <p>
                  Yes, we offer international shipping to select countries. Shipping costs and delivery times vary
                  depending on the destination. Please contact our customer service team for specific information about
                  shipping to your country.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-lg font-medium">How do I track my order?</AccordionTrigger>
              <AccordionContent className="text-gray-700">
                <p>
                  Once your order is shipped, you will receive a confirmation email with a tracking number. You can use
                  this number to track your package on our website or through the courier service's website.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger className="text-lg font-medium">Are prices inclusive of VAT?</AccordionTrigger>
              <AccordionContent className="text-gray-700">
                <p>
                  Yes, all prices displayed on our website include 10% VAT as per Bangladesh government regulations.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger className="text-lg font-medium">
                What if I receive a damaged or defective item?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                <p>
                  If you receive a damaged or defective item, please contact our customer service team within 48 hours
                  of receiving your order. We will arrange for a replacement or refund at no additional cost to you.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9">
              <AccordionTrigger className="text-lg font-medium">
                Do you offer warranty on your products?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                <p>
                  Yes, most of our electronic products come with a manufacturer's warranty. The warranty period varies
                  by product and is mentioned in the product description. Please keep your order invoice as proof of
                  purchase for warranty claims.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-10">
              <AccordionTrigger className="text-lg font-medium">How can I contact customer service?</AccordionTrigger>
              <AccordionContent className="text-gray-700">
                <p>You can contact our customer service team through:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Email: contact@hasibshop.com</li>
                  <li>Phone: +880 1XXXXXXXXX</li>
                  <li>Contact form on our website</li>
                </ul>
                <p className="mt-2">
                  Our customer service hours are Sunday to Thursday, 9:00 AM to 6:00 PM Bangladesh time.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </div>
    </div>
  )
}
