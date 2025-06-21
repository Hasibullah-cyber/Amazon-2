import HeroSection from "@/components/hero-section"
import CategoriesSection from "@/components/categories-section"
import ProductsSection from "@/components/products-section"
import SuccessStorySection from "@/components/success-story-section"
import AboutSection from "@/components/about-section"
import ContactSection from "@/components/contact-section"

export default function Home() {
  return (
    <div className="bg-gray-100">
      <HeroSection />
      <CategoriesSection />
      <ProductsSection />
      <SuccessStorySection />
      <AboutSection />
      <ContactSection />
    </div>
  )
}
