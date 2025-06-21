import { Card } from "@/components/ui/card"
import Image from "next/image"

export default function CorporateResponsibilityPage() {
  return (
    <div className="bg-gray-100 py-16 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-8 md:p-12 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-black">Corporate Responsibility</h1>

          <div className="prose max-w-none">
            <div className="mb-8 relative h-64 w-full">
              <Image
                src="/placeholder.svg?height=400&width=800"
                alt="Corporate Responsibility"
                fill
                className="object-cover rounded-md"
              />
            </div>

            <h2 className="text-2xl font-semibold text-black mb-4">Our Commitment</h2>
            <p className="mb-6">
              At Hasib Shop, we believe that business success and social responsibility go hand in hand. We are
              committed to operating in a way that benefits our customers, employees, communities, and the environment.
              Our corporate responsibility initiatives focus on four key areas: environmental sustainability, community
              engagement, ethical business practices, and employee well-being.
            </p>

            <h2 className="text-2xl font-semibold text-black mb-4">Environmental Sustainability</h2>
            <p className="mb-6">
              We are committed to reducing our environmental footprint and promoting sustainable practices throughout
              our operations.
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>
                <strong>Eco-friendly Packaging:</strong> We're transitioning to recyclable and biodegradable packaging
                materials.
              </li>
              <li>
                <strong>Energy Efficiency:</strong> Our warehouses and offices use energy-efficient lighting and
                equipment.
              </li>
              <li>
                <strong>Waste Reduction:</strong> We have implemented comprehensive recycling programs and are working
                to minimize waste.
              </li>
              <li>
                <strong>Carbon Footprint:</strong> We're optimizing our delivery routes to reduce fuel consumption and
                emissions.
              </li>
            </ul>

            <div className="my-8 relative h-64 w-full">
              <Image
                src="/placeholder.svg?height=400&width=800"
                alt="Community Engagement"
                fill
                className="object-cover rounded-md"
              />
            </div>

            <h2 className="text-2xl font-semibold text-black mb-4">Community Engagement</h2>
            <p className="mb-6">
              We believe in giving back to the communities where we operate and supporting causes that make a
              difference.
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>
                <strong>Education Initiatives:</strong> We sponsor educational programs and provide scholarships to
                underprivileged students.
              </li>
              <li>
                <strong>Disaster Relief:</strong> We contribute to disaster relief efforts in affected areas.
              </li>
              <li>
                <strong>Local Partnerships:</strong> We partner with local organizations to address community needs.
              </li>
              <li>
                <strong>Volunteer Programs:</strong> Our employees participate in volunteer activities throughout the
                year.
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-black mb-4">Ethical Business Practices</h2>
            <p className="mb-6">We are committed to conducting our business with integrity and transparency.</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>
                <strong>Supplier Code of Conduct:</strong> We work only with suppliers who meet our ethical standards.
              </li>
              <li>
                <strong>Fair Trade:</strong> We support fair trade practices and ensure fair compensation for workers.
              </li>
              <li>
                <strong>Transparency:</strong> We provide clear information about our products, pricing, and policies.
              </li>
              <li>
                <strong>Data Privacy:</strong> We protect our customers' personal information and respect their privacy.
              </li>
            </ul>

            <div className="my-8 relative h-64 w-full">
              <Image
                src="/placeholder.svg?height=400&width=800"
                alt="Employee Well-being"
                fill
                className="object-cover rounded-md"
              />
            </div>

            <h2 className="text-2xl font-semibold text-black mb-4">Employee Well-being</h2>
            <p className="mb-6">
              Our employees are our greatest asset, and we are committed to their well-being and professional
              development.
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>
                <strong>Safe Workplace:</strong> We maintain a safe and healthy work environment for all employees.
              </li>
              <li>
                <strong>Diversity and Inclusion:</strong> We promote diversity and ensure equal opportunities for all.
              </li>
              <li>
                <strong>Professional Development:</strong> We invest in training and development programs to help our
                employees grow.
              </li>
              <li>
                <strong>Work-Life Balance:</strong> We support flexible work arrangements to help employees balance
                their professional and personal lives.
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-black mb-4">Our Progress</h2>
            <p className="mb-6">
              We publish an annual Corporate Responsibility Report that details our initiatives and progress. We are
              proud of what we've accomplished so far, but we recognize that there is always more to do. We are
              committed to continuous improvement and to making a positive impact in all areas of our business.
            </p>

            <p className="mb-6">
              If you have any questions or suggestions about our corporate responsibility initiatives, please contact us
              at responsibility@hasibshop.com.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
