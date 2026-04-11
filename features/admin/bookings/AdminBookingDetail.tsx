"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  IconLoader2,
  IconArrowLeft,
  IconCalendar,
  IconMoon,
  IconCurrencyNaira,
  IconPhone,
  IconMail,
  IconUser,
  IconHome,
  IconMapPin,
  IconBolt,
  IconBan,
  IconCircleCheck,
  IconRefresh,
  IconNotes,
  IconShieldCheck,
  IconExternalLink,
  IconKey,
  IconWifi,
  IconDroplet,
  IconShield,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { fetchData, updateData, postData } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { STATUS_COLORS, PAYMENT_COLORS } from "./AdminBookings"

// ── Types ──────────────────────────────────────────────────────────────────────

interface BookingDetail {
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
  adminNote: string | null
  paymentRef: string | null
  confirmedAt: string | null
  cancelledAt: string | null
  cancelReason: string | null
  paidAt: string | null
  refundedAt: string | null
  refundAmount: number | null
  createdAt: string
  updatedAt: string
  // Check-in instructions
  instructionsPublishedAt: string | null
  keyHandover: string | null
  accessCode: string | null
  checkInWindow: string | null
  checkOutTime: string | null
  directions: string | null
  mapLink: string | null
  wifiName: string | null
  wifiPassword: string | null
  houseRules: string | null
  emergencyContact: string | null
  generatorInfo: string | null
  waterInfo: string | null
  securityInfo: string | null
  listing: {
    id: string
    slug: string | null
    title: string
    area: string
    state: string
    address: string
    photos: string[]
    listingType: string
    pricePerNight: number | null
    instantBook: boolean
    landlordId: string
    landlord: {
      id: string
      firstName: string
      lastName: string
      email: string
      phoneNumber: string | null
      image: string | null
    }
  }
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    image: string | null
    phoneNumber: string | null
    createdAt: string
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n)

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}

// ── Refund Dialog ──────────────────────────────────────────────────────────────

