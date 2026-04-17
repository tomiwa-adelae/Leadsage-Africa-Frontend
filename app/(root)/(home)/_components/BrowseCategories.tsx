import Link from "next/link"
import {
  IconBuildingSkyscraper,
  IconHome,
  IconBriefcase,
  IconBed,
} from "@tabler/icons-react"

const CATEGORIES = [
  {
    label: "Long-term Rentals",
    description: "Apartments, duplexes & houses for rent",
    href: "/listings?type=LONG_TERM",
    icon: IconHome,
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-100 dark:border-emerald-900",
  },
  {
    label: "Shortlets",
    description: "Furnished stays, ready to move in",
    href: "/listings?type=SHORTLET",
    icon: IconBed,
    bg: "bg-blue-50 dark:bg-blue-950/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    border: "border-blue-100 dark:border-blue-900",
  },
  {
    label: "Office Spaces",
    description: "Professional workspaces for businesses",
    href: "/listings?type=OFFICE_SPACE",
    icon: IconBriefcase,
    bg: "bg-violet-50 dark:bg-violet-950/30",
    iconColor: "text-violet-600 dark:text-violet-400",
    border: "border-violet-100 dark:border-violet-900",
  },
  {
    label: "Hotel Rooms",
    description: "Verified, comfortable accommodations",
    href: "/listings?type=HOTEL_ROOM",
    icon: IconBuildingSkyscraper,
    bg: "bg-amber-50 dark:bg-amber-950/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    border: "border-amber-100 dark:border-amber-900",
  },
]

export function BrowseCategories() {
  return (
    <section className="container py-14">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold md:text-3xl">Browse by type</h2>
        <p className="mt-2 text-muted-foreground">
          Find exactly what you need — from a studio shortlet to a long-term family home.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map(({ label, description, href, icon: Icon, bg, iconColor, border }) => (
          <Link
            key={href}
            href={href}
            className={`group flex flex-col gap-4 rounded-2xl border p-5 transition-all hover:shadow-md hover:-translate-y-0.5 ${bg} ${border}`}
          >
            <div className={`inline-flex size-11 items-center justify-center rounded-xl bg-white dark:bg-black/20 shadow-sm ${iconColor}`}>
              <Icon className="size-5" />
            </div>
            <div>
              <p className="font-semibold text-sm group-hover:text-primary transition-colors">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
