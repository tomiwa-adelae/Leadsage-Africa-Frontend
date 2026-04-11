"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  IconLoader2,
  IconCalendar,
  IconMapPin,
  IconMoon,
  IconCurrencyNaira,
  IconCheck,
  IconX,
  IconSend,
  IconKey,
  IconWifi,
  IconPhone,
  IconAlertCircle,
  IconChevronLeft,
  IconBolt,
  IconDroplet,
  IconShield,
  IconMap,
  IconClock,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { fetchData, postData, updateData } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PageHeader } from "@/components/PageHeader"

// ── Types ──────────────────────────────────────────────────────────────────────

interface CheckInInstructions {
  keyHandover?: string
  accessCode?: string
  checkInWindow?: string
  checkOutTime?: string
  directions?: string
  mapLink?: string
  wifiName?: string
  wifiPassword?: string
  houseRules?: string
  emergencyContact?: string
  generatorInfo?: string
  waterInfo?: string
  securityInfo?: string
}

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
  instructionsPublishedAt: string | null
  // Check-in fields
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
    state: string
    area: string
    address: string
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

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
  COMPLETED: "bg-blue-100 text-blue-800",
  REJECTED: "bg-zinc-100 text-zinc-600",
}

// ── Field Editor ───────────────────────────────────────────────────────────────

function FieldRow({
  icon: Icon,
  label,
  fieldKey,
  value,
  onChange,
  multiline,
  placeholder,
}: {
  icon: React.ElementType
  label: string
  fieldKey: string
  value: string
  onChange: (key: string, val: string) => void
  multiline?: boolean
  placeholder?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-sm font-medium">
        <Icon className="size-3.5 text-muted-foreground" />
        {label}
      </Label>
      {multiline ? (
        <Textarea
          rows={3}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(fieldKey, e.target.value)}
          className="resize-none text-sm"
        />
      ) : (
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(fieldKey, e.target.value)}
          className="text-sm"
        />
      )}
    </div>
  )
}

// ── Resend Confirmation Dialog ─────────────────────────────────────────────────

