import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Sample job listings
const jobListings = [
  {
    id: 1,
    title: "E-commerce Manager",
    department: "Operations",
    location: "Dhaka, Bangladesh",
    type: "Full-time",
  },
  {
    id: 2,
    title: "Customer Service Representative",
    department: "Customer Support",
    location: "Dhaka, Bangladesh",
    type: "Full-time",
  },
  {
    id: 3,
    title: "Logistics Coordinator",
    department: "Supply Chain",
    location: "Dhaka, Bangladesh",
    type: "Full-time",
  },
  {
    id: 4,
    title: "Digital Marketing Specialist",
    department: "Marketing",
    location: "Remote",
    type: "Full-time",
  },
  {
    id: 5,
    title: "Web Developer",
    department: "IT",
    location: "Dhaka, Bangladesh",
    type: "Full-time",
  },
]

export default function CareersPage() {
  return (
    <div className="bg-gray-100 py-16 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-8 md:p-12 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-black">Careers at Hasib Shop</h1>

          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-black mb-4">Join Our Team</h2>
            <p className="mb-6">
              At Hasib Shop, we're always looking for talented individuals who are passionate about e-commerce and
              customer service. Join our team and be part of a company that's transforming online shopping in
              Bangladesh.
            </p>

            <h2 className="text-2xl font-semibold text-black mb-4">Why Work With Us</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Competitive salary and benefits package</li>
              <li>Career growth and development opportunities</li>
              <li>Collaborative and innovative work environment</li>
              <li>Employee discount on all products</li>
              <li>Work-life balance</li>
              <li>Health insurance and retirement benefits</li>
            </ul>

            <h2 className="text-2xl font-semibold text-black mb-6">Current Openings</h2>

            <div className="space-y-4 mb-8">
              {jobListings.map((job) => (
                <div key={job.id} className="border border-gray-200 rounded-md p-4 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-black">{job.title}</h3>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Department: {job.department}</p>
                    <p>Location: {job.location}</p>
                    <p>Type: {job.type}</p>
                  </div>
                  <div className="mt-4">
                    <Button className="amazon-button">View Details</Button>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-semibold text-black mb-4">Application Process</h2>
            <ol className="list-decimal pl-6 mb-6 space-y-2">
              <li>Browse our current openings and find a position that matches your skills and interests.</li>
              <li>Click on "View Details" to learn more about the role and requirements.</li>
              <li>Submit your application with your resume and cover letter.</li>
              <li>If your qualifications match our needs, our HR team will contact you for an interview.</li>
              <li>Successful candidates will receive an offer letter.</li>
            </ol>

            <h2 className="text-2xl font-semibold text-black mb-4">Don't See a Suitable Position?</h2>
            <p className="mb-6">
              We're always interested in hearing from talented individuals. Send your resume to careers@hasibshop.com,
              and we'll keep your information on file for future opportunities.
            </p>

            <div className="text-center mt-8">
              <Link href="/#contact">
                <Button className="amazon-button">Contact Us</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
