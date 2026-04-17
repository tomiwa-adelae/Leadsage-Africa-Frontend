import Image from "next/image"
import Link from "next/link"
import { IconMapPin, IconBed, IconBath, IconArrowRight } from "@tabler/icons-react"
import { publicFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Listing {
  id: string
  slug: string | null
  title: string
  listingType: string
  propertyCategory: string
  state: string
  lga: string
  area: string
  bedrooms: number
  bathrooms: number
  furnished: string
  pricePerYear: number | null
  pricePerNight: number | null
  photos: string[]
}

interface BrowseResponse {
  listings: Listing[]
  total: number
}

const TYPE_LABEL: Record<string, string> = {
  LONG_TERM: "Long-term",
  SHORTLET: "Shortlet",
  OFFICE_SPACE: "Office",
  HOTEL_ROOM: "Hotel",
}

const TYPE_COLOR: Record<string, string> = {
  LONG_TERM: "bg-emerald-100 text-emerald-700",
  SHORTLET: "bg-blue-100 text-blue-700",
  OFFICE_SPACE: "bg-violet-100 text-violet-700",
  HOTEL_ROOM: "bg-amber-100 text-amber-700",
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n)
}

function ListingCard({ listing }: { listing: Listing }) {
  const href = `/listings/${listing.slug ?? listing.id}`
  const price = listing.pricePerYear ?? listing.pricePerNight
  const priceSuffix = listing.pricePerYear ? "/yr" : "/night"
  const photo = listing.photos[0]
  const typeColor = TYPE_COLOR[listing.listingType] ?? "bg-muted text-muted-foreground"

  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border bg-card overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5"
    >
      {/* Photo */}
      <div className="relative h-48 bg-muted overflow-hidden">
        {photo ? (
          <Image
            src={photo}
            alt={listing.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
            No photo
          </div>
        )}
        <span className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-semibold ${typeColor}`}>
          {TYPE_LABEL[listing.listingType] ?? listing.listingType}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <p className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
          {listing.title}
        </p>

        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <IconMapPin className="size-3.5 shrink-0" />
          {listing.area}, {listing.state}
        </p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto pt-2 border-t">
          {listing.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <IconBed className="size-3.5" /> {listing.bedrooms} bed
            </span>
          )}
          {listing.bathrooms > 0 && (
            <span className="flex items-center gap-1">
              <IconBath className="size-3.5" /> {listing.bathrooms} bath
            </span>
          )}
          {price && (
            <span className="ml-auto font-semibold text-foreground">
              {fmt(price)}<span className="font-normal text-muted-foreground">{priceSuffix}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export async function FeaturedListings() {
  let data: BrowseResponse | null = null
  try {
    data = await publicFetch<BrowseResponse>("/api/listings/public?limit=9&page=1")
  } catch {
    return null
  }

  if (!data?.listings?.length) return null

  // Group by state
  const grouped = data.listings.reduce<Record<string, Listing[]>>((acc, l) => {
    const key = l.state ?? "Other"
    if (!acc[key]) acc[key] = []
    acc[key].push(l)
    return acc
  }, {})

  const states = Object.keys(grouped).sort((a, b) => {
    // Lagos first, then Abuja, then alphabetical
    const priority = ["Lagos", "Abuja"]
    const ai = priority.indexOf(a)
    const bi = priority.indexOf(b)
    if (ai !== -1 && bi === -1) return -1
    if (ai === -1 && bi !== -1) return 1
    return a.localeCompare(b)
  })

  return (
    <section className="bg-muted/40 py-14">
      <div className="container space-y-10">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Featured properties</h2>
            <p className="mt-2 text-muted-foreground">
              Hand-picked, verified listings across Nigeria.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/listings" className="flex items-center gap-1.5">
              View all <IconArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {states.map((state) => (
          <div key={state}>
            <h3 className="text-lg font-semibold mb-4">
              Properties in {state}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {grouped[state].map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
