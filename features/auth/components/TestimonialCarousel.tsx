"use client"

import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import Image from "next/image"
import { useCallback, useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type Testimonial = {
  id: number
  quote: string
  name: string
  role: string
  profileImage: string
  propertyImage: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote:
      "Leadsage made finding my apartment in Lagos completely stress-free. I saved with FirstKey for 6 months and moved into my dream place without a single agent fee.",
    name: "Amara Osei",
    role: "Renter · Lekki, Lagos",
    profileImage: "/assets/images/profile-img.jpg",
    propertyImage: "/assets/testimonials/property-1.jpg",
  },
  {
    id: 2,
    quote:
      "I listed my 3-bedroom on Leadsage and had verified tenants within a week. The lease management system saved me so much back-and-forth.",
    name: "Chukwuemeka Adebayo",
    role: "Landlord · Ikeja, Lagos",
    profileImage: "/assets/images/profile-img.jpg",
    propertyImage: "/assets/testimonials/property-2.jpg",
  },
  {
    id: 3,
    quote:
      "The FirstKey savings plan is a game changer for students. I started saving in 200 level and paid my rent in full before final year. No more begging family.",
    name: "Fatimah Bello",
    role: "Student Saver · Ilorin",
    profileImage: "/assets/images/profile-img.jpg",
    propertyImage: "/assets/testimonials/property-3.jpg",
  },
]

export function TestimonialCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ])
  const [selectedIndex, setSelectedIndex] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on("select", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi, onSelect])

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  )

  return (
    <div className="relative h-full w-full overflow-hidden" ref={emblaRef}>
      {/* Slides */}
      <div className="flex h-full">
        {testimonials.map((t) => (
          <div key={t.id} className="relative h-full min-w-full flex-shrink-0">
            {/* Property image */}
            <Image
              src={t.propertyImage}
              alt={`${t.name}'s property`}
              fill
              className="object-cover"
              priority
            />

            {/* Gradient overlay — dark at bottom, transparent at top */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

            {/* Leadsage branding — top left */}
            <div className="absolute top-8 left-8">
              <span className="text-sm font-medium tracking-wide text-white/80">
                Leadsage Africa
              </span>
            </div>

            {/* Testimonial content — bottom */}
            <div className="absolute right-0 bottom-0 left-0 p-8 pb-10">
              {/* Quote mark */}
              <span className="font-serif text-5xl leading-none text-primary select-none">
                &ldquo;
              </span>

              {/* Quote text */}
              <p className="mt-1 max-w-sm text-base leading-relaxed font-medium text-white">
                {t.quote}
              </p>

              {/* Person info */}
              <div className="mt-5 flex items-center gap-3">
                <div className="relative size-10 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-white/30">
                  <Image
                    src={t.profileImage}
                    alt={t.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-white/60">{t.role}</p>
                </div>
              </div>

              {/* Dot indicators */}
              <div className="mt-6 flex items-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={cn(
                      "rounded-full transition-all duration-300",
                      i === selectedIndex
                        ? "h-2 w-6 bg-primary"
                        : "h-2 w-2 bg-white/40 hover:bg-white/60"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
