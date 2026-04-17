import Image from "next/image"
import Link from "next/link"
import { IconStar, IconStarFilled } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

const TESTIMONIALS = [
  {
    name: "Kevin Mutiso",
    role: "Startup Founder",
    rating: 4,
    quote:
      "We moved our workflow here and instantly saw improvements in onboarding, customer communication, and payment handling. I honestly wish we'd switched sooner.",
  },
  {
    name: "Olivia Thompson",
    role: "Digital Marketing Strategist",
    rating: 5,
    quote:
      "Everything feels thoughtfully designed. It's intuitive, fast, and gives me the analytics I need to make smarter decisions. A must-have platform for modern creators.",
  },
  {
    name: "Amara Osei",
    role: "Renter · Lekki, Lagos",
    rating: 5,
    quote:
      "Leadsage made finding my apartment in Lagos completely stress-free. I saved with FirstKey for 6 months and moved into my dream place without a single agent fee.",
  },
  {
    name: "Chukwuemeka Adebayo",
    role: "Landlord · Ikeja, Lagos",
    rating: 4,
    quote:
      "I listed my 3-bedroom on Leadsage and had verified tenants within a week. The lease management system saved me so much back-and-forth with lawyers.",
  },
  {
    name: "Fatimah Bello",
    role: "Student Saver · Ilorin",
    rating: 5,
    quote:
      "The FirstKey savings plan is a game changer for students. I started in 200 level and paid my rent in full before final year. No more begging family.",
  },
  {
    name: "Tunde Adesanya",
    role: "Property Manager · Abuja",
    rating: 4,
    quote:
      "Managing multiple units used to be a spreadsheet nightmare. With Leadsage I track payments, leases, and tenant history in one clean dashboard.",
  },
]

// Duplicate so the marquee loops seamlessly
const TRACK = [...TESTIMONIALS, ...TESTIMONIALS]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) =>
        i < rating ? (
          <IconStarFilled key={i} className="size-3.5 text-amber-400" />
        ) : (
          <IconStar key={i} className="size-3.5 text-white/20" />
        )
      )}
    </div>
  )
}

function TestimonialCard({
  name,
  role,
  rating,
  quote,
}: (typeof TESTIMONIALS)[number]) {
  return (
    <div className="w-72 shrink-0 flex flex-col gap-3 rounded-2xl bg-white/10 border border-white/10 p-5">
      <StarRating rating={rating} />
      <p className="text-sm text-white/80 leading-relaxed line-clamp-4">{quote}</p>
      <div className="flex items-center gap-2.5 pt-2 border-t border-white/10">
        <div className="relative size-8 overflow-hidden rounded-full shrink-0">
          <Image
            src="/assets/images/profile-img.jpg"
            alt={name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <p className="text-xs font-semibold text-white">{name}</p>
          <p className="text-[10px] text-white/50">{role}</p>
        </div>
      </div>
    </div>
  )
}

const AVATARS = [
  "/assets/images/profile-img.jpg",
  "/assets/images/profile-img.jpg",
  "/assets/images/profile-img.jpg",
  "/assets/images/profile-img.jpg",
]

export function TrustSection() {
  return (
    <section className="bg-primary py-14 overflow-hidden">
      <div className="container">
        <div className="grid items-center gap-10 lg:grid-cols-3 mb-12">
          {/* Left: social proof */}
          <div className="flex flex-col gap-4">
            <div className="flex -space-x-2">
              {AVATARS.map((src, i) => (
                <div
                  key={i}
                  className="relative size-9 overflow-hidden rounded-full border-2 border-primary"
                >
                  <Image src={src} alt="customer" fill className="object-cover" />
                </div>
              ))}
              <div className="flex size-9 items-center justify-center rounded-full border-2 border-primary bg-white/15 text-[10px] font-bold text-white">
                50+
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white md:text-3xl">
              Trusted by over<br />50+ homeowners.
            </h2>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              Renters, landlords, and student savers across Nigeria rely on Leadsage every day to
              manage their housing journey.
            </p>
          </div>

          {/* Center: spacer on lg — marquee spans full width below */}
          <div className="hidden lg:block" />

          {/* Right: CTA */}
          <div className="flex flex-col gap-2 lg:text-right lg:items-end">
            <h3 className="text-3xl font-bold text-white md:text-4xl leading-tight">
              Ready to curate<br />your next<br />chapter?
            </h3>
          </div>
        </div>
      </div>

      {/* Marquee — full bleed */}
      <div className="relative w-full overflow-hidden mb-12">
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-primary to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-primary to-transparent" />

        <div className="flex gap-4 animate-marquee w-max">
          {TRACK.map((t, i) => (
            <TestimonialCard key={i} {...t} />
          ))}
        </div>
      </div>

      {/* Bottom CTAs */}
      <div className="container">
        <div className="flex flex-col items-center gap-5">
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="white" size="sm" asChild>
              <Link href="/listings">Browse Properties</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-white/30 text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/landlord/listings/new">List Your Property</Link>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {/* Play Store */}
            <a
              href="#"
              className="flex items-center gap-2.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-white transition-colors hover:bg-white/15"
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.18 23.76A2 2 0 0 1 2 22V2a2 2 0 0 1 1.18-1.76l11.65 11.65L3.18 23.76zM16.5 8.5 5.34 2.07l9.42 9.42L16.5 8.5zm3.32 5.14c.68-.39.68-1.39 0-1.78L17.7 10.5l-2.18 2.17 2.18 2.18 2.12-1.21zM5.34 21.93l11.16-6.43-1.74-1.74-9.42 9.42-.0001-.0001z"/>
              </svg>
              <div className="text-left">
                <p className="text-[9px] text-white/60 leading-none">Get it on</p>
                <p className="text-xs font-semibold leading-tight">Google Play</p>
              </div>
            </a>

            {/* App Store */}
            <a
              href="#"
              className="flex items-center gap-2.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-white transition-colors hover:bg-white/15"
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div className="text-left">
                <p className="text-[9px] text-white/60 leading-none">Download on the</p>
                <p className="text-xs font-semibold leading-tight">App Store</p>
              </div>
            </a>
          </div>

          <p className="text-xs text-white/40">Download the Leadsage App</p>
        </div>
      </div>
    </section>
  )
}
