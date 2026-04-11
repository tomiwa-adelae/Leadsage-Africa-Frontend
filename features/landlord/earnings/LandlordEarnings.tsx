"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  IconLoader2,
  IconCurrencyNaira,
  IconCalendar,
  IconMapPin,
  IconMoon,
  IconClockHour4,
  IconCircleCheck,
  IconInfoCircle,
  IconDownload,
} from "@tabler/icons-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { toast } from "sonner"

import { fetchData } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ── Types ──────────────────────────────────────────────────────────────────────

interface Transaction {
  id: string
  status: string
  paymentStatus: string
  checkIn: string
  checkOut: string
  nights: number
  totalPrice: number
  refundAmount: number | null
  createdAt: string
  listing: {
    id: string
    slug: string | null
    title: string
    photos: string[]
  }
  user: {
    firstName: string
    lastName: string
    image: string | null
  }
}

interface EarningsData {
  totalEarned: number
  totalPending: number
  thisMonthEarned: number
  completedCount: number
  pendingCount: number
  monthly: { month: string; amount: number }[]
  transactions: Transaction[]
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n)

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

// ── Stat Card ──────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string
  value: string
  sub?: string
  highlight?: boolean
}) {
  return (
    <Card className={highlight ? "border-primary/30 bg-primary/5" : ""}>
      <CardContent className="pt-5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={`mt-1 text-2xl font-bold ${highlight ? "text-primary" : ""}`}
        >
          {value}
        </p>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  )
}

// ── CSV Export ─────────────────────────────────────────────────────────────────

function exportCSV(transactions: Transaction[]) {
  const header = ["Date", "Listing", "Guest", "Nights", "Amount", "Status"]
  const rows = transactions.map((t) => [
    fmtDate(t.createdAt),
    `"${t.listing.title}"`,
    `"${t.user.firstName} ${t.user.lastName}"`,
    t.nights,
    t.totalPrice - (t.refundAmount ?? 0),
    t.status,
  ])
  const csv = [header, ...rows].map((r) => r.join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `leadsage-earnings-${new Date().toISOString().split("T")[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function LandlordEarnings() {
  const [data, setData] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"ALL" | "COMPLETED" | "CONFIRMED">("ALL")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchData<EarningsData>("/landlord/earnings")
      setData(res)
    } catch {
      toast.error("Failed to load earnings")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
        <IconLoader2 className="size-5 animate-spin" />
        Loading earnings…
      </div>
    )
  }

  if (!data) return null

  const filtered =
    filter === "ALL"
      ? data.transactions
      : data.transactions.filter((t) => t.status === filter)

  const chartData = data.monthly.map((m) => ({
    month: m.month.split(" ")[0], // "Apr 2025" → "Apr"
    amount: m.amount,
  }))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          back
          title="Earnings"
          description="Revenue from your shortlet and hotel bookings"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => exportCSV(data.transactions)}
        >
          <IconDownload className="size-4" />
          Export CSV
        </Button>
      </div>

      {/* Wallet coming-soon banner */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
        <IconInfoCircle className="mt-0.5 size-4 flex-shrink-0" />
        <p>
          Wallet withdrawals are coming soon. Your earnings are held securely
          and will be withdrawable once your wallet is set up.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total earned"
          value={fmt(data.totalEarned)}
          sub={`${data.completedCount} completed stay${data.completedCount !== 1 ? "s" : ""}`}
          highlight
        />
        <StatCard
          label="Pending payout"
          value={fmt(data.totalPending)}
          sub={`${data.pendingCount} confirmed booking${data.pendingCount !== 1 ? "s" : ""}`}
        />
        <StatCard
          label="This month"
          value={fmt(data.thisMonthEarned)}
          sub="Completed stays"
        />
        <StatCard
          label="Total revenue"
          value={fmt(data.totalEarned + data.totalPending)}
          sub="Earned + pending"
        />
      </div>

      {/* Chart */}
      {data.monthly.some((m) => m.amount > 0) && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-sm">
              Monthly earnings (last 12 months)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={chartData}
                margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="earningsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11 }}
                  className="text-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) =>
                    v >= 1_000_000
                      ? `₦${(v / 1_000_000).toFixed(1)}M`
                      : v >= 1_000
                        ? `₦${(v / 1_000).toFixed(0)}K`
                        : `₦${v}`
                  }
                  className="text-muted-foreground"
                />
                <Tooltip
                  formatter={(value) => [fmt(Number(value)), "Earned"]}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#earningsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Transaction list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">
            {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
          </p>
          <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="COMPLETED">Earned (completed)</SelectItem>
              <SelectItem value="CONFIRMED">Pending (confirmed)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border bg-card text-center">
            <IconCurrencyNaira className="size-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((t) => {
              const net = t.totalPrice - (t.refundAmount ?? 0)
              const guestInitials =
                `${t.user.firstName?.[0] ?? ""}${t.user.lastName?.[0] ?? ""}`.toUpperCase()
              const isCompleted = t.status === "COMPLETED"

              return (
                <div
                  key={t.id}
                  className="flex items-center gap-4 rounded-xl border bg-card p-4"
                >
                  {/* Listing photo */}
                  <div className="relative hidden size-14 flex-shrink-0 overflow-hidden rounded-lg sm:block">
                    {t.listing.photos[0] ? (
                      <Image
                        src={t.listing.photos[0]}
                        alt={t.listing.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-muted text-xs text-muted-foreground">
                        —
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <Link
                      href={`/landlord/listings/bookings/${t.id}`}
                      className="truncate text-sm font-semibold hover:underline"
                    >
                      {t.listing.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <IconCalendar className="size-3" />
                        {fmtDate(t.checkIn)} → {fmtDate(t.checkOut)}
                      </span>
                      <span className="flex items-center gap-1">
                        <IconMoon className="size-3" />
                        {t.nights} night{t.nights > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-5">
                        <AvatarImage src={t.user.image ?? undefined} />
                        <AvatarFallback className="text-[10px]">
                          {guestInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {t.user.firstName} {t.user.lastName}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">{fmt(net)}</p>
                    {t.refundAmount ? (
                      <p className="text-xs text-red-500">
                        −{fmt(t.refundAmount)} refunded
                      </p>
                    ) : null}
                    <div className="mt-1 flex items-center justify-end gap-1">
                      {isCompleted ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-600">
                          <IconCircleCheck className="size-3.5" />
                          Earned
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-amber-600">
                          <IconClockHour4 className="size-3.5" />
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {fmtDate(t.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
