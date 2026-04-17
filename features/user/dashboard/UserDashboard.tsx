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
} from "@tabler/icons-react"

import { fetchData } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { useAuth } from "@/store/useAuth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// ── Types ──────────────────────────────────────────────────────────────────────

interface SavingsPlanSummary {
  id: string
  planName: string | null
  totalDeposited: number
  interestEarned: number
  status: string
}

interface DashboardStats {
  saved: number
  applications: number
  bookings: number
  unreadNotifications: number
  walletBalance: number
  savings: {
    activePlans: number
    totalBalance: number
    totalInterest: number
    plans: SavingsPlanSummary[]
  }
  recentApplications: RecentApplication[]
  recentBookings: RecentBooking[]
}

interface RecentApplication {
  id: string
  status: string
  createdAt: string
  listing: {
    id: string
    slug: string | null
    title: string
    area: string
    state: string
    photos: string[]
    pricePerYear: number | null
    listingType: string
  }
}

interface RecentBooking {
  id: string
  status: string
  checkIn: string
  checkOut: string
  nights: number
  totalPrice: number
  createdAt: string
  listing: {
    id: string
    slug: string | null
    title: string
    area: string
    state: string
    photos: string[]
    pricePerNight: number | null
  }
}

// ── Constants ──────────────────────────────────────────────────────────────────

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

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n)

// ── Stat Card ──────────────────────────────────────────────────────────────────

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

      {/* Savings + Wallet overview */}
      <div className="grid gap-3 sm:grid-cols-3">
        {/* Wallet balance */}
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
                  Wallet Balance
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Savings total balance */}
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

        {/* Interest earned */}
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

      {/* Active savings plans */}
      {(loading || (stats?.savings.plans.length ?? 0) > 0) && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <CardTitle className="text-base">FirstKey Savings Plans</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/firstkey">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-9 rounded-lg" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              ))
            ) : (
              stats?.savings.plans.map((plan) => (
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
                          {fmt(plan.totalDeposited + plan.interestEarned)} saved
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
              ))
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Applications */}
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
                  <Skeleton className="size-12 flex-shrink-0 rounded-lg" />
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
                    <div className="relative size-12 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
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
                      className={`flex-shrink-0 text-xs ${badge.className}`}
                    >
                      {badge.label}
                    </Badge>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
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
                  <Skeleton className="size-12 flex-shrink-0 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : !stats?.recentBookings.length ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No bookings yet.{" "}
                <Link href="/" className="text-primary hover:underline">
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
                    <div className="relative size-12 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
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
                      className={`flex-shrink-0 text-xs ${badge.className}`}
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
    </div>
  )
}
