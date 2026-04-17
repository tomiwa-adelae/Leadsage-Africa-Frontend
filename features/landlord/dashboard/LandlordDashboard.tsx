"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  IconLoader2,
  IconHome,
  IconFileText,
  IconContract,
  IconCurrencyNaira,
  IconArrowRight,
  IconCalendar,
  IconPigMoney,
  IconWallet,
  IconTrendingUp,
  IconAlertTriangle,
} from "@tabler/icons-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { toast } from "sonner"

import { fetchData } from "@/lib/api"
import { useAuth } from "@/store/useAuth"
import { PageHeader } from "@/components/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// ── Types ──────────────────────────────────────────────────────────────────────

interface DashboardStats {
  totalListings: number
  activeListings: number
  pendingApplications: number
  activeLeases: number
  expiringLeases: number
  thisMonthRevenue: number
}

interface MonthlyRevenue {
  month: string
  revenue: number
}

interface RecentApplication {
  id: string
  status: string
  createdAt: string
  listing: { id: string; slug: string | null; title: string; area: string; state: string; photos: string[] }
  user: { firstName: string; lastName: string; image: string | null }
}

interface RecentBooking {
  id: string
  status: string
  checkIn: string
  checkOut: string
  totalPrice: number
  listing: { id: string; slug: string | null; title: string; area: string; state: string; photos: string[] }
  user: { firstName: string; lastName: string; image: string | null }
}

interface SavingsSummary {
  id: string
  planName: string | null
  balance: number
  interestEarned: number
  status: string
}

interface Dashboard {
  stats: DashboardStats
  monthlyRevenue: MonthlyRevenue[]
  recentApplications: RecentApplication[]
  recentBookings: RecentBooking[]
  wallet: { availableBalance: number; pendingBalance: number }
  savings: SavingsSummary[]
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n)

const fmtFull = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n)

const APP_STATUS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  UNDER_REVIEW: { label: "Under Review", className: "bg-blue-100 text-blue-700 border-blue-200" },
  APPROVED: { label: "Approved", className: "bg-green-100 text-green-700 border-green-200" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-700 border-red-200" },
}

const BOOKING_STATUS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  CONFIRMED: { label: "Confirmed", className: "bg-green-100 text-green-700 border-green-200" },
  CANCELLED: { label: "Cancelled", className: "bg-slate-100 text-slate-500 border-slate-200" },
  COMPLETED: { label: "Completed", className: "bg-blue-100 text-blue-700 border-blue-200" },
}

// ── Component ──────────────────────────────────────────────────────────────────

