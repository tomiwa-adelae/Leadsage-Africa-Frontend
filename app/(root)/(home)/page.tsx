import { Suspense } from "react"
import { Hero } from "./_components/Hero"
import { BrowseCategories } from "./_components/BrowseCategories"
import { SavingsShowcase } from "./_components/SavingsShowcase"
import { FeaturedListings } from "./_components/FeaturedListings"
import { PropertyCuration } from "./_components/PropertyCuration"
import { HowItWorks } from "./_components/HowItWorks"
import { FirstKeySection } from "./_components/FirstKeySection"
import { TrustSection } from "./_components/TrustSection"
import { BlogPreview } from "./_components/BlogPreview"
import { CTABanner } from "./_components/CTABanner"

export default function HomePage() {
  return (
    <div>
      <Hero />
      <BrowseCategories />
      <SavingsShowcase />
      <Suspense fallback={null}>
        <FeaturedListings />
      </Suspense>
      <PropertyCuration />
      <HowItWorks />
      <FirstKeySection />
      <TrustSection />
      <BlogPreview />
      <CTABanner />
    </div>
  )
}
