"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  IconLoader2,
  IconFileText,
  IconArrowRight,
  IconCircleCheck,
  IconClockHour4,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { fetchData, postData } from "@/lib/api"
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
  createdAt: string
  listing: {
    id: string
    title: string
    area: string
    state: string
    photos: string[]
  }
  application: {
    id: string
    user: {
      firstName: string
      lastName: string
      email: string
    }
  }
  payments: { id: string; amount: number; status: string }[]
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  PENDING_TENANT: { label: "Awaiting tenant", className: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" },
  PENDING_LANDLORD: { label: "Awaiting landlord", className: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" },
  FULLY_SIGNED: { label: "Fully signed", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" },
  CANCELLED: { label: "Cancelled", className: "bg-muted text-muted-foreground" },
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n)

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })

// ── Main Component ─────────────────────────────────────────────────────────────

export function AdminAgreements() {
  const [agreements, setAgreements] = useState<Agreement[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [releasing, setReleasing] = useState(false)

  async function handleReleaseOverdue() {
    setReleasing(true)
    try {
      const res = await postData<{ backfilled: number; released: number }>(
        "/admin/escrows/release-overdue",
        {}
      )
      toast.success(
        `Done — ${res.released} payment(s) released${res.backfilled > 0 ? `, ${res.backfilled} escrow record(s) backfilled` : ""}.`
      )
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to release escrows")
    } finally {
      setReleasing(false)
    }
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const url = statusFilter !== "ALL" ? `/admin/agreements?status=${statusFilter}` : "/admin/agreements"
      const data = await fetchData<Agreement[]>(url)
      setAgreements(data)
    } catch {
      toast.error("Failed to load agreements")
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Rental Agreements</h1>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleReleaseOverdue}
            disabled={releasing}
          >
            {releasing ? (
              <IconLoader2 className="size-3.5 animate-spin" />
            ) : null}
            Release overdue payments
          </Button>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="PENDING_TENANT">Awaiting tenant</SelectItem>
            <SelectItem value="PENDING_LANDLORD">Awaiting landlord</SelectItem>
            <SelectItem value="FULLY_SIGNED">Fully signed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
          <IconLoader2 className="size-5 animate-spin" />
          Loading…
        </div>
      ) : agreements.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border bg-card text-center">
          <IconFileText className="size-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No agreements found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {agreements.map((a) => {
            const cfg = STATUS_CONFIG[a.status]
            const paidCount = a.payments.filter((p) => p.status === "PAID").length

            return (
              <div key={a.id} className="flex items-center gap-4 rounded-xl border bg-card p-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-semibold truncate">{a.listing.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.listing.area}, {a.listing.state}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tenant: {a.application.user.firstName} {a.application.user.lastName} · {a.application.user.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {fmtDate(a.startDate)} → {fmtDate(a.endDate)} · {fmt(a.monthlyRent)}/mo
                    {a.payments.length > 0 && ` · Payments: ${paidCount}/${a.payments.length} paid`}
                  </p>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${cfg.className}`}>
                    {cfg.label}
                  </span>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/admin/agreements/${a.id}`}>
                      View <IconArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
