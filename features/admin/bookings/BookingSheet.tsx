"use client"

import { useState } from "react"
import Link from "next/link"
import {
  IconCalendar,
  IconMoon,
  IconCurrencyNaira,
  IconUser,
  IconPhone,
  IconMail,
  IconHome,
  IconExternalLink,
  IconBan,
  IconCircleCheck,
  IconRefresh,
  IconLoader2,
  IconNotes,
  IconX,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { updateData, postData } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CurrencyInput } from "@/components/ui/currency-input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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
import { AdminBooking, STATUS_COLORS, PAYMENT_COLORS } from "./AdminBookings"
import { Badge } from "@/components/ui/badge"

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n)

// ── Refund Dialog ──────────────────────────────────────────────────────────────

function RefundDialog({
  booking,
  onClose,
  onSuccess,
}: {
  booking: AdminBooking
  onClose: () => void
  onSuccess: (b: AdminBooking) => void
}) {
  const [mode, setMode] = useState<"full" | "partial">("full")
  const [percent, setPercent] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [loading, setLoading] = useState(false)

  const presets = [25, 50, 75, 100]

  function getAmount(): number {
    if (mode === "full") return booking.totalPrice
    if (percent !== null) return (booking.totalPrice * percent) / 100
    return parseFloat(customAmount) || 0
  }

  async function handleRefund() {
    const amount = getAmount()
    if (!amount || amount <= 0) {
      toast.error("Enter a valid refund amount")
      return
    }
    setLoading(true)
    try {
      const updated = await postData<AdminBooking>(
        `/admin/bookings/${booking.id}/refund`,
        { amount: mode === "full" ? undefined : amount }
      )
      toast.success("Refund initiated successfully")
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
          {/* Full / Partial toggle */}
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
              {/* Presets */}
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

              {/* Custom */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Or enter custom amount (₦)
                </Label>
                <div className="relative">
                  <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                    ₦
                  </span>
                  <CurrencyInput
                    className="pl-7"
                    placeholder="0"
                    value={customAmount}
                    onChange={(v) => { setCustomAmount(v); setPercent(null) }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          {amount > 0 && (
            <div className="rounded-lg bg-muted px-3 py-2 text-sm">
              Refund amount:{" "}
              <span className="font-semibold text-foreground">
                {fmt(amount)}
              </span>
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

// ── Main Sheet ─────────────────────────────────────────────────────────────────

export function BookingSheet({
  booking,
  onClose,
  onUpdated,
}: {
  booking: AdminBooking
  onClose: () => void
  onUpdated: (b: AdminBooking) => void
}) {
  const [note, setNote] = useState(booking.adminNote ?? "")
  const [savingNote, setSavingNote] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [showCancel, setShowCancel] = useState(false)
  const [showRefund, setShowRefund] = useState(false)
  const [actioning, setActioning] = useState<string | null>(null)

  const isPending = booking.status === "PENDING"
  const isConfirmed = booking.status === "CONFIRMED"
  const isClosed = ["CANCELLED", "COMPLETED", "REJECTED"].includes(
    booking.status
  )
  const isPaid = booking.paymentStatus === "PAID"

  async function handleComplete() {
    setActioning("complete")
    try {
      const updated = await updateData<AdminBooking>(
        `/admin/bookings/${booking.id}/complete`,
        {}
      )
      toast.success("Booking marked as completed")
      onUpdated(updated)
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed")
    } finally {
      setActioning(null)
    }
  }

  async function handleCancel() {
    setActioning("cancel")
    try {
      const updated = await updateData<AdminBooking>(
        `/admin/bookings/${booking.id}/cancel`,
        {
          reason: cancelReason || "Cancelled by admin",
        }
      )
      toast.success("Booking cancelled")
      onUpdated(updated)
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
      const updated = await updateData<AdminBooking>(
        `/admin/bookings/${booking.id}/note`,
        { note }
      )
      toast.success("Note saved")
      onUpdated(updated)
    } catch {
      toast.error("Failed to save note")
    } finally {
      setSavingNote(false)
    }
  }

  const guest = booking.user
  const landlord = booking.listing.landlord
  const guestInitials =
    `${guest.firstName?.[0] ?? ""}${guest.lastName?.[0] ?? ""}`.toUpperCase()

  return (
    <>
      <Sheet open onOpenChange={onClose}>
        <SheetContent className="w-full overflow-y-auto pb-10 sm:max-w-md">
          <SheetHeader className="mb-2 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle>Booking detail</SheetTitle>
              <Link
                href={`/admin/bookings/${booking.id}`}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Full page <IconExternalLink className="size-3.5" />
              </Link>
            </div>
          </SheetHeader>

          <div className="space-y-5 px-4">
            {/* Status badges */}
            <div className="flex gap-2">
              <Badge className={`${STATUS_COLORS[booking.status] ?? ""}`}>
                {booking.status}
              </Badge>
              <Badge
                className={`${PAYMENT_COLORS[booking.paymentStatus] ?? ""}`}
              >
                {booking.paymentStatus.replace("_", " ")}
              </Badge>
            </div>

            {/* Booking info */}
            <div className="space-y-2 rounded-xl border p-4 text-sm">
              <p className="font-semibold">{booking.listing.title}</p>
              <p className="text-xs text-muted-foreground">
                {booking.listing.area}, {booking.listing.state}
              </p>
              <Separator />
              <div className="flex items-center gap-2 text-muted-foreground">
                <IconCalendar className="size-4 shrink-0" />
                {new Date(booking.checkIn).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
                {" → "}
                {new Date(booking.checkOut).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <IconMoon className="size-4 shrink-0" />
                {booking.nights} night{booking.nights > 1 ? "s" : ""}
                {" · "}
                {booking.guestCount} guest{booking.guestCount > 1 ? "s" : ""}
              </div>
              <div className="flex items-center gap-2 font-semibold">
                <IconCurrencyNaira className="size-4 shrink-0" />
                {fmt(booking.totalPrice)}
                {booking.paymentRef && (
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    ref: {booking.paymentRef}
                  </span>
                )}
              </div>
              {booking.specialRequests && (
                <p className="mt-1 rounded bg-muted px-2 py-1.5 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    Guest note:
                  </span>{" "}
                  {booking.specialRequests}
                </p>
              )}
            </div>

            {/* Guest */}
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Guest
              </p>
              <div className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarImage src={guest.image ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {guestInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {guest.firstName} {guest.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{guest.email}</p>
                </div>
              </div>
              {guest.phoneNumber && (
                <a
                  href={`tel:${guest.phoneNumber}`}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <IconPhone className="size-3.5" /> {guest.phoneNumber}
                </a>
              )}
            </div>

            <Separator />

            {/* Landlord */}
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Landlord
              </p>
              <p className="text-sm font-medium">
                {landlord.firstName} {landlord.lastName}
              </p>
              <a
                href={`mailto:${landlord.email}`}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <IconMail className="size-3.5" /> {landlord.email}
              </a>
              {landlord.phoneNumber && (
                <a
                  href={`tel:${landlord.phoneNumber}`}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <IconPhone className="size-3.5" /> {landlord.phoneNumber}
                </a>
              )}
            </div>

            {booking.landlordNote && (
              <div className="rounded-lg bg-muted px-3 py-2 text-xs">
                <span className="font-medium">Landlord note:</span>{" "}
                {booking.landlordNote}
              </div>
            )}

            <Separator />

            {/* Admin note */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <IconNotes className="size-3.5" /> Internal note
              </Label>
              <Textarea
                placeholder="Add an internal note for this booking (not visible to guest or landlord)…"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="text-sm"
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
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Actions
              </p>

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
                <p className="text-xs text-muted-foreground">
                  This booking is closed — no further actions available.
                </p>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Cancel confirm */}
      <AlertDialog open={showCancel} onOpenChange={setShowCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Force cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the booking
              {booking.paymentStatus === "PAID"
                ? " and initiate a full refund to the guest."
                : "."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-4 pb-2">
            <Label className="text-xs text-muted-foreground">
              Reason (optional)
            </Label>
            <Textarea
              placeholder="e.g. Fraudulent listing, guest dispute…"
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

      {/* Refund dialog */}
      {showRefund && (
        <RefundDialog
          booking={booking}
          onClose={() => setShowRefund(false)}
          onSuccess={onUpdated}
        />
      )}
    </>
  )
}
