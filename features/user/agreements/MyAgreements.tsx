"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  IconLoader2,
  IconFileText,
  IconMapPin,
  IconCalendar,
  IconCircleCheck,
  IconClockHour4,
  IconArrowRight,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { fetchData } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ── Types ──────────────────────────────────────────────────────────────────────

interface Agreement {
  id: string
  status: "PENDING_TENANT" | "PENDING_LANDLORD" | "FULLY_SIGNED" | "CANCELLED"
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
  payments: {
    id: string
    amount: number
    dueDate: string
    status: string
    installmentNo: number | null
  }[]
}

// ── Constants ──────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  { value: "PENDING_TENANT", label: "Awaiting my signature" },
  { value: "PENDING_LANDLORD", label: "Awaiting landlord" },
  { value: "FULLY_SIGNED", label: "Fully signed" },
  { value: "CANCELLED", label: "Cancelled" },
]

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; icon: typeof IconCircleCheck }
> = {
  PENDING_TENANT: {
    label: "Awaiting your signature",
    className: "bg-amber-100 text-amber-700 border-amber-200",
    icon: IconClockHour4,
  },
  PENDING_LANDLORD: {
    label: "Awaiting landlord",
    className: "bg-blue-100 text-blue-700 border-blue-200",
    icon: IconClockHour4,
  },
  FULLY_SIGNED: {
    label: "Fully signed",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: IconCircleCheck,
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-slate-100 text-slate-500 border-slate-200",
    icon: IconClockHour4,
  },
}

const PAYMENT_STATUS_COLOR: Record<string, string> = {
  PENDING: "text-amber-600",
  PAID: "text-emerald-600",
  OVERDUE: "text-red-600",
  WAIVED: "text-muted-foreground",
}

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

// ── Component ──────────────────────────────────────────────────────────────────

export function MyAgreements() {
  const [agreements, setAgreements] = useState<Agreement[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("ALL")

  const load = useCallback(() => {
    setLoading(true)
    fetchData<Agreement[]>("/user/agreements")
      .then(setAgreements)
      .catch(() => toast.error("Failed to load agreements"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered =
    statusFilter === "ALL"
      ? agreements
      : agreements.filter((a) => a.status === statusFilter)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          back
          title="My Agreements"
          description={
            loading
              ? "Loading…"
              : `${agreements.length} agreement${agreements.length !== 1 ? "s" : ""}`
          }
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
          <IconLoader2 className="size-5 animate-spin" />
          Loading agreements…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border bg-card text-center">
          <IconFileText className="size-10 text-muted-foreground/40" />
          <div>
            <p className="font-medium">
              {statusFilter === "ALL"
                ? "No agreements yet"
                : `No ${STATUS_CONFIG[statusFilter]?.label ?? statusFilter} agreements`}
            </p>
            {statusFilter === "ALL" && (
              <p className="text-sm text-muted-foreground">
                Tenancy agreements will appear here once a landlord generates
                one for you.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((agreement) => {
            const cfg = STATUS_CONFIG[agreement.status] ?? {
              label: agreement.status,
              className: "",
              icon: IconClockHour4,
            }
            const StatusIcon = cfg.icon

            const nextPayment = agreement.payments.find(
              (p) => p.status === "PENDING" || p.status === "OVERDUE"
            )

            return (
              <Link
                key={agreement.id}
                href={`/agreements/${agreement.id}`}
                className="block overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row">
                  {/* Photo */}
                  <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:h-28 sm:w-40">
                    {agreement.listing.photos[0] ? (
                      <Image
                        src={agreement.listing.photos[0]}
                        alt={agreement.listing.title}
                        fill
                        className="object-cover"
                      />
                    ) : null}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">
                            {agreement.listing.title}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <IconMapPin className="size-3" />
                            {agreement.listing.area}, {agreement.listing.state}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`flex items-center gap-1 text-xs ${cfg.className}`}
                        >
                          <StatusIcon className="size-3" />
                          {cfg.label}
                        </Badge>
                      </div>

                      <p className="mt-2 text-sm font-semibold">
                        {fmt(agreement.monthlyRent)}/month
                      </p>

                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <IconCalendar className="size-3" />
                          {fmtDate(agreement.startDate)} —{" "}
                          {fmtDate(agreement.endDate)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      {nextPayment ? (
                        <p
                          className={`text-xs font-medium ${PAYMENT_STATUS_COLOR[nextPayment.status] ?? ""}`}
                        >
                          Next payment: {fmt(nextPayment.amount)} due{" "}
                          {fmtDate(nextPayment.dueDate)}
                        </p>
                      ) : (
                        <span />
                      )}
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

                {/* Action required banner */}
                {agreement.status === "PENDING_TENANT" && (
                  <div className="border-t bg-amber-50 px-4 py-2 text-xs font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                    Action required: Please sign this agreement
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