function RefundDialog({
  booking,
  onClose,
  onSuccess,
}: {
  booking: BookingDetail
  onClose: () => void
  onSuccess: (b: BookingDetail) => void
}) {
  const [mode, setMode] = useState<"full" | "partial">("full")
  const [percent, setPercent] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [loading, setLoading] = useState(false)

  const presets = [25, 50, 75, 100]

  function getAmount() {
    if (mode === "full") return booking.totalPrice
    if (percent !== null) return (booking.totalPrice * percent) / 100
    return parseFloat(customAmount) || 0
  }

  async function handleRefund() {
    const amount = getAmount()
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount")
      return
    }
    setLoading(true)
    try {
      const updated = await postData<BookingDetail>(
        `/admin/bookings/${booking.id}/refund`,
        { amount: mode === "full" ? undefined : amount }
      )
      toast.success("Refund initiated")
      onSuccess(updated)
      onClose()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Refund failed")
    } finally {
      setLoading(false)
    }
  }

  const amount = getAmount()

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Initiate refund</DialogTitle>
          <DialogDescription>
            Total paid: {fmt(booking.totalPrice)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-1 rounded-lg border p-1">
            {(["full", "partial"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m)
                  setPercent(null)
                  setCustomAmount("")
                }}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  mode === m
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {m === "full" ? "Full refund" : "Partial refund"}
              </button>
            ))}
          </div>
          {mode === "partial" && (
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2">
                {presets.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPercent(p)
                      setCustomAmount("")
                    }}
                    className={`rounded-lg border px-2 py-1.5 text-sm font-medium transition-colors ${
                      percent === p
                        ? "border-primary bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    {p}%
                  </button>
                ))}
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Or custom amount (₦)
                </Label>
                <div className="relative">
                  <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                    ₦
                  </span>
                  <Input
                    type="number"
                    className="pl-7"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value)
                      setPercent(null)
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          {amount > 0 && (
            <div className="rounded-lg bg-muted px-3 py-2 text-sm">
              Refund amount:{" "}
              <span className="font-semibold">{fmt(amount)}</span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleRefund} disabled={loading || amount <= 0}>
            {loading && <IconLoader2 className="size-4 animate-spin" />}
            Refund {amount > 0 ? fmt(amount) : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Check-in Instructions Card ────────────────────────────────────────────────

function InstructionRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType
  label: string
  value: string
  href?: string
}) {
  return (
    <div className="flex items-start gap-3 py-2 text-sm">
      <div className="mt-0.5 flex size-6 flex-shrink-0 items-center justify-center rounded bg-muted">
        <Icon className="size-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-muted-foreground">{label}: </span>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            {value} <IconExternalLink className="inline size-3" />
          </a>
        ) : (
          <span className="whitespace-pre-line font-medium">{value}</span>
        )}
      </div>
    </div>
  )
}

function CheckInInstructionsCard({ booking }: { booking: BookingDetail }) {
  const [open, setOpen] = useState(false)

  if (!booking.instructionsPublishedAt) return null

  const sections = [
    {
      title: "Access",
      rows: [
        booking.keyHandover && { icon: IconKey, label: "Key handover", value: booking.keyHandover },
        booking.accessCode && { icon: IconKey, label: "Access code", value: booking.accessCode },
        booking.checkInWindow && { icon: IconCalendar, label: "Check-in window", value: booking.checkInWindow },
        booking.checkOutTime && { icon: IconCalendar, label: "Check-out time", value: booking.checkOutTime },
      ].filter(Boolean) as { icon: React.ElementType; label: string; value: string; href?: string }[],
    },
    {
      title: "Getting there",
      rows: [
        booking.directions && { icon: IconMapPin, label: "Directions", value: booking.directions },
        booking.mapLink && { icon: IconMapPin, label: "Google Maps", value: "Open pin", href: booking.mapLink },
      ].filter(Boolean) as { icon: React.ElementType; label: string; value: string; href?: string }[],
    },
    {
      title: "Utilities & contacts",
      rows: [
        booking.wifiName && { icon: IconWifi, label: "WiFi name", value: booking.wifiName },
        booking.wifiPassword && { icon: IconWifi, label: "WiFi password", value: booking.wifiPassword },
        booking.generatorInfo && { icon: IconBolt, label: "Generator", value: booking.generatorInfo },
        booking.waterInfo && { icon: IconDroplet, label: "Water supply", value: booking.waterInfo },
        booking.securityInfo && { icon: IconShield, label: "Security / entry", value: booking.securityInfo },
        booking.emergencyContact && { icon: IconPhone, label: "Emergency contact", value: booking.emergencyContact },
      ].filter(Boolean) as { icon: React.ElementType; label: string; value: string; href?: string }[],
    },
    {
      title: "House rules",
      rows: [
        booking.houseRules && { icon: IconNotes, label: "Rules", value: booking.houseRules },
      ].filter(Boolean) as { icon: React.ElementType; label: string; value: string; href?: string }[],
    },
  ].filter((s) => s.rows.length > 0)

  return (
    <Card>
      <button
        className="flex w-full items-center justify-between px-5 py-4 text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <div>
          <p className="text-sm font-semibold">Check-in Instructions</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Published by landlord ·{" "}
            {new Date(booking.instructionsPublishedAt).toLocaleDateString(
              "en-NG",
              { day: "numeric", month: "short", year: "numeric" }
            )}
          </p>
        </div>
        {open ? (
          <IconChevronUp className="size-4 text-muted-foreground" />
        ) : (
          <IconChevronDown className="size-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <CardContent className="border-t pt-4">
          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.title}>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {section.title}
                </p>
                <div className="divide-y">
                  {section.rows.map((row) => (
                    <InstructionRow key={row.label} {...row} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function AdminBookingDetail({ bookingId }: { bookingId: string }) {
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState("")
  const [savingNote, setSavingNote] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [showCancel, setShowCancel] = useState(false)
  const [showRefund, setShowRefund] = useState(false)
  const [actioning, setActioning] = useState<string | null>(null)

  useEffect(() => {
    fetchData<BookingDetail>(`/admin/bookings/${bookingId}`)
      .then((data) => {
        setBooking(data)
        setNote(data.adminNote ?? "")
      })
      .catch(() => toast.error("Failed to load booking"))
      .finally(() => setLoading(false))
  }, [bookingId])

  async function handleComplete() {
    setActioning("complete")
    try {
      const updated = await updateData<BookingDetail>(
        `/admin/bookings/${bookingId}/complete`,
        {}
      )
      toast.success("Marked as completed")
      setBooking(updated)
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed")
    } finally {
      setActioning(null)
    }
  }

  async function handleCancel() {
    setActioning("cancel")
    try {
      const updated = await updateData<BookingDetail>(
        `/admin/bookings/${bookingId}/cancel`,
        {
          reason: cancelReason || "Cancelled by admin",
        }
      )
      toast.success("Booking cancelled")
      setBooking(updated)
      setShowCancel(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed")
    } finally {
      setActioning(null)
    }
  }

  async function handleSaveNote() {
    setSavingNote(true)
    try {
      const updated = await updateData<BookingDetail>(
        `/admin/bookings/${bookingId}/note`,
        { note }
      )
      toast.success("Note saved")
      setBooking(updated)
    } catch {
      toast.error("Failed to save note")
    } finally {
      setSavingNote(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
        <IconLoader2 className="size-5 animate-spin" />
        Loading…
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-sm text-destructive">Booking not found.</p>
        <Button variant="outline" asChild>
          <Link href="/admin/bookings">
            <IconArrowLeft className="size-4" /> Back
          </Link>
        </Button>
      </div>
    )
  }

  const isClosed = ["CANCELLED", "COMPLETED", "REJECTED"].includes(
    booking.status
  )
  const isPaid = booking.paymentStatus === "PAID"
  const isConfirmed = booking.status === "CONFIRMED"
  const guest = booking.user
  const landlord = booking.listing.landlord
  const guestInitials =
    `${guest.firstName?.[0] ?? ""}${guest.lastName?.[0] ?? ""}`.toUpperCase()
  const landlordInitials =
    `${landlord.firstName?.[0] ?? ""}${landlord.lastName?.[0] ?? ""}`.toUpperCase()

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          back
          title="Booking detail"
          description={`ID: ${booking.id}`}
        />

        {/* Status row */}
        <div className="flex flex-wrap gap-2">
          <Badge className={`${STATUS_COLORS[booking.status] ?? ""}`}>
            {booking.status}
          </Badge>
          <Badge className={`${PAYMENT_COLORS[booking.paymentStatus] ?? ""}`}>
            {booking.paymentStatus.replace("_", " ")}
          </Badge>
          {booking.listing.instantBook && (
            <Badge className="bg-emerald-100 text-emerald-700">
              <IconBolt className="size-3.5" /> Instant Book
            </Badge>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* LEFT — booking + actions */}
          <div className="space-y-4 lg:col-span-2">
            {/* Listing photo + info */}
            <Card className="p-0">
              <CardContent className="p-0">
                {booking.listing.photos[0] && (
                  <div className="relative h-52 w-full overflow-hidden rounded-t-xl">
                    <Image
                      src={booking.listing.photos[0]}
                      alt={booking.listing.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="space-y-1 p-5">
                  <Link
                    href={`/admin/listings/${booking.listing.slug ?? booking.listing.id}`}
                    className="flex items-center gap-1 font-semibold hover:underline"
                  >
                    {booking.listing.title}
                    <IconExternalLink className="size-3.5 text-muted-foreground" />
                  </Link>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <IconMapPin className="size-3.5" />
                    {booking.listing.address}, {booking.listing.area},{" "}
                    {booking.listing.state}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {booking.listing.listingType.replace("_", " ")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Booking details */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-sm">Booking summary</CardTitle>
              </CardHeader>
              <CardContent className="divide-y p-0 px-5">
                <InfoRow
                  label="Check-in"
                  value={new Date(booking.checkIn).toLocaleDateString("en-NG", {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                />
                <InfoRow
                  label="Check-out"
                  value={new Date(booking.checkOut).toLocaleDateString(
                    "en-NG",
                    {
                      weekday: "short",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                />
                <InfoRow
                  label="Nights"
                  value={`${booking.nights} night${booking.nights > 1 ? "s" : ""}`}
                />
                <InfoRow label="Guests" value={booking.guestCount} />
                <InfoRow
                  label="Total price"
                  value={
                    <span className="text-base font-bold">
                      {fmt(booking.totalPrice)}
                    </span>
                  }
                />
                {booking.paymentRef && (
                  <InfoRow
                    label="Payment ref"
                    value={
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {booking.paymentRef}
                      </code>
                    }
                  />
                )}
                {booking.paidAt && (
                  <InfoRow
                    label="Paid at"
                    value={new Date(booking.paidAt).toLocaleString("en-NG")}
                  />
                )}
                {booking.confirmedAt && (
                  <InfoRow
                    label="Confirmed at"
                    value={new Date(booking.confirmedAt).toLocaleString(
                      "en-NG"
                    )}
                  />
                )}
                {booking.cancelledAt && (
                  <InfoRow
                    label="Cancelled at"
                    value={new Date(booking.cancelledAt).toLocaleString(
                      "en-NG"
                    )}
                  />
                )}
                {booking.cancelReason && (
                  <InfoRow label="Cancel reason" value={booking.cancelReason} />
                )}
                {booking.refundAmount != null && (
                  <InfoRow
                    label="Refund amount"
                    value={fmt(booking.refundAmount)}
                  />
                )}
                {booking.refundedAt && (
                  <InfoRow
                    label="Refunded at"
                    value={new Date(booking.refundedAt).toLocaleString("en-NG")}
                  />
                )}
                <InfoRow
                  label="Booked at"
                  value={new Date(booking.createdAt).toLocaleString("en-NG")}
                />
              </CardContent>
            </Card>

            {booking.specialRequests && (
              <Card>
                <CardHeader className="border-b pb-3">
                  <CardTitle className="text-sm">
                    Guest special requests
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 text-sm text-muted-foreground">
                  {booking.specialRequests}
                </CardContent>
              </Card>
            )}

            {booking.landlordNote && (
              <Card>
                <CardHeader className="border-b pb-3">
                  <CardTitle className="text-sm">Landlord note</CardTitle>
                </CardHeader>
                <CardContent className="pt-3 text-sm text-muted-foreground">
                  {booking.landlordNote}
                </CardContent>
              </Card>
            )}

            {/* Check-in instructions */}
            <CheckInInstructionsCard booking={booking} />

            {/* Admin note */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-1.5 text-sm">
                  <IconNotes className="size-4" /> Internal admin note
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Not visible to guest or landlord. For internal record-keeping
                  only.
                </p>
                <Textarea
                  placeholder="e.g. Guest disputed the listing condition. Refund issued after review…"
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSaveNote}
                  disabled={savingNote || note === (booking.adminNote ?? "")}
                >
                  {savingNote && (
                    <IconLoader2 className="size-3.5 animate-spin" />
                  )}
                  Save note
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT — people + actions */}
          <div className="space-y-6">
            {/* Guest card */}
            <Card>
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-sm">Guest</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={guest.image ?? undefined} />
                    <AvatarFallback>{guestInitials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {guest.firstName} {guest.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Member since {new Date(guest.createdAt).getFullYear()}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm">
                  <a
                    href={`mailto:${guest.email}`}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <IconMail className="size-4 shrink-0" /> {guest.email}
                  </a>
                  {guest.phoneNumber && (
                    <a
                      href={`tel:${guest.phoneNumber}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <IconPhone className="size-4 shrink-0" />{" "}
                      {guest.phoneNumber}
                    </a>
                  )}
                </div>
                <Button size="sm" variant="outline" className="w-full" asChild>
                  <Link href={`/admin/users?id=${guest.id}`}>
                    <IconUser className="size-4" /> View profile
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Landlord card */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-sm">Landlord</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={landlord.image ?? undefined} />
                    <AvatarFallback>{landlordInitials}</AvatarFallback>
                  </Avatar>
                  <p className="font-medium">
                    {landlord.firstName} {landlord.lastName}
                  </p>
                </div>
                <div className="space-y-1.5 text-sm">
                  <a
                    href={`mailto:${landlord.email}`}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <IconMail className="size-4 shrink-0" /> {landlord.email}
                  </a>
                  {landlord.phoneNumber && (
                    <a
                      href={`tel:${landlord.phoneNumber}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <IconPhone className="size-4 shrink-0" />{" "}
                      {landlord.phoneNumber}
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions card */}
            <Card>
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-sm">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {isConfirmed && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleComplete}
                    disabled={actioning === "complete"}
                  >
                    {actioning === "complete" ? (
                      <IconLoader2 className="size-4 animate-spin" />
                    ) : (
                      <IconCircleCheck className="size-4 text-blue-600" />
                    )}
                    Mark as completed
                  </Button>
                )}

                {isPaid && !isClosed && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setShowRefund(true)}
                  >
                    <IconRefresh className="size-4 text-amber-600" />
                    Initiate refund
                  </Button>
                )}

                {!isClosed && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setShowCancel(true)}
                    disabled={actioning === "cancel"}
                  >
                    {actioning === "cancel" ? (
                      <IconLoader2 className="size-4 animate-spin" />
                    ) : (
                      <IconBan className="size-4" />
                    )}
                    Force cancel
                  </Button>
                )}

                {isClosed && (
                  <p className="py-2 text-center text-xs text-muted-foreground">
                    This booking is closed.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Cancel dialog */}
      <AlertDialog open={showCancel} onOpenChange={setShowCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Force cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              {isPaid
                ? "This will cancel the booking and initiate a full refund to the guest."
                : "This will cancel the booking. No payment has been made."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-4 pb-2">
            <Label className="text-xs text-muted-foreground">
              Reason (optional)
            </Label>
            <Textarea
              placeholder="e.g. Fraudulent listing, guest complaint…"
              rows={2}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="mt-1 text-sm"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              Yes, cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showRefund && (
        <RefundDialog
          booking={booking}
          onClose={() => setShowRefund(false)}
          onSuccess={setBooking}
        />
      )}
    </>
  )
}
