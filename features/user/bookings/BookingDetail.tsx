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
  IconExternalLink,
  IconCheck,
  IconLock,
  IconInfoCircle,
  IconCreditCard,
  IconWallet,
  IconChevronDown,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { fetchData, deleteData, postData } from "@/lib/api"
import { PinModal } from "@/components/PinModal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PageHeader } from "@/components/PageHeader"

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
    lga: string
    area: string
    address: string
    photos: string[]
    pricePerNight: number | null
    listingType: string
    landlord: {
      id: string
      firstName: string
      lastName: string
      image: string | null
      phoneNumber: string | null
      email: string
    }
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
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

const STATUS_COLORS: Record<string, { bg: string; label: string }> = {
  PENDING: { bg: "bg-amber-100 text-amber-800", label: "Pending confirmation" },
  CONFIRMED: { bg: "bg-emerald-100 text-emerald-800", label: "Confirmed" },
  CANCELLED: { bg: "bg-red-100 text-red-800", label: "Cancelled" },
  COMPLETED: { bg: "bg-blue-100 text-blue-800", label: "Completed" },
  REJECTED: { bg: "bg-zinc-100 text-zinc-600", label: "Not confirmed" },
}

// ── Info Row ───────────────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
  secret,
}: {
  icon: React.ElementType
  label: string
  value: string
  href?: string
  secret?: boolean
}) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="mt-0.5 flex size-7 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        {secret && !revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="mt-0.5 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <IconLock className="size-3.5" />
            Tap to reveal
          </button>
        ) : href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {value}
            <IconExternalLink className="size-3" />
          </a>
        ) : (
          <p className="mt-0.5 text-sm font-medium whitespace-pre-line">
            {value}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function BookingDetail({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [paying, setPaying] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [data, wallet] = await Promise.all([
        fetchData<Booking>(`/user/bookings/${bookingId}`),
        fetchData<{ availableBalance: number }>("/wallet").catch(() => null),
      ])
      setBooking(data)
      if (wallet) setWalletBalance(wallet.availableBalance)
    } catch {
      toast.error("Failed to load booking")
    } finally {
      setLoading(false)
    }
  }, [bookingId])

  async function handlePayCard() {
    setPaying(true)
    try {
      const { paymentUrl } = await postData<{ paymentUrl: string }>(
        `/user/bookings/${bookingId}/pay`,
        {}
      )
      window.location.href = paymentUrl
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to initialize payment")
      setPaying(false)
    }
  }

  function handlePayWallet() {
    if (!booking) return
    if (walletBalance !== null && walletBalance < booking.totalPrice) {
      toast.error(`Insufficient wallet balance. You have ${fmt(walletBalance)}.`)
      return
    }
    setShowPinModal(true)
  }

  async function executeWalletPayment(pin: string) {
    if (!booking) return
    setShowPinModal(false)
    setPaying(true)
    try {
      const res = await postData<{ status: string }>(`/wallet/pay/booking/${bookingId}`, { pin })
      toast.success(
        res.status === "CONFIRMED"
          ? "Paid and booking confirmed!"
          : "Paid — awaiting host confirmation"
      )
      load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Wallet payment failed")
    } finally {
      setPaying(false)
    }
  }

  useEffect(() => {
    load()
  }, [load])

  async function handleCancel() {
    setCancelling(true)
    try {
      await deleteData(`/user/bookings/${bookingId}`)
      toast.success("Booking cancelled")
      router.push("/bookings")
    } catch (err: any) {
      const msg = err?.response?.data?.message
      toast.error(typeof msg === "string" ? msg : "Failed to cancel")
    } finally {
      setCancelling(false)
      setCancelOpen(false)
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
        <Button variant="outline" size="sm" asChild>
          <Link href="/bookings">Back to bookings</Link>
        </Button>
      </div>
    )
  }

  const landlord = booking.listing.landlord
  const landlordName = `${landlord.firstName} ${landlord.lastName}`
  const landlordInitials =
    `${landlord.firstName?.[0] ?? ""}${landlord.lastName?.[0] ?? ""}`.toUpperCase()
  const photo = booking.listing.photos[0]
  const statusInfo = STATUS_COLORS[booking.status] ?? {
    bg: "",
    label: booking.status,
  }
  const canCancel = ["PENDING", "CONFIRMED"].includes(booking.status)
  const needsPayment = booking.paymentStatus === "UNPAID"
  const hasInstructions = !!booking.instructionsPublishedAt

  // Collect which instruction sections have data
  const hasAccess =
    booking.keyHandover ||
    booking.accessCode ||
    booking.checkInWindow ||
    booking.checkOutTime
  const hasLocation = booking.directions || booking.mapLink
  const hasAmenities =
    booking.wifiName ||
    booking.generatorInfo ||
    booking.waterInfo ||
    booking.securityInfo ||
    booking.emergencyContact
  const hasRules = !!booking.houseRules

  return (
    <div className="space-y-5">
      <PageHeader back title={booking.listing.title} />

      {/* Listing header */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="relative h-44 w-full bg-muted">
          {photo && (
            <Image
              src={photo}
              alt={booking.listing.title}
              fill
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute right-4 bottom-3 left-4">
            <Link
              href={`/listings/${booking.listing.slug ?? booking.listing.id}`}
              className="font-semibold text-white hover:underline"
            >
              {booking.listing.title}
            </Link>
            <p className="flex items-center gap-1 text-xs text-white/80">
              <IconMapPin className="size-3" />
              {booking.listing.area}, {booking.listing.state}
            </p>
          </div>
          <div className="absolute top-3 right-3">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.bg}`}
            >
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 divide-x border-t sm:grid-cols-4 sm:divide-x">
          <div className="px-4 py-3">
            <p className="text-xs text-muted-foreground">Check-in</p>
            <p className="mt-0.5 text-sm font-medium">
              {fmtDate(booking.checkIn)}
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-muted-foreground">Check-out</p>
            <p className="mt-0.5 text-sm font-medium">
              {fmtDate(booking.checkOut)}
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="mt-0.5 flex items-center gap-1 text-sm font-medium">
              <IconMoon className="size-3.5" />
              {booking.nights} night{booking.nights > 1 ? "s" : ""}
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="mt-0.5 flex items-center gap-0.5 text-sm font-semibold">
              {fmt(booking.totalPrice)}
            </p>
          </div>
        </div>
      </div>

      {/* Host note (if any) */}
      {booking.landlordNote && (
        <div
          className={`flex gap-3 rounded-xl border p-4 ${
            booking.status === "CONFIRMED"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : booking.status === "REJECTED"
                ? "border-red-200 bg-red-50 text-red-900"
                : "border-border bg-muted/40"
          }`}
        >
          <IconInfoCircle className="mt-0.5 size-4 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase opacity-70">
              Message from host
            </p>
            <p className="mt-1 text-sm">{booking.landlordNote}</p>
          </div>
        </div>
      )}

      {/* Check-in instructions */}
      <div className="rounded-xl border bg-card">
        <div className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Check-in Instructions</p>
            {hasInstructions && (
              <span className="flex items-center gap-1 text-xs text-emerald-600">
                <IconCheck className="size-3.5" />
                Ready
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {!hasInstructions
              ? booking.status === "CONFIRMED"
                ? "Your host hasn't shared instructions yet — check back closer to your check-in date"
                : "Check-in details will appear here once your booking is confirmed"
              : `Last updated ${new Date(booking.instructionsPublishedAt!).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}`}
          </p>
        </div>

        {!hasInstructions ? (
          <div className="flex h-28 items-center justify-center gap-2 text-sm text-muted-foreground">
            <IconClock className="size-4" />
            Instructions not yet available
          </div>
        ) : (
          <div className="divide-y px-4">
            {/* Access */}
            {hasAccess && (
              <div className="py-3">
                <p className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Access
                </p>
                {booking.keyHandover && (
                  <InfoRow
                    icon={IconKey}
                    label="Key handover"
                    value={booking.keyHandover}
                  />
                )}
                {booking.accessCode && (
                  <InfoRow
                    icon={IconKey}
                    label="Access code"
                    value={booking.accessCode}
                    secret
                  />
                )}
                {booking.checkInWindow && (
                  <InfoRow
                    icon={IconClock}
                    label="Check-in window"
                    value={booking.checkInWindow}
                  />
                )}
                {booking.checkOutTime && (
                  <InfoRow
                    icon={IconClock}
                    label="Check-out time"
                    value={booking.checkOutTime}
                  />
                )}
              </div>
            )}

            {/* Location */}
            {hasLocation && (
              <div className="py-3">
                <p className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Getting there
                </p>
                {booking.directions && (
                  <InfoRow
                    icon={IconMap}
                    label="Directions"
                    value={booking.directions}
                  />
                )}
                {booking.mapLink && (
                  <InfoRow
                    icon={IconMapPin}
                    label="Google Maps"
                    value="Open location"
                    href={booking.mapLink}
                  />
                )}
              </div>
            )}

            {/* Amenities */}
            {hasAmenities && (
              <div className="py-3">
                <p className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Utilities & contacts
                </p>
                {booking.wifiName && (
                  <InfoRow
                    icon={IconWifi}
                    label="WiFi network"
                    value={booking.wifiName}
                  />
                )}
                {booking.wifiPassword && (
                  <InfoRow
                    icon={IconWifi}
                    label="WiFi password"
                    value={booking.wifiPassword}
                    secret
                  />
                )}
                {booking.generatorInfo && (
                  <InfoRow
                    icon={IconBolt}
                    label="Generator"
                    value={booking.generatorInfo}
                  />
                )}
                {booking.waterInfo && (
                  <InfoRow
                    icon={IconDroplet}
                    label="Water supply"
                    value={booking.waterInfo}
                  />
                )}
                {booking.securityInfo && (
                  <InfoRow
                    icon={IconShield}
                    label="Security / entry"
                    value={booking.securityInfo}
                  />
                )}
                {booking.emergencyContact && (
                  <InfoRow
                    icon={IconPhone}
                    label="Emergency contact"
                    value={booking.emergencyContact}
                  />
                )}
              </div>
            )}

            {/* House rules */}
            {hasRules && (
              <div className="py-3">
                <p className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  House rules
                </p>
                <InfoRow
                  icon={IconAlertCircle}
                  label="Rules"
                  value={booking.houseRules!}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Host card */}
      <div className="rounded-xl border bg-card p-4">
        <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Your host
        </p>
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarImage src={landlord.image ?? undefined} />
            <AvatarFallback className="text-sm">
              {landlordInitials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="leading-none font-medium">{landlordName}</p>
          </div>
          {landlord.phoneNumber && (
            <a
              href={`tel:${landlord.phoneNumber}`}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <IconPhone className="size-4" />
              {landlord.phoneNumber}
            </a>
          )}
        </div>
      </div>

      {/* Payment prompt for unpaid bookings */}
      {needsPayment && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/30">
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Payment required
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Complete payment to confirm your booking — {fmt(booking.totalPrice)}
            </p>
          </div>
          {paying ? (
            <Button size="sm" disabled>
              <IconLoader2 className="size-4 animate-spin" />
              Processing…
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  Pay now
                  <IconChevronDown className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handlePayCard}>
                  <IconCreditCard className="size-4" />
                  Pay with Card
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handlePayWallet}
                  disabled={walletBalance !== null && walletBalance < booking.totalPrice}
                >
                  <IconWallet className="size-4" />
                  <span>
                    Pay with Wallet
                    {walletBalance !== null && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({fmt(walletBalance)})
                      </span>
                    )}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      {/* Actions */}
      {canCancel && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => setCancelOpen(true)}
          >
            Cancel booking
          </Button>
        </div>
      )}

      {/* Cancel dialog */}
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Depending on how close your check-in date is, you may receive a
              partial or no refund. This cannot be undone.
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
              {cancelling && <IconLoader2 className="size-4 animate-spin" />}
              Cancel booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PinModal
        open={showPinModal}
        description="Enter your PIN to pay from wallet."
        onConfirm={executeWalletPayment}
        onCancel={() => setShowPinModal(false)}
      />
    </div>
  )
}
