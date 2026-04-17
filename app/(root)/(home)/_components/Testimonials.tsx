import Image from "next/image"
import { IconQuote } from "@tabler/icons-react"

const TESTIMONIALS = [
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

export function Testimonials() {
  return (
    <section className="bg-muted/40 py-14">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold md:text-3xl">What our users say</h2>
          <p className="mt-2 text-muted-foreground">
            Real stories from renters, landlords, and student savers.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="flex flex-col rounded-2xl border bg-card overflow-hidden"
            >
              {/* Property image */}
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={t.propertyImage}
                  alt={`${t.name} property`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-5 gap-4">
                <IconQuote className="size-6 text-primary opacity-60" />
                <p className="text-sm leading-relaxed text-muted-foreground flex-1">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3 pt-3 border-t">
                  <div className="relative size-9 shrink-0 overflow-hidden rounded-full">
                    <Image src={t.profileImage} alt={t.name} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
