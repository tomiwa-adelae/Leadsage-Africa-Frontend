"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  IconBookmark,
  IconClipboardList,
  IconCalendar,
  IconBell,
  IconMapPin,
  IconArrowRight,
  IconPigMoney,
  IconTrendingUp,
  IconWallet,
  IconHomeDot,
  IconFileText,
  IconCurrencyNaira,
  IconBuildingSkyscraper,
  IconBed,
  IconBath,
  IconMoonStars,
  IconCircleCheckFilled,
} from "@tabler/icons-react"

import { fetchData } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { useAuth } from "@/store/useAuth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// ── Types ──────────────────────────────────────────────────────────────────────

interface ListingCard {
  id: string
  slug: string | null
  title: string
  area: string
  state: string
  photos: string[]
  pricePerYear: number | null
  pricePerNight: number | null
  bedrooms: number | null
  bathrooms: number | null
  minimumNights: number | null
  listingType: string
  propertyCategory: string
}

interface SavingsPlanSummary {
  id: string
  planName: string | null
  totalDeposited: number
  interestEarned: number
  status: string
}

interface TourRequest {
  id: string
  status: string
  preferredDate: string | null
  scheduledAt: string | null
  listing: {
    id: string
    slug: string | null
    title: string
    area: string
    state: string
    photos: string[]
  }
}

interface RecentApplication {
  id: string
  status: string
  createdAt: string
  listing: ListingCard
}

interface RecentBooking {
  id: string
  status: string
  checkIn: string
  checkOut: string
  nights: number
  totalPrice: number
  createdAt: string
  listing: ListingCard
}

interface DashboardStats {
  saved: number
  applications: number
  bookings: number
  unreadNotifications: number
  agreements: number
  walletBalance: number
  savings: {
    activePlans: number
    totalBalance: number
    totalInterest: number
    plans: SavingsPlanSummary[]
  }
  recentApplications: RecentApplication[]
  recentBookings: RecentBooking[]
  upcomingTours: TourRequest[]
  featuredListings: ListingCard[]
  featuredShortlets: ListingCard[]
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n)

const APP_STATUS: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  APPROVED: {
    label: "Approved",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
}

const BOOKING_STATUS: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  CONFIRMED: {
    label: "Confirmed",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 border-red-200",
  },
}

