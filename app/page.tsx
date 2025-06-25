import HeroSection from "@/components/hero-section"
import CategoriesSection from "@/components/categories-section"
import ProductsSection from "@/components/products-section"
import SuccessStorySection from "@/components/success-story-section"
import AboutSection from "@/components/about-section"
import ContactSection from "@/components/contact-section"
import { ChunkErrorBoundary } from "@/components/chunk-error-boundary"

export default function Home() {
  return (
    <div className="bg-gray-100">
      <ChunkErrorBoundary>
        <HeroSection />
      </ChunkErrorBoundary>
      <ChunkErrorBoundary>
        <CategoriesSection />
      </ChunkErrorBoundary>
      <ChunkErrorBoundary>
        <ProductsSection />
      </ChunkErrorBoundary>
      <ChunkErrorBoundary>
        <SuccessStorySection />
      </ChunkErrorBoundary>
      <ChunkErrorBoundary>
        <AboutSection />
      </ChunkErrorBoundary>
      <ChunkErrorBoundary>
        <ContactSection />
      </ChunkErrorBoundary>
    </div>
  )
}
