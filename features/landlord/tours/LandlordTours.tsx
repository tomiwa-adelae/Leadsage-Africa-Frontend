"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  IconLoader2,
  IconHomeDot,
  IconCalendar,
  IconMapPin,
  IconUser,
  IconClockHour4,
  IconCircleCheck,
  IconArrowRight,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { fetchData } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ── Types ──────────────────────────────────────────────────────────────────────

interface TourRequest {
  id: string
  status: "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELLED"
  preferredDate: string | null
  scheduledAt: string | null
  notes: string | null
  adminNotes: string | null
  createdAt: string
  listing: {
    id: string
    slug: string | null
    title: string
    area: string
    state: string
    photos: string[]
  }
  user: {
    firstName: string
    lastName: string
    email: string
    phoneNumber: string | null
    image: string | null
  }
  agent: {
    firstName: string
    lastName: string
    phoneNumber: string | null
  } | null
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" },
  SCHEDULED: { label: "Scheduled", className: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" },
  COMPLETED: { label: "Completed", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" },
  CANCELLED: { label: "Cancelled", className: "bg-muted text-muted-foreground" },
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })

// ── Main Component ─────────────────────────────────────────────────────────────

export function LandlordTours() {
  const [tours, setTours] = useState<TourRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("ALL")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const url = filter !== "ALL" ? `/landlord/tours?status=${filter}` : "/landlord/tours"
      const data = await fetchData<TourRequest[]>(url)
      setTours(data)
    } catch {
      toast.error("Failed to load tours")
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          back
          title="Property Tours"
          description="Tour requests for your listings"
        />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
          <IconLoader2 className="size-5 animate-spin" />
          Loading…
        </div>
      ) : tours.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border bg-card text-center">
          <IconHomeDot className="size-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No tour requests yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tours.map((t) => {
            const cfg = STATUS_CONFIG[t.status]

            return (
              <div
                key={t.id}
                className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center"
              >
                {/* Photo */}
                <div className="relative hidden size-14 shrink-0 overflow-hidden rounded-lg sm:block">
                  {t.listing.photos[0] ? (
                    <Image src={t.listing.photos[0]} alt={t.listing.title} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-muted text-xs text-muted-foreground">—</div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Link
                    href={`/landlord/listings/${t.listing.slug ?? t.listing.id}`}
                    className="font-semibold hover:underline truncate block"
                  >
                    {t.listing.title}
                  </Link>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <IconMapPin className="size-3" />
                    {t.listing.area}, {t.listing.state}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <IconUser className="size-3" />
                    {t.user.firstName} {t.user.lastName} · {t.user.email}
                    {t.user.phoneNumber && ` · ${t.user.phoneNumber}`}
                  </p>
                  {t.scheduledAt && (
                    <p className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                      <IconCalendar className="size-3" />
                      {fmtDate(t.scheduledAt)}
                    </p>
                  )}
                  {t.agent && (
                    <p className="text-xs text-muted-foreground">
                      Agent: {t.agent.firstName} {t.agent.lastName}
                    </p>
                  )}
                </div>

                {/* Right */}
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${cfg.className}`}>
                    {cfg.label}
                  </span>
                  <p className="text-xs text-muted-foreground">{fmtDate(t.createdAt)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
