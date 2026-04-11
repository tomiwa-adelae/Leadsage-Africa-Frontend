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
  IconCircleX,
  IconSearch,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { fetchData, updateData } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// ── Types ──────────────────────────────────────────────────────────────────────

interface TourRequest {
  id: string
  status: "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELLED"
  preferredDate: string | null
  scheduledAt: string | null
  completedAt: string | null
  notes: string | null
  adminNotes: string | null
  agentNotes: string | null
  createdAt: string
  listing: {
    id: string
    slug: string | null
    title: string
    area: string
    state: string
    photos: string[]
    pricePerYear: number | null
    address: string
  }
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    phoneNumber: string | null
    image: string | null
  }
  agent: {
    id: string
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

export function AdminTours() {
  const [tours, setTours] = useState<TourRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [search, setSearch] = useState("")

  // Schedule dialog
  const [scheduling, setScheduling] = useState<TourRequest | null>(null)
  const [scheduleDate, setScheduleDate] = useState("")
  const [scheduleNotes, setScheduleNotes] = useState("")
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const url = statusFilter !== "ALL" ? `/admin/tours?status=${statusFilter}` : "/admin/tours"
      const data = await fetchData<TourRequest[]>(url)
      setTours(data)
    } catch {
      toast.error("Failed to load tour requests")
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    load()
  }, [load])

  async function handleSchedule() {
    if (!scheduleDate || !scheduling) return
    setSaving(true)
    try {
      await updateData(`/admin/tours/${scheduling.id}/schedule`, {
        scheduledAt: scheduleDate,
        adminNotes: scheduleNotes || undefined,
      })
      toast.success("Tour scheduled")
      setScheduling(null)
      load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to schedule tour")
    } finally {
      setSaving(false)
    }
  }

  async function handleComplete(id: string) {
    try {
      await updateData(`/admin/tours/${id}/complete`, {})
      toast.success("Tour marked as completed")
      load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed")
    }
  }

  async function handleCancel(id: string) {
    try {
      await updateData(`/admin/tours/${id}/cancel`, {})
      toast.success("Tour cancelled")
      load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed")
    }
  }

  const filtered = tours.filter((t) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      t.listing.title.toLowerCase().includes(q) ||
      t.user.firstName.toLowerCase().includes(q) ||
      t.user.lastName.toLowerCase().includes(q) ||
      t.user.email.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Tour Requests</h1>
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
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
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
      ) : filtered.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border bg-card text-center">
          <IconHomeDot className="size-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No tour requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => {
            const cfg = STATUS_CONFIG[t.status]
            return (
              <div
                key={t.id}
                className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-start"
              >
                {/* Photo */}
                <div className="relative hidden size-16 shrink-0 overflow-hidden rounded-lg sm:block">
                  {t.listing.photos[0] ? (
                    <Image src={t.listing.photos[0]} alt={t.listing.title} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-muted text-xs text-muted-foreground">—</div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{t.listing.title}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <IconMapPin className="size-3" />
                        {t.listing.area}, {t.listing.state}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.className}`}>
                      {cfg.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <IconUser className="size-3" />
                      {t.user.firstName} {t.user.lastName} · {t.user.email}
                      {t.user.phoneNumber && ` · ${t.user.phoneNumber}`}
                    </span>
                  </div>

                  {t.preferredDate && (
                    <p className="text-xs text-muted-foreground">
                      Preferred: {fmtDate(t.preferredDate)}
                    </p>
                  )}

                  {t.scheduledAt && (
                    <p className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                      <IconCalendar className="size-3" />
                      Scheduled: {fmtDate(t.scheduledAt)}
                    </p>
                  )}

                  {t.agent && (
                    <p className="text-xs text-muted-foreground">
                      Agent: {t.agent.firstName} {t.agent.lastName}
                      {t.agent.phoneNumber && ` · ${t.agent.phoneNumber}`}
                    </p>
                  )}

                  {t.notes && (
                    <p className="rounded-md bg-muted px-2 py-1 text-xs">
                      Renter note: {t.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex shrink-0 flex-wrap gap-2">
                  {t.status === "PENDING" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setScheduling(t)
                        setScheduleDate(t.preferredDate?.split("T")[0] ?? "")
                        setScheduleNotes("")
                      }}
                    >
                      Schedule
                    </Button>
                  )}
                  {t.status === "SCHEDULED" && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => {
                        setScheduling(t)
                        setScheduleDate(t.scheduledAt?.split("T")[0] ?? "")
                        setScheduleNotes(t.adminNotes ?? "")
                      }}>
                        Reschedule
                      </Button>
                      <Button size="sm" onClick={() => handleComplete(t.id)}>
                        <IconCircleCheck className="size-3.5" />
                        Mark completed
                      </Button>
                    </>
                  )}
                  {["PENDING", "SCHEDULED"].includes(t.status) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => handleCancel(t.id)}
                    >
                      Cancel
                    </Button>
                  )}
                  {t.status === "COMPLETED" && (
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/screening-applications?listing=${t.listing.id}&user=${t.user.id}`}>
                        View application
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Schedule Dialog */}
      <Dialog open={!!scheduling} onOpenChange={(o) => !o && setScheduling(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {scheduling?.status === "SCHEDULED" ? "Reschedule" : "Schedule"} Tour
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Date & time</Label>
              <Input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Notes for renter (optional)</Label>
              <Input
                placeholder="e.g. Meet at the gate, call agent on arrival"
                value={scheduleNotes}
                onChange={(e) => setScheduleNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduling(null)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSchedule} disabled={saving || !scheduleDate}>
              {saving && <IconLoader2 className="size-4 animate-spin" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
