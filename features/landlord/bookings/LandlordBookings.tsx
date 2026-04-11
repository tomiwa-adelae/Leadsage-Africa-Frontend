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
  IconCheck,
  IconX,
  IconMailFast,
  IconClockHour4,
  IconArrowRight,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { fetchData, updateData } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  paymentStatus: string
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
    instantBook: boolean
  }
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    image: string | null
    phoneNumber: string | null
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n)

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  CONFIRMED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  REJECTED: "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400",
}

const PAYMENT_COLORS: Record<string, string> = {
  UNPAID: "bg-zinc-100 text-zinc-600",
  PAID: "bg-emerald-100 text-emerald-700",
  REFUNDED: "bg-blue-100 text-blue-700",
  PARTIALLY_REFUNDED: "bg-amber-100 text-amber-700",
}

// ── Respond Dialog ─────────────────────────────────────────────────────────────

type RespondAction = "confirm" | "reject" | "complete"

function RespondDialog({
  booking,
  action,
  onClose,
  onSuccess,
}: {
  booking: Booking
  action: RespondAction
  onClose: () => void
  onSuccess: () => void
}) {
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)

  const title =
    action === "confirm"
      ? "Confirm booking"
      : action === "reject"
        ? "Reject booking"
        : "Mark as completed"

  const description =
    action === "confirm"
      ? "Confirm this booking and notify the guest."
      : action === "reject"
        ? "Reject this booking. The guest will be refunded in full."
        : "Mark this booking as completed after the guest has checked out."

  async function handleSubmit() {
    setLoading(true)
    try {
      await updateData(`/landlord/bookings/${booking.id}/${action}`, {
        note: note.trim() || undefined,
      })
      toast.success(
        action === "confirm"
          ? "Booking confirmed!"
          : action === "reject"
            ? "Booking rejected."
            : "Booking marked as completed."
      )
      onSuccess()
      onClose()
    } catch (err: any) {
      const msg = err?.response?.data?.message
      toast.error(typeof msg === "string" ? msg : "Action failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
          <p className="font-medium">{booking.listing.title}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(booking.checkIn).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
            })}{" "}
            →{" "}
            {new Date(booking.checkOut).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}{" "}
            · {booking.nights} night{booking.nights > 1 ? "s" : ""}
          </p>
        </div>

        {action !== "complete" && (
          <div className="space-y-1.5">
            <Label>
              Note to guest{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Textarea
              placeholder={
                action === "confirm"
                  ? "E.g. Check-in from 2pm, gate code is 1234…"
                  : "E.g. Sorry, we're fully booked for that period…"
              }
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            variant={action === "reject" ? "destructive" : "default"}
          >
            {loading && <IconLoader2 className="size-4 animate-spin" />}
            {action === "confirm"
              ? "Confirm"
              : action === "reject"
                ? "Reject"
                : "Mark completed"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Booking Card ───────────────────────────────────────────────────────────────

function BookingCard({
  booking,
  onRefresh,
}: {
  booking: Booking
  onRefresh: () => void
}) {
  const [action, setAction] = useState<RespondAction | null>(null)
  const guest = booking.user
  const guestName = `${guest.firstName} ${guest.lastName}`
  const guestInitials =
    `${guest.firstName?.[0] ?? ""}${guest.lastName?.[0] ?? ""}`.toUpperCase()
  const photo = booking.listing.photos[0]

  const isPending = booking.status === "PENDING"
  const isConfirmed = booking.status === "CONFIRMED"

  return (
    <>
      <div className="rounded-xl border bg-card shadow-xs">
        <div className="flex gap-4 p-4">
          {/* Listing photo */}
          <div className="relative hidden size-20 flex-shrink-0 overflow-hidden rounded-lg sm:block">
            {photo ? (
              <Image
                src={photo}
                alt={booking.listing.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted text-xs text-muted-foreground">
                No photo
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            {/* Top row */}
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <Link
                  href={`/listings/${booking.listing.slug ?? booking.listing.id}`}
                  className="font-semibold hover:underline"
                >
                  {booking.listing.title}
                </Link>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <IconMapPin className="size-3.5" />
                  {booking.listing.area}, {booking.listing.state}
                </p>
              </div>

              <div className="flex gap-1.5">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[booking.status] ?? ""}`}
                >
                  {booking.status}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PAYMENT_COLORS[booking.paymentStatus] ?? ""}`}
                >
                  {booking.paymentStatus.replace("_", " ")}
                </span>
              </div>
            </div>

            {/* Dates & price */}
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <IconCalendar className="size-4" />
                {new Date(booking.checkIn).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                })}{" "}
                →{" "}
                {new Date(booking.checkOut).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <IconMoon className="size-4" />
                {booking.nights} night{booking.nights > 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <IconCurrencyNaira className="size-4" />
                {fmt(booking.totalPrice)}
              </span>
            </div>

            {/* Guest */}
            <div className="flex items-center gap-2">
              <Avatar className="size-7">
                <AvatarImage src={guest.image ?? undefined} />
                <AvatarFallback className="text-xs">
                  {guestInitials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm leading-none font-medium">{guestName}</p>
                <p className="text-xs text-muted-foreground">{guest.email}</p>
              </div>
              {guest.phoneNumber && (
                <a
                  href={`tel:${guest.phoneNumber}`}
                  className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <IconPhone className="size-3.5" />
                  {guest.phoneNumber}
                </a>
              )}
            </div>

            {/* Special requests */}
            {booking.specialRequests && (
              <p className="rounded bg-muted px-2.5 py-1.5 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Guest note:</span>{" "}
                {booking.specialRequests}
              </p>
            )}

            {/* Landlord's own note (if set) */}
            {booking.landlordNote && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Your note:</span>{" "}
                {booking.landlordNote}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-2 border-t px-4 py-3">
          <Link
            href={`/landlord/listings/bookings/${booking.id}`}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            View details
            <IconArrowRight className="size-3.5" />
          </Link>

          <div className="flex gap-2">
            {isPending && booking.paymentStatus === "PAID" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => setAction("reject")}
                >
                  <IconX className="size-4" />
                  Reject
                </Button>
                <Button size="sm" onClick={() => setAction("confirm")}>
                  <IconCheck className="size-4" />
                  Confirm
                </Button>
              </>
            )}
            {isPending && booking.paymentStatus === "UNPAID" && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <IconClockHour4 className="size-4" />
                Awaiting guest payment
              </p>
            )}
            {isConfirmed && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAction("complete")}
              >
                <IconMailFast className="size-4" />
                Mark completed
              </Button>
            )}
          </div>
        </div>
      </div>

      {action && (
        <RespondDialog
          booking={booking}
          action={action}
          onClose={() => setAction(null)}
          onSuccess={onRefresh}
        />
      )}
    </>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function LandlordBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("ALL")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = statusFilter !== "ALL" ? `?status=${statusFilter}` : ""
      const data = await fetchData<Booking[]>(`/landlord/bookings${params}`)
      setBookings(data)
    } catch {
      toast.error("Failed to load bookings")
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-6">
      <PageHeader
        back
        title="Bookings"
        description="Shortlet and hotel bookings for your listings"
      />

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-40 items-center justify-center gap-2 text-muted-foreground">
          <IconLoader2 className="size-5 animate-spin" />
          Loading…
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm text-muted-foreground">No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <BookingCard key={b.id} booking={b} onRefresh={load} />
          ))}
        </div>
      )}
    </div>
  )
}