export function LandlordDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData<Dashboard>("/landlord/dashboard")
      .then(setData)
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false))
  }, [])

  const s = data?.stats

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Welcome back, ${user?.firstName ?? "there"}`}
        description="Here's what's happening with your properties."
      />

      {/* Stat cards */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { icon: IconHome, label: "Total Listings", value: s?.totalListings, sub: `${s?.activeListings ?? 0} active`, href: "/landlord/listings" },
          { icon: IconFileText, label: "Pending Applications", value: s?.pendingApplications, sub: "Need review", href: "/landlord/listings/applications", alert: (s?.pendingApplications ?? 0) > 0 },
          { icon: IconContract, label: "Active Leases", value: s?.activeLeases, sub: s?.expiringLeases ? `${s.expiringLeases} expiring soon` : "All good", href: "/landlord/listings/leases", alert: (s?.expiringLeases ?? 0) > 0 },
          { icon: IconCurrencyNaira, label: "This Month Revenue", value: s ? fmt(s.thisMonthRevenue) : null, isAmount: true, href: "/landlord/earnings" },
          { icon: IconWallet, label: "Wallet Balance", value: data ? fmt(data.wallet.availableBalance) : null, isAmount: true, sub: data?.wallet.pendingBalance ? `${fmt(data.wallet.pendingBalance)} pending` : undefined, href: "/landlord/wallet" },
        ].map(({ icon: Icon, label, value, sub, href, alert, isAmount }) => (
          <Link href={href} key={label}>
            <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className={`rounded-lg p-2 ${alert ? "bg-amber-100" : "bg-primary/10"}`}>
                    <Icon className={`size-5 ${alert ? "text-amber-600" : "text-primary"}`} />
                  </div>
                  <IconArrowRight className="size-4 text-muted-foreground" />
                </div>
                <div className="mt-4">
                  {loading ? (
                    <Skeleton className="h-7 w-20" />
                  ) : (
                    <p className="text-2xl font-bold">{value ?? 0}</p>
                  )}
                  <p className="mt-1 text-sm text-muted-foreground">{label}</p>
                  {sub && (
                    <p className={`mt-0.5 text-xs ${alert ? "text-amber-600 font-medium" : "text-muted-foreground"}`}>
                      {alert && <IconAlertTriangle className="mb-0.5 mr-0.5 inline size-3" />}
                      {sub}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Revenue chart + Savings */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Revenue chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <CardTitle className="text-base">Revenue — Last 6 Months</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-52 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={data?.monthlyRevenue ?? []}
                  margin={{ top: 4, right: 4, left: -8, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => fmt(v)}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(v) => fmtFull(Number(v))}
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: 12,
                    }}
                    cursor={{ fill: "hsl(var(--muted))" }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* FirstKey Savings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <CardTitle className="flex items-center gap-2 text-base">
              <IconPigMoney className="size-4 text-emerald-600" />
              FirstKey Savings
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/firstkey">View</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
            ) : (data?.savings.length ?? 0) === 0 ? (
              <div className="space-y-3 py-4 text-center">
                <p className="text-sm text-muted-foreground">No savings plans yet</p>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/firstkey/new">Start saving</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="mt-1">
                  <p className="text-2xl font-bold text-emerald-600">
                    {fmt(data!.savings.reduce((s, p) => s + p.balance, 0))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total across {data!.savings.length} plan{data!.savings.length > 1 ? "s" : ""}
                  </p>
                  <p className="mt-0.5 text-xs text-emerald-600">
                    <IconTrendingUp className="mb-0.5 mr-0.5 inline size-3" />
                    +{fmt(data!.savings.reduce((s, p) => s + p.interestEarned, 0))} interest
                  </p>
                </div>
                <div className="space-y-1 pt-1">
                  {data!.savings.map((p) => (
                    <Link key={p.id} href={`/firstkey/${p.id}`}>
                      <div className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs hover:bg-muted/40">
                        <span className="font-medium">{p.planName ?? "FirstKey"}</span>
                        <span className="text-muted-foreground">{fmt(p.balance)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications + Bookings */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <CardTitle className="text-base">Recent Applications</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/landlord/listings/applications">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="size-10 shrink-0 rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))
              : (data?.recentApplications.length ?? 0) === 0
                ? <p className="py-6 text-center text-sm text-muted-foreground">No applications yet</p>
                : data!.recentApplications.map((app) => {
                    const badge = APP_STATUS[app.status] ?? { label: app.status, className: "" }
                    return (
                      <div key={app.id} className="flex items-center gap-3 rounded-lg border p-3">
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {app.listing.photos[0] && (
                            <Image src={app.listing.photos[0]} alt={app.listing.title} fill className="object-cover" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{app.listing.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {app.user.firstName} {app.user.lastName}
                          </p>
                        </div>
                        <Badge variant="outline" className={`shrink-0 text-xs ${badge.className}`}>
                          {badge.label}
                        </Badge>
                      </div>
                    )
                  })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <CardTitle className="text-base">Upcoming Bookings</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/landlord/listings/bookings">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="size-10 shrink-0 rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))
              : (data?.recentBookings.length ?? 0) === 0
                ? <p className="py-6 text-center text-sm text-muted-foreground">No bookings yet</p>
                : data!.recentBookings.map((booking) => {
                    const badge = BOOKING_STATUS[booking.status] ?? { label: booking.status, className: "" }
                    return (
                      <div key={booking.id} className="flex items-center gap-3 rounded-lg border p-3">
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {booking.listing.photos[0] && (
                            <Image src={booking.listing.photos[0]} alt={booking.listing.title} fill className="object-cover" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{booking.listing.title}</p>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <IconCalendar className="size-3" />
                            {new Date(booking.checkIn).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                            {" — "}
                            {new Date(booking.checkOut).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-semibold">{fmt(booking.totalPrice)}</p>
                          <Badge variant="outline" className={`mt-0.5 text-[10px] ${badge.className}`}>
                            {badge.label}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
