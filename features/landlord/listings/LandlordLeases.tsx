"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  IconLoader2,
  IconContract,
  IconMapPin,
  IconCalendar,
  IconUser,
  IconArrowRight,
  IconAlertTriangle,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { fetchData } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// ── Types ──────────────────────────────────────────────────────────────────────

interface Lease {
  id: string
  status: string
  startDate: string
  endDate: string
  monthlyRent: number
  cautionFee: number | null
  tenantSignedAt: string | null
  landlordSignedAt: string | null
  createdAt: string
  listing: {
    id: string
    slug: string | null
    title: string
    area: string
    state: string
    photos: string[]
  }
  application: {
    id: string
    status: string
    user: {
      firstName: string
      lastName: string
      email: string
      image: string | null
    }
  }
  payments: {
    id: string
    amount: number
    dueDate: string
    status: string
  }[]
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

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING_TENANT: {
    label: "Awaiting tenant",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  PENDING_LANDLORD: {
    label: "Awaiting your signature",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  FULLY_SIGNED: {
    label: "Active lease",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
}

const PAYMENT_COLOR: Record<string, string> = {
  PENDING: "text-amber-600",
  PAID: "text-emerald-600",
  OVERDUE: "text-red-600",
  WAIVED: "text-muted-foreground",
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000)
}

// ── Component ──────────────────────────────────────────────────────────────────

export function LandlordLeases() {
  const [leases, setLeases] = useState<Lease[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "active" | "pending">("all")

  const load = useCallback(() => {
    setLoading(true)
    fetchData<Lease[]>("/landlord/agreements")
      .then(setLeases)
      .catch(() => toast.error("Failed to load leases"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = leases.filter((l) => {
    if (filter === "active") return l.status === "FULLY_SIGNED"
    if (filter === "pending")
      return ["PENDING_TENANT", "PENDING_LANDLORD"].includes(l.status)
    return true
  })

  const activeCount = leases.filter((l) => l.status === "FULLY_SIGNED").length
  const pendingCount = leases.filter((l) =>
    ["PENDING_TENANT", "PENDING_LANDLORD"].includes(l.status)
  ).length
  const expiringCount = leases.filter((l) => {
    if (l.status !== "FULLY_SIGNED") return false
    const days = daysUntil(l.endDate)
    return days >= 0 && days <= 30
  }).length

  return (
    <div className="space-y-5">
      <PageHeader
        back
        title="Leases"
        description={
          loading
            ? "Loading…"
            : `${activeCount} active · ${pendingCount} pending signature`
        }
      />

      {/* Summary chips */}
      {!loading && expiringCount > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <IconAlertTriangle className="size-4 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800">
            {expiringCount} lease{expiringCount > 1 ? "s are" : " is"} expiring
            within 30 days
          </p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "active", "pending"] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
          <IconLoader2 className="size-5 animate-spin" />
          Loading leases…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border bg-card text-center">
          <IconContract className="size-10 text-muted-foreground/40" />
          <div>
            <p className="font-medium">No leases yet</p>
            <p className="text-sm text-muted-foreground">
              Approved applications will generate lease agreements here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lease) => {
            const cfg = STATUS_CONFIG[lease.status] ?? {
              label: lease.status,
              className: "",
            }
            const tenant = lease.application.user
            const nextPayment = lease.payments.find(
              (p) => p.status === "PENDING" || p.status === "OVERDUE"
            )
            const daysLeft = daysUntil(lease.endDate)
            const expiringSoon =
              lease.status === "FULLY_SIGNED" && daysLeft >= 0 && daysLeft <= 30

            return (
              <Link
                key={lease.id}
                href={`/landlord/agreements/${lease.id}`}
                className="block overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row">
                  {/* Photo */}
                  <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:h-24 sm:w-36">
                    {lease.listing.photos[0] ? (
                      <Image
                        src={lease.listing.photos[0]}
                        alt={lease.listing.title}
                        fill
                        className="object-cover"
                      />
                    ) : null}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">{lease.listing.title}</p>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <IconMapPin className="size-3" />
                            {lease.listing.area}, {lease.listing.state}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${cfg.className}`}
                        >
                          {cfg.label}
                        </Badge>
                      </div>

                      {/* Tenant */}
                      <p className="mt-2 flex items-center gap-1.5 text-sm">
                        <IconUser className="size-3.5 text-muted-foreground" />
                        {tenant.firstName} {tenant.lastName}
                        <span className="text-xs text-muted-foreground">
                          · {tenant.email}
                        </span>
                      </p>

                      {/* Dates */}
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <IconCalendar className="size-3" />
                        {fmtDate(lease.startDate)} — {fmtDate(lease.endDate)}
                        {expiringSoon && (
                          <span className="ml-1 font-medium text-amber-600">
                            ·{" "}
                            {daysLeft === 0
                              ? "Expires today"
                              : `${daysLeft}d left`}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm">
                        <span className="font-semibold">
                          {fmt(lease.monthlyRent)}/mo
                        </span>
                        {nextPayment && (
                          <span
                            className={`ml-2 text-xs ${PAYMENT_COLOR[nextPayment.status] ?? ""}`}
                          >
                            · Next: {fmt(nextPayment.amount)} due{" "}
                            {fmtDate(nextPayment.dueDate)}
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="shrink-0 gap-1 text-xs"
                        tabIndex={-1}
                      >
                        View
                        <IconArrowRight className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {lease.status === "PENDING_LANDLORD" && (
                  <div className="border-t bg-blue-50 px-4 py-2 text-xs font-medium text-blue-700">
                    Action required: Sign this agreement
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
