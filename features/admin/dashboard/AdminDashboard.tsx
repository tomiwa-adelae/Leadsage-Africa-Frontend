"use client"

import { useEffect, useState } from "react"
import {
  IconHome,
  IconUsers,
  IconClipboardCheck,
  IconCircleCheck,
  IconLoader2,
  IconBuildingSkyscraper,
  IconTrendingUp,
  IconUserPlus,
} from "@tabler/icons-react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

import { fetchData } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// ── Types ──────────────────────────────────────────────────────────────────────

interface AdminStats {
  overview: {
    totalListings: number
    pendingListings: number
    publishedListings: number
    rejectedListings: number
    archivedListings: number
    totalUsers: number
    totalLandlords: number
    totalClients: number
    newListingsToday: number
    newUsersToday: number
  }
  listingsByMonth: { month: string; count: number }[]
  usersByMonth: { month: string; count: number }[]
  listingsByStatus: { status: string; count: number }[]
  listingsByType: { type: string; count: number }[]
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: "#16a34a",
  PENDING_REVIEW: "#d97706",
  REJECTED: "#dc2626",
  DRAFT: "#94a3b8",
  ARCHIVED: "#64748b",
}

const TYPE_COLORS = ["#0f172a", "#334155", "#64748b", "#94a3b8"]

const STATUS_LABELS: Record<string, string> = {
  PUBLISHED: "Published",
  PENDING_REVIEW: "Pending",
  REJECTED: "Rejected",
  DRAFT: "Draft",
  ARCHIVED: "Archived",
}

const TYPE_LABELS: Record<string, string> = {
  LONG_TERM: "Long-term",
  SHORTLET: "Shortlet",
  OFFICE_SPACE: "Office Space",
  HOTEL_ROOM: "Hotel Room",
}

// ── Stat Card ──────────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  title: string
  value: number
  sub?: string
  icon: React.ElementType
  accent?: string
}) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">
              {value.toLocaleString()}
            </p>
            {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div
            className="flex size-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: accent ? `${accent}18` : undefined }}
          >
            <Icon
              className="size-5"
              style={{ color: accent ?? "currentColor" }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData<AdminStats>("/admin/stats")
      .then(setStats)
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
        <IconLoader2 className="size-5 animate-spin" />
        <span>Loading dashboard…</span>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-destructive">
        {error ?? "No data available."}
      </div>
    )
  }

  const { overview } = stats

  const statusData = stats.listingsByStatus.map((s) => ({
    name: STATUS_LABELS[s.status] ?? s.status,
    value: s.count,
    fill: STATUS_COLORS[s.status] ?? "#94a3b8",
  }))

  const typeData = stats.listingsByType.map((t, i) => ({
    name: TYPE_LABELS[t.type] ?? t.type,
    count: t.count,
    fill: TYPE_COLORS[i % TYPE_COLORS.length],
  }))

  return (
    <div className="space-y-4">
      <PageHeader title="Dashboard" description="Overview of Leadsage Africa" />

      {/* Stat cards */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Listings"
          value={overview.totalListings}
          sub={`+${overview.newListingsToday} today`}
          icon={IconHome}
          accent="#0f172a"
        />
        <StatCard
          title="Pending Review"
          value={overview.pendingListings}
          sub="Awaiting moderation"
          icon={IconClipboardCheck}
          accent="#d97706"
        />
        <StatCard
          title="Published"
          value={overview.publishedListings}
          sub="Live on platform"
          icon={IconCircleCheck}
          accent="#16a34a"
        />
        <StatCard
          title="Total Users"
          value={overview.totalUsers}
          sub={`+${overview.newUsersToday} today`}
          icon={IconUsers}
          accent="#6366f1"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Landlords"
          value={overview.totalLandlords}
          icon={IconBuildingSkyscraper}
          accent="#0891b2"
        />
        <StatCard
          title="Renters"
          value={overview.totalClients}
          icon={IconUserPlus}
          accent="#7c3aed"
        />
        <StatCard
          title="Rejected"
          value={overview.rejectedListings}
          sub="Need attention"
          icon={IconTrendingUp}
          accent="#dc2626"
        />
      </div>

      {/* Time-series charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              New Listings (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats.listingsByMonth}>
                <defs>
                  <linearGradient id="listingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#0f172a"
                  strokeWidth={2}
                  fill="url(#listingsGrad)"
                  name="Listings"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              New Users (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats.usersByMonth}>
                <defs>
                  <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#usersGrad)"
                  name="Users"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Distribution charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Listings by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={typeData} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" name="Listings" radius={[0, 4, 4, 0]}>
                  {typeData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Listings by Status
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="flex w-full flex-col items-center gap-4 lg:flex-row">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="flex flex-col gap-2">
                {statusData.map((s) => (
                  <div key={s.name} className="flex items-center gap-2 text-xs">
                    <span
                      className="size-2.5 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: s.fill }}
                    />
                    <span className="text-muted-foreground">{s.name}</span>
                    <span className="ml-auto font-medium">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