const TOUR_STATUS: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  SCHEDULED: {
    label: "Scheduled",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  href,
  loading,
  accent,
}: {
  icon: React.ElementType
  label: string
  value: number
  href: string
  loading: boolean
  accent?: string
}) {
  return (
    <Link href={href}>
      <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
        <CardContent>
          <div className="flex items-start justify-between">
            <div className={`rounded-lg p-2 ${accent ?? "bg-primary/10"}`}>
              <Icon
                className={`size-5 ${accent ? "text-white" : "text-primary"}`}
              />
            </div>
            <IconArrowRight className="size-4 text-muted-foreground" />
          </div>
          <div className="mt-4">
            {loading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-3xl font-bold">{value}</p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">{label}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function PropertyCard({ listing }: { listing: ListingCard }) {
  const href = listing.slug
    ? `/listings/${listing.slug}`
    : `/listings/${listing.id}`
  const isShortlet = listing.listingType === "SHORTLET"

  return (
    <Link href={href} className="block w-60 shrink-0">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative h-36 w-full bg-muted">
          {listing.photos[0] ? (
            <Image
              src={listing.photos[0]}
              alt={listing.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <IconBuildingSkyscraper className="size-8 text-muted-foreground/40" />
            </div>
          )}
          <div className="absolute top-2 left-2">
            <Badge className="bg-primary/90 text-[10px]">
              {isShortlet ? "Shortlet" : "Long-term"}
            </Badge>
          </div>
        </div>
        <CardContent className="p-3">
          <p className="truncate text-sm leading-tight font-medium">
            {listing.title}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <IconMapPin className="size-3 shrink-0" />
            {listing.area}, {listing.state}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-primary">
              {isShortlet
                ? listing.pricePerNight
                  ? `${fmt(listing.pricePerNight)}/night`
                  : "—"
                : listing.pricePerYear
                  ? `${fmt(listing.pricePerYear)}/yr`
                  : "—"}
            </p>
            {!isShortlet &&
              (listing.bedrooms != null || listing.bathrooms != null) && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {listing.bedrooms != null && (
                    <span className="flex items-center gap-0.5">
                      <IconBed className="size-3" />
                      {listing.bedrooms}
                    </span>
                  )}
                  {listing.bathrooms != null && (
                    <span className="flex items-center gap-0.5">
                      <IconBath className="size-3" />
                      {listing.bathrooms}
                    </span>
                  )}
                </div>
              )}
            {isShortlet && listing.minimumNights != null && (
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <IconMoonStars className="size-3" />
                {listing.minimumNights} min
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function SectionHeader({
  title,
  href,
  label = "View all",
}: {
  title: string
  href: string
  label?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-base font-semibold">{title}</h2>
      <Button variant="ghost" size="sm" asChild>
        <Link href={href}>
          {label} <IconArrowRight className="ml-1 size-3" />
        </Link>
      </Button>
    </div>
  )
}

function HorizontalCardSkeleton() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="w-60 shrink-0 space-y-2">
          <Skeleton className="h-36 w-full rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}

// ── Quick Actions ──────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: "Browse Listings", icon: IconBuildingSkyscraper, href: "/" },
  { label: "Find Shortlets", icon: IconHomeDot, href: "/?type=SHORTLET" },
  { label: "Property Tours", icon: IconCalendar, href: "/tours" },
  { label: "Agreements", icon: IconFileText, href: "/agreements" },
  {
    label: "Rental Payments",
    icon: IconCurrencyNaira,
    href: "/rental-payments",
  },
  { label: "FirstKey Savings", icon: IconPigMoney, href: "/firstkey" },
  { label: "Sage Nest Wallet", icon: IconWallet, href: "/wallet" },
  { label: "Saved Listings", icon: IconBookmark, href: "/saved" },
]

function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-1 md:grid-cols-8">
      {QUICK_ACTIONS.map(({ label, icon: Icon, href }) => (
        <Link
          key={label}
          href={href}
          className="flex flex-col items-center gap-1.5 rounded-xl border bg-card p-3 text-center transition-colors hover:bg-muted/60"
        >
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="size-4 text-primary" />
          </div>
          <span className="text-[10px] leading-tight text-muted-foreground">
            {label}
          </span>
        </Link>
      ))}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function UserDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData<DashboardStats>("/user/stats")
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-NG", {
        month: "long",
        year: "numeric",
      })
    : null

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.firstName ?? "there"}`}
        description={
          memberSince ? `Member since ${memberSince}` : "Your housing dashboard"
        }
      />

      {/* Wallet + Savings + Interest */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Link href="/wallet">
          <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
            <CardContent>
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-primary/10 p-2">
                  <IconWallet className="size-5 text-primary" />
                </div>
                <IconArrowRight className="size-4 text-muted-foreground" />
              </div>
              <div className="mt-4">
                {loading ? (
                  <Skeleton className="h-7 w-28" />
                ) : (
                  <p className="text-2xl font-bold">
                    {fmt(stats?.walletBalance ?? 0)}
                  </p>
                )}
                <p className="mt-1 text-sm text-muted-foreground">
                  Sage Nest Balance
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/firstkey">
          <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
            <CardContent>
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
                  <IconPigMoney className="size-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <IconArrowRight className="size-4 text-muted-foreground" />
              </div>
              <div className="mt-4">
                {loading ? (
                  <Skeleton className="h-7 w-28" />
                ) : (
                  <p className="text-2xl font-bold">
                    {fmt(stats?.savings.totalBalance ?? 0)}
                  </p>
                )}
                <p className="mt-1 text-sm text-muted-foreground">
                  FirstKey Savings
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/firstkey">
          <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
            <CardContent>
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                  <IconTrendingUp className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <IconArrowRight className="size-4 text-muted-foreground" />
              </div>
              <div className="mt-4">
                {loading ? (
                  <Skeleton className="h-7 w-28" />
                ) : (
                  <p className="text-2xl font-bold text-emerald-600">
                    +{fmt(stats?.savings.totalInterest ?? 0)}
                  </p>
                )}
                <p className="mt-1 text-sm text-muted-foreground">
                  Interest Earned · 12% p.a.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <h2 className="text-base font-semibold">Quick Actions</h2>
        <QuickActions />
      </div>

      {/* Explore Long-term Listings */}
      <div className="space-y-3">
        <SectionHeader title="Explore Listings" href="/listings" />
        {loading ? (
          <HorizontalCardSkeleton />
        ) : !stats?.featuredListings.length ? null : (
          <div className="scrollbar-thin flex gap-3 overflow-x-auto pb-2">
            {stats.featuredListings.map((l) => (
              <PropertyCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>

      {/* Featured Shortlets */}
      <div className="space-y-3">
        <SectionHeader
          title="Shortlets Near You"
          href="/listings?type=SHORTLET"
          label="See all shortlets"
        />
        {loading ? (
          <HorizontalCardSkeleton />
        ) : !stats?.featuredShortlets.length ? null : (
          <div className="scrollbar-thin flex gap-3 overflow-x-auto pb-2">
            {stats.featuredShortlets.map((l) => (
              <PropertyCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>

      {/* Active Savings Plans */}
      {(loading || (stats?.savings.plans.length ?? 0) > 0) && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <CardTitle className="text-base">FirstKey Savings Plans</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/firstkey">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading
              ? Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="size-9 rounded-lg" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))
              : stats?.savings.plans.map((plan) => (
                  <Link key={plan.id} href={`/firstkey/${plan.id}`}>
                    <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/40">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                          <IconPigMoney className="size-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {plan.planName ?? "FirstKey Plan"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {fmt(plan.totalDeposited + plan.interestEarned)}{" "}
                            saved
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-emerald-600">
                          +{fmt(plan.interestEarned)} interest
                        </p>
                        <Badge
                          variant="outline"
                          className={`mt-0.5 text-[10px] ${
                            plan.status === "ACTIVE"
                              ? "border-emerald-200 text-emerald-700"
                              : plan.status === "MATURED"
                                ? "border-blue-200 text-blue-700"
                                : "text-muted-foreground"
                          }`}
                        >
                          {plan.status}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
          </CardContent>
        </Card>
      )}

      {/* Stat cards */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={IconBookmark}
          label="Saved Listings"
          value={stats?.saved ?? 0}
          href="/saved"
          loading={loading}
        />
        <StatCard
          icon={IconClipboardList}
          label="Applications"
          value={stats?.applications ?? 0}
          href="/applications"
          loading={loading}
        />
        <StatCard
          icon={IconCalendar}
          label="Bookings"
          value={stats?.bookings ?? 0}
          href="/bookings"
          loading={loading}
        />
        <StatCard
          icon={IconBell}
          label="Unread Notifications"
          value={stats?.unreadNotifications ?? 0}
          href="/notifications"
          loading={loading}
          accent={stats?.unreadNotifications ? "bg-red-500" : undefined}
        />
      </div>

      {/* Recent Applications + Recent Bookings */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <CardTitle className="text-base">Recent Applications</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/applications">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="size-12 shrink-0 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : !stats?.recentApplications.length ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No applications yet.{" "}
                <Link href="/" className="text-primary hover:underline">
                  Browse listings
                </Link>
              </div>
            ) : (
              stats.recentApplications.map((app) => {
                const badge = APP_STATUS[app.status] ?? {
                  label: app.status,
                  className: "",
                }
                return (
                  <div
                    key={app.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {app.listing.photos[0] && (
                        <Image
                          src={app.listing.photos[0]}
                          alt={app.listing.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {app.listing.title}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <IconMapPin className="size-3" />
                        {app.listing.area}, {app.listing.state}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 text-xs ${badge.className}`}
                    >
                      {badge.label}
                    </Badge>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <CardTitle className="text-base">Recent Bookings</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/bookings">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="size-12 shrink-0 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : !stats?.recentBookings.length ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No bookings yet.{" "}
                <Link
                  href="/?type=SHORTLET"
                  className="text-primary hover:underline"
                >
                  Find a shortlet
                </Link>
              </div>
            ) : (
              stats.recentBookings.map((booking) => {
                const badge = BOOKING_STATUS[booking.status] ?? {
                  label: booking.status,
                  className: "",
                }
                return (
                  <div
                    key={booking.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {booking.listing.photos[0] && (
                        <Image
                          src={booking.listing.photos[0]}
                          alt={booking.listing.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {booking.listing.title}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <IconCalendar className="size-3" />
                        {new Date(booking.checkIn).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                        })}
                        {" — "}
                        {new Date(booking.checkOut).toLocaleDateString(
                          "en-NG",
                          { day: "numeric", month: "short" }
                        )}
                        {" · "}
                        {booking.nights} night{booking.nights > 1 ? "s" : ""}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 text-xs ${badge.className}`}
                    >
                      {badge.label}
                    </Badge>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Tours + Agreements summary */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <CardTitle className="text-base">Upcoming Tours</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tours">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="size-12 shrink-0 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : !stats?.upcomingTours.length ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No upcoming tours.{" "}
                <Link href="/" className="text-primary hover:underline">
                  Browse listings
                </Link>
              </div>
            ) : (
              stats.upcomingTours.map((tour) => {
                const badge = TOUR_STATUS[tour.status] ?? {
                  label: tour.status,
                  className: "",
                }
                const date = tour.scheduledAt ?? tour.preferredDate
                return (
                  <div
                    key={tour.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {tour.listing.photos[0] && (
                        <Image
                          src={tour.listing.photos[0]}
                          alt={tour.listing.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {tour.listing.title}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <IconMapPin className="size-3" />
                        {tour.listing.area}, {tour.listing.state}
                      </p>
                      {date && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(date).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 text-xs ${badge.className}`}
                    >
                      {badge.label}
                    </Badge>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Agreements quick-access */}
        <div className="grid gap-2">
          <Link href="/agreements">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4">
                <div className="rounded-xl bg-green-100 p-3 dark:bg-green-900/30">
                  <IconCircleCheckFilled className="size-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Rental Agreements</p>
                  <p className="text-sm text-muted-foreground">
                    {loading
                      ? "—"
                      : stats?.agreements
                        ? `${stats.agreements} active agreement${stats.agreements > 1 ? "s" : ""}`
                        : "No active agreements"}
                  </p>
                </div>
                <IconArrowRight className="size-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/rental-payments">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4">
                <div className="rounded-xl bg-primary/10 p-3">
                  <IconCurrencyNaira className="size-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Rental Payments</p>
                  <p className="text-sm text-muted-foreground">
                    Track and manage rent payments
                  </p>
                </div>
                <IconArrowRight className="size-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/saved">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4">
                <div className="rounded-xl bg-rose-100 p-3 dark:bg-rose-900/30">
                  <IconBookmark className="size-6 text-rose-500 dark:text-rose-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Saved Listings</p>
                  <p className="text-sm text-muted-foreground">
                    {loading
                      ? "—"
                      : stats?.saved
                        ? `${stats.saved} saved listing${stats.saved > 1 ? "s" : ""}`
                        : "No saved listings yet"}
                  </p>
                </div>
                <IconArrowRight className="size-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