function ResendDialog({
  open,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Resend check-in instructions?</DialogTitle>
          <DialogDescription>
            The guest will receive another email with the current check-in
            details.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={loading}>
            {loading && <IconLoader2 className="size-4 animate-spin" />}
            Resend
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function LandlordBookingDetail({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resending, setResending] = useState(false)
  const [showResend, setShowResend] = useState(false)

  // Form state
  const [form, setForm] = useState<CheckInInstructions>({})
  const [dirty, setDirty] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchData<Booking>(`/landlord/bookings/${bookingId}`)
      setBooking(data)
      setForm({
        keyHandover: data.keyHandover ?? "",
        accessCode: data.accessCode ?? "",
        checkInWindow: data.checkInWindow ?? "",
        checkOutTime: data.checkOutTime ?? "",
        directions: data.directions ?? "",
        mapLink: data.mapLink ?? "",
        wifiName: data.wifiName ?? "",
        wifiPassword: data.wifiPassword ?? "",
        houseRules: data.houseRules ?? "",
        emergencyContact: data.emergencyContact ?? "",
        generatorInfo: data.generatorInfo ?? "",
        waterInfo: data.waterInfo ?? "",
        securityInfo: data.securityInfo ?? "",
      })
    } catch {
      toast.error("Failed to load booking")
    } finally {
      setLoading(false)
    }
  }, [bookingId])

  useEffect(() => {
    load()
  }, [load])

  function handleChange(key: string, val: string) {
    setForm((prev) => ({ ...prev, [key]: val }))
    setDirty(true)
  }

  async function handleSave() {
    setSaving(true)
    const wasPublished = !!booking?.instructionsPublishedAt
    try {
      await updateData(`/landlord/bookings/${bookingId}/instructions`, form)
      // Merge instruction fields into existing booking rather than replacing
      // (the save response omits photos/landlordId which would crash the page)
      setBooking((prev) =>
        prev
          ? {
              ...prev,
              ...form,
              instructionsPublishedAt:
                prev.instructionsPublishedAt ?? new Date().toISOString(),
            }
          : prev
      )
      setDirty(false)
      toast.success(
        wasPublished
          ? "Instructions updated and guest notified"
          : "Instructions published and guest notified!"
      )
    } catch (err: any) {
      const msg = err?.response?.data?.message
      toast.error(typeof msg === "string" ? msg : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  async function handleResend() {
    setResending(true)
    try {
      await postData(`/landlord/bookings/${bookingId}/instructions/resend`, {})
      toast.success("Instructions resent to guest")
    } catch {
      toast.error("Failed to resend")
    } finally {
      setResending(false)
      setShowResend(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
        <IconLoader2 className="size-5 animate-spin" />
        Loading booking…
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
        <IconAlertCircle className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Booking not found.</p>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    )
  }

  const guest = booking.user
  const guestName = `${guest.firstName} ${guest.lastName}`
  const guestInitials =
    `${guest.firstName?.[0] ?? ""}${guest.lastName?.[0] ?? ""}`.toUpperCase()
  const photo = booking.listing.photos[0]
  const canEditInstructions = ["CONFIRMED", "COMPLETED"].includes(
    booking.status
  )

  return (
    <div className="space-y-6">
      {/* Back */}
      <PageHeader back title={booking.listing.title} />

      {/* Header card */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="relative h-40 w-full bg-muted">
          {photo && (
            <Image
              src={photo}
              alt={booking.listing.title}
              fill
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute right-4 bottom-3 left-4 flex items-end justify-between">
            <div>
              <p className="leading-snug font-semibold text-white">
                {booking.listing.title}
              </p>
              <p className="flex items-center gap-1 text-xs text-white/80">
                <IconMapPin className="size-3" />
                {booking.listing.area}, {booking.listing.state}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[booking.status] ?? ""}`}
            >
              {booking.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Check-in</p>
            <p className="text-sm font-medium">{fmtDate(booking.checkIn)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Check-out</p>
            <p className="text-sm font-medium">{fmtDate(booking.checkOut)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="flex items-center gap-1 text-sm font-medium">
              <IconMoon className="size-3.5" />
              {booking.nights} night{booking.nights > 1 ? "s" : ""}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total paid</p>
            <p className="flex items-center gap-0.5 text-sm font-semibold">
              <IconCurrencyNaira className="size-3.5" />
              {fmt(booking.totalPrice).replace("₦", "")}
            </p>
          </div>
        </div>
      </div>

      {/* Guest card */}
      <div className="rounded-xl border bg-card p-4">
        <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Guest
        </p>
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarImage src={guest.image ?? undefined} />
            <AvatarFallback className="text-sm">{guestInitials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="leading-none font-medium">{guestName}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {guest.email}
            </p>
          </div>
          {guest.phoneNumber && (
            <a
              href={`tel:${guest.phoneNumber}`}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <IconPhone className="size-4" />
              {guest.phoneNumber}
            </a>
          )}
        </div>

        {booking.specialRequests && (
          <div className="mt-3 rounded-lg bg-muted/50 px-3 py-2 text-sm">
            <span className="font-medium">Guest note: </span>
            {booking.specialRequests}
          </div>
        )}

        {booking.guestCount > 1 && (
          <p className="mt-2 text-xs text-muted-foreground">
            {booking.guestCount} guests
          </p>
        )}
      </div>

      {/* Check-in Instructions */}
      <div className="rounded-xl border bg-card">
        <div className="flex items-start justify-between border-b p-4">
          <div>
            <p className="font-semibold">Check-in Instructions</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {!canEditInstructions
                ? "Available after booking is confirmed"
                : booking.instructionsPublishedAt
                  ? `Last sent ${new Date(booking.instructionsPublishedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}`
                  : "Not yet published — fill in details and save to notify the guest"}
            </p>
          </div>
          {booking.instructionsPublishedAt && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowResend(true)}
              disabled={resending}
            >
              <IconSend className="size-3.5" />
              Resend email
            </Button>
          )}
        </div>

        {!canEditInstructions ? (
          <div className="flex h-32 items-center justify-center gap-2 text-sm text-muted-foreground">
            <IconClock className="size-4" />
            Confirm the booking to unlock check-in instructions
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {/* Access */}
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Access
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <FieldRow
                  icon={IconKey}
                  label="Key handover"
                  fieldKey="keyHandover"
                  value={form.keyHandover ?? ""}
                  onChange={handleChange}
                  placeholder="e.g. Lockbox at gate, Meet caretaker…"
                />
                <FieldRow
                  icon={IconKey}
                  label="Access code"
                  fieldKey="accessCode"
                  value={form.accessCode ?? ""}
                  onChange={handleChange}
                  placeholder="Gate / door code"
                />
                <FieldRow
                  icon={IconClock}
                  label="Check-in window"
                  fieldKey="checkInWindow"
                  value={form.checkInWindow ?? ""}
                  onChange={handleChange}
                  placeholder="e.g. 2:00 PM – 10:00 PM"
                />
                <FieldRow
                  icon={IconClock}
                  label="Check-out time"
                  fieldKey="checkOutTime"
                  value={form.checkOutTime ?? ""}
                  onChange={handleChange}
                  placeholder="e.g. 11:00 AM"
                />
              </div>
            </div>

            <Separator />

            {/* Location */}
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                How to find the property
              </p>
              <FieldRow
                icon={IconMap}
                label="Directions"
                fieldKey="directions"
                value={form.directions ?? ""}
                onChange={handleChange}
                multiline
                placeholder="Landmark-based directions — e.g. After the Total filling station on Admiralty Way, turn left…"
              />
              <FieldRow
                icon={IconMapPin}
                label="Google Maps link"
                fieldKey="mapLink"
                value={form.mapLink ?? ""}
                onChange={handleChange}
                placeholder="https://maps.app.goo.gl/…"
              />
            </div>

            <Separator />

            {/* Amenities */}
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Amenities & utilities
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <FieldRow
                  icon={IconWifi}
                  label="WiFi name"
                  fieldKey="wifiName"
                  value={form.wifiName ?? ""}
                  onChange={handleChange}
                  placeholder="Network name"
                />
                <FieldRow
                  icon={IconWifi}
                  label="WiFi password"
                  fieldKey="wifiPassword"
                  value={form.wifiPassword ?? ""}
                  onChange={handleChange}
                  placeholder="Password"
                />
                <FieldRow
                  icon={IconBolt}
                  label="Generator"
                  fieldKey="generatorInfo"
                  value={form.generatorInfo ?? ""}
                  onChange={handleChange}
                  placeholder="e.g. Runs 6 AM – 12 AM, fuel refilled daily"
                />
                <FieldRow
                  icon={IconDroplet}
                  label="Water supply"
                  fieldKey="waterInfo"
                  value={form.waterInfo ?? ""}
                  onChange={handleChange}
                  placeholder="e.g. Borehole, tank refilled Mon & Thu"
                />
                <FieldRow
                  icon={IconShield}
                  label="Security / estate entry"
                  fieldKey="securityInfo"
                  value={form.securityInfo ?? ""}
                  onChange={handleChange}
                  placeholder="e.g. Tell gate your name, estate code is 0072"
                />
                <FieldRow
                  icon={IconPhone}
                  label="Emergency contact"
                  fieldKey="emergencyContact"
                  value={form.emergencyContact ?? ""}
                  onChange={handleChange}
                  placeholder="Name + phone of caretaker or agent"
                />
              </div>
            </div>

            <Separator />

            {/* House rules */}
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                House rules
              </p>
              <FieldRow
                icon={IconAlertCircle}
                label="Rules"
                fieldKey="houseRules"
                value={form.houseRules ?? ""}
                onChange={handleChange}
                multiline
                placeholder="e.g. No parties, no smoking indoors, keep noise down after 10 PM…"
              />
            </div>

            {/* Save button */}
            <div className="flex items-center justify-between pt-2">
              {dirty && (
                <p className="text-xs text-amber-600">Unsaved changes</p>
              )}
              <Button
                onClick={handleSave}
                disabled={saving || !dirty}
                className="ml-auto"
              >
                {saving ? (
                  <IconLoader2 className="size-4 animate-spin" />
                ) : booking.instructionsPublishedAt ? (
                  <IconCheck className="size-4" />
                ) : (
                  <IconSend className="size-4" />
                )}
                {booking.instructionsPublishedAt
                  ? "Save & notify guest"
                  : "Publish & notify guest"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <ResendDialog
        open={showResend}
        onClose={() => setShowResend(false)}
        onConfirm={handleResend}
        loading={resending}
      />
    </div>
  )
}
