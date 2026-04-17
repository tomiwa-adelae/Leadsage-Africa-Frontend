"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  IconLoader2,
  IconSearch,
  IconPigMoney,
  IconTrendingUp,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { fetchData } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { NairaIcon } from "@/components/NairaIcon"
import { formatMoneyInput } from "@/lib/utils"

// ── Types ──────────────────────────────────────────────────────────────────────

interface SavingsPlan {
  id: string
  planName: string | null
  status: string
  balance: number
  totalDeposited: number
  interestEarned: number
  duration: string
  frequency: string
  startDate: string
  endDate: string
  createdAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    image: string | null
  }
}

interface Stats {
  totalPlans: number
  activePlans: number
  maturedPlans: number
  closedPlans: number
  totalDeposited: number
  totalInterest: number
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ACTIVE: {
    label: "Active",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  PAUSED: {
    label: "Paused",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  MATURED: {
    label: "Matured",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    className: "border-slate-200 bg-slate-50 text-slate-600",
  },
  BROKEN: {
    label: "Broken",
    className: "border-red-200 bg-red-50 text-red-700",
  },
}

function getInitials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase()
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AdminSavings() {
  const [plans, setPlans] = useState<SavingsPlan[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const LIMIT = 20

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
        ...(status !== "all" ? { status } : {}),
        ...(search ? { search } : {}),
      })
      const [data, statsData] = await Promise.all([
        fetchData<{ plans: SavingsPlan[]; total: number }>(
          `/admin/savings?${params}`
        ),
        fetchData<Stats>("/admin/savings/stats"),
      ])
      setPlans(data.plans)
      setTotal(data.total)
      setStats(statsData)
    } catch {
      toast.error("Failed to load savings data")
    } finally {
      setLoading(false)
    }
  }, [page, status, search])

  useEffect(() => {
    const t = setTimeout(load, search ? 400 : 0)
    return () => clearTimeout(t)
  }, [load, search])

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="space-y-5">
      <PageHeader
        back
        title="FirstKey Savings"
        description="All savings plans across the platform"
      />

      {/* Stats */}
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
        {[
          {
            label: "Total Plans",
            value: stats?.totalPlans ?? 0,
            isCount: true,
          },
          { label: "Active", value: stats?.activePlans ?? 0, isCount: true },
          { label: "Matured", value: stats?.maturedPlans ?? 0, isCount: true },
          { label: "Closed", value: stats?.closedPlans ?? 0, isCount: true },
          {
            label: "Total Deposited",
            value: stats?.totalDeposited ?? 0,
            isCount: false,
          },
          {
            label: "Total Interest",
            value: stats?.totalInterest ?? 0,
            isCount: false,
          },
        ].map(({ label, value, isCount }) => (
          <Card key={label}>
            <CardContent>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-0.5 text-lg font-bold">
                {/* {isCount ? value : <NairaIcon />{formatMoneyInput(value as number)}} */}
                {isCount ? (
                  value
                ) : (
                  <>
                    <NairaIcon />
                    {formatMoneyInput(value as number)}
                  </>
                )}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-48 flex-1">
          <IconSearch className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PAUSED">Paused</SelectItem>
            <SelectItem value="MATURED">Matured</SelectItem>
            <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
            <SelectItem value="BROKEN">Broken</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Deposited</TableHead>
              <TableHead className="text-right">Interest</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead>Matures</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center">
                  <IconLoader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : plans.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-12 text-center text-muted-foreground"
                >
                  No savings plans found
                </TableCell>
              </TableRow>
            ) : (
              plans.map((plan) => {
                const badge = STATUS_CONFIG[plan.status] ?? {
                  label: plan.status,
                  className: "",
                }
                return (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-8">
                          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                            {getInitials(
                              plan.user.firstName,
                              plan.user.lastName
                            )}
                          </AvatarFallback>
                          {plan.user.image && (
                            <AvatarImage src={plan.user.image} />
                          )}
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {plan.user.firstName} {plan.user.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {plan.user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <IconPigMoney className="size-4 text-emerald-600" />
                        <div>
                          <p className="text-sm font-medium">
                            {plan.planName ?? "FirstKey"}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {plan.duration.replace(/_/g, " ").toLowerCase()} ·{" "}
                            {plan.frequency.toLowerCase()}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${badge.className}`}
                      >
                        {badge.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      <NairaIcon />
                      {formatMoneyInput(plan.totalDeposited)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-emerald-600">
                      +<NairaIcon />
                      {formatMoneyInput(plan.interestEarned)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold">
                      <NairaIcon />
                      {formatMoneyInput(plan.balance)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {fmtDate(plan.endDate)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/savings/${plan.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of{" "}
            {total}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <IconChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <IconChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
