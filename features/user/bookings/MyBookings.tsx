"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  IconLoader2,
  IconCalendar,
  IconMapPin,
  IconUser,
  IconPhone,
  IconMoon,
  IconCurrencyNaira,
  IconArrowRight,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { deleteData, fetchData } from "@/lib/api"
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
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ── Types ──────────────────────────────────────────────────────────────────────

interface Booking {
  id: string
  status: string
  checkIn: string
  checkOut: string
  nights: number
  totalPrice: number
  guestCount: number
  specialRequests: string | null
  landlordNote: string | null
  confirmedAt: string | null
  cancelledAt: string | null
  createdAt: string
  listing: {
    id: string
    slug: string | null
    title: string
    state: string
    area: string
    photos: string[]
    pricePerNight: number | null
    landlord: {
      firstName: string
      lastName: string
      image: string | null
      phoneNumber: string | null
    }
  }
}

// ── Constants ──────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "COMPLETED", label: "Completed" },
  { value: "REJECTED", label: "Rejected" },
]

const BOOKING_STATUS: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  CONFIRMED: {
    label: "Confirmed",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 border-red-200",
  },
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

export function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [cancelTarget, setCancelTarget] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetchData<Booking[]>("/user/bookings")
      .then(setBookings)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered =
    statusFilter === "ALL"
      ? bookings
      : bookings.filter((b) => b.status === statusFilter)

  async function handleCancel() {
    if (!cancelTarget) return
    setCancelling(true)
    try {
      await deleteData(`/user/bookings/${cancelTarget}`)
      setBookings((prev) =>
        prev.map((b) =>
          b.id === cancelTarget ? { ...b, status: "CANCELLED" } : b
        )
      )
      toast.success("Booking cancelled")
    } catch {
      toast.error("Failed to cancel booking")
    } finally {
      setCancelling(false)
      setCancelTarget(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          back
          title="My Bookings"
          description={
            loading
              ? "Loading…"
              : `${bookings.length} booking${bookings.length !== 1 ? "s" : ""}`
          }
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
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
          Loading bookings…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border bg-card text-center">
          <IconCalendar className="size-10 text-muted-foreground/40" />
          <div>
            <p className="font-medium">
              {statusFilter === "ALL"
                ? "No bookings yet"
                : `No ${BOOKING_STATUS[statusFilter]?.label ?? statusFilter} bookings`}
            </p>
            {statusFilter === "ALL" && (
              <p className="text-sm text-muted-foreground">
                Book a shortlet or hotel room to see it here.
              </p>
            )}
          </div>
          {statusFilter === "ALL" && (
            <Button asChild size="sm">
              <Link href="/">Find a shortlet</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => {
            const badge = BOOKING_STATUS[booking.status] ?? {
              label: booking.status,
              className: "",
            }
            const canCancel = ["PENDING", "CONFIRMED"].includes(booking.status)
            const landlord = booking.listing.landlord

            return (
              <div
                key={booking.id}
                className="overflow-hidden rounded-xl border bg-card"
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row">
                  {/* Photo */}
                  <div className="relative h-36 w-full flex-shrink-0 overflow-hidden rounded-lg bg-muted sm:h-28 sm:w-44">
                    {booking.listing.photos[0] ? (
                      <Image
                        src={booking.listing.photos[0]}
                        alt={booking.listing.title}
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
                          <Link
                            href={`/listings/${booking.listing.slug ?? booking.listing.id}`}
                            className="font-semibold hover:underline"
                          >
                            {booking.listing.title}
                          </Link>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <IconMapPin className="size-3" />
                            {booking.listing.area}, {booking.listing.state}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${badge.className}`}
                        >
                          {badge.label}
                        </Badge>
                      </div>

                      {/* Dates */}
                      <div className="mt-2 flex flex-wrap gap-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Check-in
                          </p>
                          <p className="font-medium">
                            {fmtDate(booking.checkIn)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Check-out
                          </p>
                          <p className="font-medium">
                            {fmtDate(booking.checkOut)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Duration
                          </p>
                          <p className="flex items-center gap-1 font-medium">
                            <IconMoon className="size-3.5" />
                            {booking.nights} night
                            {booking.nights > 1 ? "s" : ""}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="font-semibold">
                            {fmt(booking.totalPrice)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Landlord info + actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <IconUser className="size-3.5" />
                        <span>
                          {landlord.firstName} {landlord.lastName}
                        </span>
                        {landlord.phoneNumber && (
                          <>
                            <span>·</span>
                            <a
                              href={`tel:${landlord.phoneNumber}`}
                              className="flex items-center gap-1 hover:text-foreground"
                            >
                              <IconPhone className="size-3" />
                              {landlord.phoneNumber}
                            </a>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/bookings/${booking.id}`}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          View details
                          <IconArrowRight className="size-3.5" />
                        </Link>
                        {canCancel && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => setCancelTarget(booking.id)}
                          >
                            Cancel booking
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Landlord note */}
                {booking.landlordNote && (
                  <div
                    className={`border-t px-4 py-3 text-sm ${
                      booking.status === "CONFIRMED"
                        ? "bg-green-50 text-green-800"
                        : booking.status === "REJECTED"
                          ? "bg-red-50 text-red-800"
                          : "bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <span className="font-medium">Host note: </span>
                    {booking.landlordNote}
                  </div>
                )}

                {/* Special requests */}
                {booking.specialRequests && (
                  <div className="border-t bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                    <span className="font-medium">Your note: </span>
                    {booking.specialRequests}
                  </div>
                )}

                {/* Booked date */}
                <div className="border-t px-4 py-2 text-xs text-muted-foreground">
                  Booked {fmtDate(booking.createdAt)}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Cancel confirmation */}
      <AlertDialog
        open={!!cancelTarget}
        onOpenChange={() => setCancelTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel your booking. Depending on the cancellation
              policy, you may or may not receive a refund. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>
              Keep booking
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancelling ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : null}
              Cancel booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
