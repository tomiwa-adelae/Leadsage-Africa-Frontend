"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  IconLoader2,
  IconSearch,
  IconUser,
  IconMapPin,
  IconArrowRight,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { fetchData } from "@/lib/api"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

// ── Types ──────────────────────────────────────────────────────────────────────

interface ScreeningApp {
  id: string
  status: string
  adminStatus: string | null
  screeningSubmittedAt: string
  nin: string | null
  ninVerified: boolean
  createdAt: string
  listing: {
    id: string
    title: string
    area: string
    state: string
    photos: string[]
    pricePerYear: number | null
  }
  user: {
    firstName: string
    lastName: string
    email: string
    phoneNumber: string | null
    image: string | null
  }
  tourRequest: {
    status: string
    completedAt: string | null
  } | null
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" },
  UNDER_REVIEW: { label: "Under Review", className: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" },
  APPROVED: { label: "Approved", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400" },
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

// ── Main Component ─────────────────────────────────────────────────────────────

export function AdminScreeningApplications() {
  const [apps, setApps] = useState<ScreeningApp[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [search, setSearch] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const url =
        statusFilter !== "ALL"
          ? `/admin/screening-applications?status=${statusFilter}`
          : "/admin/screening-applications"
      const data = await fetchData<ScreeningApp[]>(url)
      setApps(data)
    } catch {
      toast.error("Failed to load applications")
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    load()
  }, [load])

  const filtered = apps.filter((a) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      a.listing.title.toLowerCase().includes(q) ||
      a.user.firstName.toLowerCase().includes(q) ||
      a.user.lastName.toLowerCase().includes(q) ||
      a.user.email.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Screening Applications</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <IconSearch className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search…"
              className="w-48 pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
          <IconLoader2 className="size-5 animate-spin" />
          Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border bg-card text-center">
          <IconUser className="size-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No applications found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => {
            const cfg = STATUS_CONFIG[a.status] ?? { label: a.status, className: "bg-muted text-muted-foreground" }
            const adminCfg = a.adminStatus ? STATUS_CONFIG[a.adminStatus] : null

            return (
              <div
                key={a.id}
                className="flex items-center gap-4 rounded-xl border bg-card p-4"
              >
                {/* Photo */}
                <div className="relative hidden size-14 shrink-0 overflow-hidden rounded-lg sm:block">
                  {a.listing.photos[0] ? (
                    <Image src={a.listing.photos[0]} alt={a.listing.title} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-muted text-xs">—</div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-semibold truncate">{a.listing.title}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <IconMapPin className="size-3" />
                    {a.listing.area}, {a.listing.state}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <IconUser className="size-3" />
                    {a.user.firstName} {a.user.lastName} · {a.user.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Submitted: {fmtDate(a.screeningSubmittedAt)}
                    {a.tourRequest && ` · Tour: ${a.tourRequest.status}`}
                  </p>
                </div>

                {/* Status + action */}
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${cfg.className}`}>
                      {cfg.label}
                    </span>
                    {adminCfg && (
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${adminCfg.className}`}>
                        Admin: {adminCfg.label}
                      </span>
                    )}
                    {a.ninVerified && (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        NIN ✓
                      </span>
                    )}
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/admin/screening-applications/${a.id}`}>
                      Review <IconArrowRight className="size-3.5" />
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
