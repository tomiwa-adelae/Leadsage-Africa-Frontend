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
  IconArrowRight,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { fetchData, deleteData } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// ── Types ──────────────────────────────────────────────────────────────────────

interface TourRequest {
  id: string
  status: "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELLED"
  preferredDate: string | null
  scheduledAt: string | null
  completedAt: string | null
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
    pricePerYear: number | null
    address: string
  }
  agent: {
    firstName: string
    lastName: string
    phoneNumber: string | null
    image: string | null
  } | null
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    icon: IconClockHour4,
    className: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  },
  SCHEDULED: {
    label: "Scheduled",
    icon: IconCalendar,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  },
  COMPLETED: {
    label: "Completed",
    icon: IconCircleCheck,
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: IconCircleX,
    className: "bg-muted text-muted-foreground",
  },
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n)

// ── Main Component ─────────────────────────────────────────────────────────────

export function MyTours() {
  const [tours, setTours] = useState<TourRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchData<TourRequest[]>("/user/tours")
      setTours(data)
    } catch {
      toast.error("Failed to load tour requests")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleCancel(id: string) {
    setCancelling(id)
    try {
      await deleteData(`/user/tours/${id}`)
      setTours((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "CANCELLED" } : t))
      )
      toast.success("Tour request cancelled")
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to cancel")
    } finally {
      setCancelling(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
        <IconLoader2 className="size-5 animate-spin" />
        Loading tours…
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader
        back
        title="My Tour Requests"
        description="Track your property inspection requests"
      />

      {tours.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border bg-card text-center">
          <IconHomeDot className="size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No tour requests yet</p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/listings">Browse long-term rentals</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {tours.map((tour) => {
            const cfg = STATUS_CONFIG[tour.status]
            const StatusIcon = cfg.icon

            return (
              <div
                key={tour.id}
                className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center"
              >
                {/* Listing photo */}
                <div className="relative hidden size-20 flex-shrink-0 overflow-hidden rounded-lg sm:block">
                  {tour.listing.photos[0] ? (
                    <Image
                      src={tour.listing.photos[0]}
                      alt={tour.listing.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-muted text-xs text-muted-foreground">
                      —
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Link
                    href={`/listings/${tour.listing.slug ?? tour.listing.id}`}
                    className="truncate text-sm font-semibold hover:underline"
                  >
                    {tour.listing.title}
                  </Link>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <IconMapPin className="size-3" />
                      {tour.listing.area}, {tour.listing.state}
                    </span>
                    {tour.listing.pricePerYear && (
                      <span>{fmt(tour.listing.pricePerYear)}/yr</span>
                    )}
                  </div>

                  {tour.scheduledAt && (
                    <p className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                      <IconCalendar className="size-3" />
                      Scheduled: {fmtDate(tour.scheduledAt)}
                    </p>
                  )}

                  {tour.agent && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <IconUser className="size-3" />
                      Agent: {tour.agent.firstName} {tour.agent.lastName}
                      {tour.agent.phoneNumber && ` · ${tour.agent.phoneNumber}`}
                    </p>
                  )}

                  {tour.adminNotes && (
                    <p className="rounded-md bg-muted px-2 py-1 text-xs">
                      {tour.adminNotes}
                    </p>
                  )}
                </div>

                {/* Right column */}
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.className}`}
                  >
                    <StatusIcon className="size-3" />
                    {cfg.label}
                  </span>

                  <p className="text-xs text-muted-foreground">
                    {fmtDate(tour.createdAt)}
                  </p>

                  <div className="flex items-center gap-2">
                    {tour.status === "COMPLETED" && (
                      <Button size="sm" asChild>
                        <Link href={`/applications/screening?tourId=${tour.id}&listingId=${tour.listing.id}`}>
                          Apply now
                          <IconArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    )}

                    {["PENDING", "SCHEDULED"].includes(tour.status) && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive"
                            disabled={cancelling === tour.id}
                          >
                            {cancelling === tour.id ? (
                              <IconLoader2 className="size-3.5 animate-spin" />
                            ) : null}
                            Cancel
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel tour request?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel this tour request for{" "}
                              <strong>{tour.listing.title}</strong>?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep it</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleCancel(tour.id)}
                            >
                              Cancel tour
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
