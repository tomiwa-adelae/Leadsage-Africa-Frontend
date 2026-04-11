"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import parse from "html-react-parser"
import { generateHTML } from "@tiptap/html"
import StarterKit from "@tiptap/starter-kit"
import {
  IconLoader2,
  IconArrowLeft,
  IconMapPin,
  IconBed,
  IconBath,
  IconToiletPaper,
  IconRuler,
  IconCalendar,
  IconPaw,
  IconSmokingNo,
  IconCurrencyNaira,
  IconUser,
  IconBookmark,
  IconBookmarkFilled,
  IconChevronLeft,
  IconChevronRight,
  IconMoon,
  IconShieldCheck,
  IconHomeDot,
} from "@tabler/icons-react"
import { toast } from "sonner"

import type { DateRange } from "react-day-picker"
import { publicFetch, postData, deleteData, fetchData } from "@/lib/api"
import { useAuth } from "@/store/useAuth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// ── Types ──────────────────────────────────────────────────────────────────────

interface PublicListing {
  id: string
  slug: string | null
  title: string
  summary: string | null
  description: string
  listingType: string
  propertyCategory: string
  state: string
  lga: string
  area: string
  address: string
  bedrooms: number
  bathrooms: number
  toilets: number
  sizeInSqm: number | null
  furnished: string
  pricePerYear: number | null
  paymentFrequency: string | null
  cautionFee: number | null
  serviceCharge: number | null
  pricePerNight: number | null
  minimumNights: number | null
  amenities: string[]
  petFriendly: boolean
  smokingAllowed: boolean
  availableFrom: string
  photos: string[]
  instantBook: boolean
  views: number
  createdAt: string
  landlord: {
    id: string
    firstName: string
    lastName: string
    image: string | null
    createdAt: string
    _count: { listings: number }
  }
}

interface SimilarListing {
  id: string
  slug: string | null
  title: string
  state: string
  area: string
  bedrooms: number
  bathrooms: number
  pricePerYear: number | null
  pricePerNight: number | null
  photos: string[]
}

// ── Constants ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  LONG_TERM: "Long-term Rental",
  SHORTLET: "Shortlet",
  OFFICE_SPACE: "Office Space",
  HOTEL_ROOM: "Hotel Room",
}

const FURNISHED_LABELS: Record<string, string> = {
  FURNISHED: "Furnished",
  SEMI_FURNISHED: "Semi-furnished",
  UNFURNISHED: "Unfurnished",
}

const FREQ_LABELS: Record<string, string> = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  BI_ANNUALLY: "Bi-annually",
  ANNUALLY: "Annually",
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n)

function renderDescription(json: string): string {
  try {
    return generateHTML(JSON.parse(json), [StarterKit])
  } catch {
    return json
  }
}

// ── Availability Calendar (listing page inline) ────────────────────────────────

function AvailabilityCalendar({ listingId }: { listingId: string }) {
  const [bookedRanges, setBookedRanges] = useState<{ from: Date; to: Date }[]>([])

  useEffect(() => {
    publicFetch<{ from: string; to: string }[]>(
      `/api/listings/public/${listingId}/booked-dates`
    )
      .then((data) => setBookedRanges(buildDisabledDates(data)))
      .catch(() => {})
  }, [listingId])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <IconCalendar className="size-4" />
          Availability
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3 pt-4">
        <Calendar
          mode="range"
          disabled={[{ before: today }, ...bookedRanges]}
          numberOfMonths={1}
          defaultMonth={today}
          className="rounded-lg"
        />
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-sm bg-primary/80" />
            Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-sm bg-muted border" />
            Unavailable / past
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Apply Dialog ───────────────────────────────────────────────────────────────

function ApplyDialog({
  listing,
  open,
  onClose,
}: {
  listing: PublicListing
  open: boolean
  onClose: () => void
}) {
  const [message, setMessage] = useState("")
  const [moveInDate, setMoveInDate] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    setSubmitting(true)
    try {
      await postData("/user/applications", {
        listingId: listing.id,
        message: message.trim() || undefined,
        moveInDate: moveInDate || undefined,
      })
      toast.success(
        "Application submitted! The landlord will review it shortly."
      )
      onClose()
    } catch (err: any) {
      const msg = err?.response?.data?.message
      toast.error(
        typeof msg === "string" ? msg : "Failed to submit application"
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Apply for this property</DialogTitle>
          <DialogDescription>
            Your profile will be shared with the landlord. They'll contact you
            if you're a good fit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
            <p className="font-medium">{listing.title}</p>
            <p className="text-xs text-muted-foreground">
              {listing.area}, {listing.state}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>
              Preferred move-in date{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Input
              type="date"
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>
              Message to landlord{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Textarea
              placeholder="Tell the landlord a bit about yourself — who you are, why you're interested, how many people will be living there…"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <IconLoader2 className="size-4 animate-spin" />}
            Submit application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Tour Request Dialog ────────────────────────────────────────────────────────

function TourRequestDialog({
  listing,
  open,
  onClose,
}: {
  listing: PublicListing
  open: boolean
  onClose: () => void
}) {
  const [preferredDate, setPreferredDate] = useState("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    setSubmitting(true)
    try {
      await postData("/user/tours", {
        listingId: listing.id,
        preferredDate: preferredDate || undefined,
        notes: notes.trim() || undefined,
      })
      toast.success(
        "Tour request submitted! Our team will schedule it and notify you."
      )
      onClose()
    } catch (err: any) {
      const msg = err?.response?.data?.message
      toast.error(typeof msg === "string" ? msg : "Failed to submit tour request")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request a Property Tour</DialogTitle>
          <DialogDescription>
            A Leadsage agent will contact you to schedule an inspection at your
            preferred time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
            <p className="font-medium">{listing.title}</p>
            <p className="text-xs text-muted-foreground">
              {listing.area}, {listing.state}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>
              Preferred date{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              type="date"
              value={preferredDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setPreferredDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>
              Notes{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              placeholder="Any questions or special requests for the tour?"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <IconLoader2 className="size-4 animate-spin" />}
            Request Tour
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function toDate(s: string) {
  const [y, m, d] = s.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

/** Convert booked date ranges to disabled Date[] for react-day-picker */
function buildDisabledDates(
  ranges: { from: string; to: string }[]
): { from: Date; to: Date }[] {
  return ranges.map((r) => ({ from: toDate(r.from), to: toDate(r.to) }))
}

// ── Book Dialog ────────────────────────────────────────────────────────────────

function BookDialog({
  listing,
  open,
  onClose,
}: {
  listing: PublicListing
  open: boolean
  onClose: () => void
}) {
  const [range, setRange] = useState<DateRange | undefined>()
  const [guests, setGuests] = useState(1)
  const [requests, setRequests] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [bookedRanges, setBookedRanges] = useState<{ from: Date; to: Date }[]>([])

  // Fetch booked dates when dialog opens
  useEffect(() => {
    if (!open) return
    publicFetch<{ from: string; to: string }[]>(
      `/api/listings/public/${listing.id}/booked-dates`
    )
      .then((data) => setBookedRanges(buildDisabledDates(data)))
      .catch(() => {})
  }, [open, listing.id])

  const nights =
    range?.from && range?.to
      ? Math.max(
          0,
          Math.round(
            (range.to.getTime() - range.from.getTime()) / 86400000
          )
        )
      : 0

  const total =
    listing.pricePerNight && nights > 0 ? listing.pricePerNight * nights : null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const disabledDays = [
    { before: today },
    ...bookedRanges,
  ]

  async function handleSubmit() {
    if (!range?.from || !range?.to) {
      toast.error("Please select your check-in and check-out dates")
      return
    }
    if (nights <= 0) {
      toast.error("Check-out must be after check-in")
      return
    }
    if (listing.minimumNights && nights < listing.minimumNights) {
      toast.error(`Minimum stay is ${listing.minimumNights} nights`)
      return
    }

    setSubmitting(true)
    try {
      const res = await postData<{ booking: any; paymentUrl: string }>(
        "/user/bookings",
        {
          listingId: listing.id,
          checkIn: toDateStr(range.from),
          checkOut: toDateStr(range.to),
          guestCount: guests,
          specialRequests: requests.trim() || undefined,
        }
      )
      toast.success("Redirecting to payment…")
      onClose()
      window.location.href = res.paymentUrl
    } catch (err: any) {
      const msg = err?.response?.data?.message
      toast.error(typeof msg === "string" ? msg : "Failed to submit booking")
    } finally {
      setSubmitting(false)
    }
  }

  const fmtShort = (d: Date) =>
    d.toLocaleDateString("en-NG", { day: "numeric", month: "short" })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0">
        <DialogHeader className="border-b px-5 pt-5 pb-4">
          <DialogTitle>Select your dates</DialogTitle>
          <DialogDescription>
            {listing.pricePerNight ? `${fmt(listing.pricePerNight)}/night` : ""}
            {listing.minimumNights
              ? ` · min. ${listing.minimumNights} nights`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto px-5 pb-5 space-y-4 max-h-[70vh]">
          {/* Calendar */}
          <div className="flex justify-center">
            <Calendar
              mode="range"
              selected={range}
              onSelect={setRange}
              disabled={disabledDays}
              numberOfMonths={1}
              defaultMonth={today}
              className="rounded-lg border"
            />
          </div>

          {/* Selected range summary */}
          {range?.from && (
            <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Check-in</p>
                <p className="font-medium">{fmtShort(range.from)}</p>
              </div>
              <div className="text-muted-foreground">→</div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Check-out</p>
                <p className="font-medium">
                  {range.to ? fmtShort(range.to) : "—"}
                </p>
              </div>
              {nights > 0 && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Nights</p>
                  <p className="font-medium">{nights}</p>
                </div>
              )}
            </div>
          )}

          {/* Price summary */}
          {nights > 0 && total && (
            <div className="space-y-1.5 rounded-lg border bg-muted/40 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {fmt(listing.pricePerNight!)} × {nights} night{nights > 1 ? "s" : ""}
                </span>
                <span>{fmt(total)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{fmt(total)}</span>
              </div>
            </div>
          )}

          {/* Guests */}
          <div className="space-y-1.5">
            <Label>Guests</Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
            />
          </div>

          {/* Special requests */}
          <div className="space-y-1.5">
            <Label>
              Special requests{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              placeholder="Any special requests or questions for the host…"
              rows={2}
              value={requests}
              onChange={(e) => setRequests(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="border-t px-5 py-4">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !range?.from || !range?.to || nights <= 0}
          >
            {submitting && <IconLoader2 className="size-4 animate-spin" />}
            {submitting ? "Preparing payment…" : nights > 0 ? `Book & Pay ${total ? fmt(total) : ""}` : "Book & Pay"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function ListingDetail({ slug }: { slug: string }) {
  const router = useRouter()
  const { user, _hasHydrated } = useAuth()

  const [listing, setListing] = useState<PublicListing | null>(null)
  const [similar, setSimilar] = useState<SimilarListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activePhoto, setActivePhoto] = useState(0)
  const [isSaved, setIsSaved] = useState(false)
  const [savingId, setSavingId] = useState(false)
  const [showApply, setShowApply] = useState(false)
  const [showBook, setShowBook] = useState(false)
  const [showTourRequest, setShowTourRequest] = useState(false)

  useEffect(() => {
    publicFetch<PublicListing>(`/api/listings/public/${slug}`)
      .then((data) => {
        setListing(data)
        // Load similar listings
        return publicFetch<SimilarListing[]>(
          `/api/listings/public/${data.id}/similar?listingType=${data.listingType}&state=${data.state}`
        )
          .then(setSimilar)
          .catch(() => {})
      })
      .catch(() => setError("Listing not found or no longer available."))
      .finally(() => setLoading(false))
  }, [slug])

  // Check if already saved
  useEffect(() => {
    if (!_hasHydrated || !user || !listing) return
    fetchData<{ listing: { id: string } }[]>("/user/saved")
      .then((items) =>
        setIsSaved(items.some((i) => i.listing.id === listing.id))
      )
      .catch(() => {})
  }, [user, _hasHydrated, listing])

  async function handleToggleSave() {
    if (!user) {
      toast.info("Log in to save listings", {
        action: {
          label: "Login",
          onClick: () => router.push(`/login?redirect=/listings/${slug}`),
        },
      })
      return
    }
    if (!listing) return
    setSavingId(true)
    try {
      if (isSaved) {
        await deleteData(`/user/saved/${listing.id}`)
        setIsSaved(false)
        toast.success("Removed from saved")
      } else {
        await postData(`/user/saved/${listing.id}`, {})
        setIsSaved(true)
        toast.success("Saved to your list")
      }
    } catch {
      toast.error("Failed to update saved listings")
    } finally {
      setSavingId(false)
    }
  }

  function handleCTA() {
    if (!user) {
      router.push(`/login?redirect=/listings/${slug}`)
      return
    }
    if (isShortlet) setShowBook(true)
    else setShowApply(true)
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center gap-2 text-muted-foreground">
        <IconLoader2 className="size-5 animate-spin" />
        Loading listing…
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-destructive">
          {error ?? "Listing not found."}
        </p>
        <Button variant="outline" onClick={() => router.push("/listings")}>
          <IconArrowLeft className="size-4" />
          Back to listings
        </Button>
      </div>
    )
  }

  const isShortlet = ["SHORTLET", "HOTEL_ROOM"].includes(listing.listingType)
  const isLongTerm = ["LONG_TERM", "OFFICE_SPACE"].includes(listing.listingType)
  const landlordInitials =
    `${listing.landlord.firstName?.[0] ?? ""}${listing.landlord.lastName?.[0] ?? ""}`.toUpperCase()
  const landlordSince = new Date(listing.landlord.createdAt).getFullYear()

  return (
    <div className="min-h-screen bg-background">
      <div className="container space-y-4 py-10">
        {/* Back + Save */}
        <div className="flex items-center justify-between">
          <PageHeader back title={`${listing.title}`} />
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleSave}
            disabled={savingId}
          >
            {savingId ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : isSaved ? (
              <IconBookmarkFilled className="size-4 text-yellow-500" />
            ) : (
              <IconBookmark className="size-4" />
            )}
            {isSaved ? "Saved" : "Save"}
          </Button>
        </div>

        {/* Photo gallery */}
        <div className="overflow-hidden rounded-2xl border bg-muted">
          <div className="relative h-72 sm:h-[420px]">
            {listing.photos[activePhoto] ? (
              <Image
                src={listing.photos[activePhoto]}
                alt={listing.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No photos
              </div>
            )}
            {listing.photos.length > 1 && (
              <>
                <button
                  onClick={() => setActivePhoto((p) => Math.max(0, p - 1))}
                  disabled={activePhoto === 0}
                  className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70 disabled:opacity-30"
                >
                  <IconChevronLeft className="size-5" />
                </button>
                <button
                  onClick={() =>
                    setActivePhoto((p) =>
                      Math.min(listing.photos.length - 1, p + 1)
                    )
                  }
                  disabled={activePhoto === listing.photos.length - 1}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70 disabled:opacity-30"
                >
                  <IconChevronRight className="size-5" />
                </button>
                <div className="absolute right-3 bottom-3 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
                  {activePhoto + 1} / {listing.photos.length}
                </div>
              </>
            )}
          </div>
          {listing.photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto p-3">
              {listing.photos.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  className={`relative size-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    i === activePhoto
                      ? "border-primary"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={src}
                    alt={`Photo ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* LEFT — details */}
          <div className="space-y-6 lg:col-span-2">
            {/* Title + badges */}
            <div>
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {TYPE_LABELS[listing.listingType] ?? listing.listingType}
                </Badge>
                <Badge variant="outline">
                  {listing.propertyCategory.replace(/_/g, " ")}
                </Badge>
                <Badge variant="outline">
                  {FURNISHED_LABELS[listing.furnished] ?? listing.furnished}
                </Badge>
                {listing.instantBook && (
                  <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">
                    <IconShieldCheck className="mr-1 size-3.5" />
                    Instant Book
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl leading-tight font-bold">
                {listing.title}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <IconMapPin className="size-4 shrink-0" />
                {listing.address}, {listing.area}, {listing.lga},{" "}
                {listing.state}
              </p>
            </div>

            {/* Key specs */}
            <Card>
              <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { icon: IconBed, label: "Bedrooms", value: listing.bedrooms },
                  {
                    icon: IconBath,
                    label: "Bathrooms",
                    value: listing.bathrooms,
                  },
                  {
                    icon: IconToiletPaper,
                    label: "Toilets",
                    value: listing.toilets,
                  },
                  {
                    icon: IconRuler,
                    label: "Size",
                    value: listing.sizeInSqm ? `${listing.sizeInSqm} m²` : "—",
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Icon className="size-3.5" /> {label}
                    </div>
                    <p className="text-base font-semibold">{value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-6">
                  {listing.pricePerYear && (
                    <div>
                      <p className="text-2xl font-bold">
                        {fmt(listing.pricePerYear)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        per year
                        {listing.paymentFrequency
                          ? ` · ${FREQ_LABELS[listing.paymentFrequency] ?? listing.paymentFrequency} payments`
                          : ""}
                      </p>
                    </div>
                  )}
                  {listing.pricePerNight && (
                    <div>
                      <p className="text-2xl font-bold">
                        {fmt(listing.pricePerNight)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        per night
                        {listing.minimumNights
                          ? ` · min. ${listing.minimumNights} nights`
                          : ""}
                      </p>
                    </div>
                  )}
                </div>
                {(listing.cautionFee || listing.serviceCharge) && (
                  <div className="flex gap-6 border-t pt-3 text-sm">
                    {listing.cautionFee && (
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Caution fee
                        </p>
                        <p className="font-medium">{fmt(listing.cautionFee)}</p>
                      </div>
                    )}
                    {listing.serviceCharge && (
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Service charge
                        </p>
                        <p className="font-medium">
                          {fmt(listing.serviceCharge)}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Availability + rules */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
                <IconCalendar className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Available from
                  </p>
                  <p className="font-medium">
                    {new Date(listing.availableFrom).toLocaleDateString(
                      "en-NG",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>
              <div
                className={`flex items-center gap-2 rounded-lg border bg-card px-3 py-2 ${listing.petFriendly ? "text-green-600" : "text-muted-foreground"}`}
              >
                <IconPaw className="size-4" />
                <span className="text-sm">
                  {listing.petFriendly ? "Pets allowed" : "No pets"}
                </span>
              </div>
              <div
                className={`flex items-center gap-2 rounded-lg border bg-card px-3 py-2 ${listing.smokingAllowed ? "text-green-600" : "text-muted-foreground"}`}
              >
                <IconSmokingNo className="size-4" />
                <span className="text-sm">
                  {listing.smokingAllowed ? "Smoking allowed" : "No smoking"}
                </span>
              </div>
            </div>

            {/* Availability calendar — shortlets only */}
            {isShortlet && (
              <AvailabilityCalendar listingId={listing.id} />
            )}

            {/* Amenities */}
            {listing.amenities.length > 0 && (
              <Card>
                <CardHeader className="border-b">
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>

                <CardContent className="flex flex-wrap gap-2">
                  {listing.amenities.map((a) => (
                    <Badge
                      key={a}
                      variant="secondary"
                      className="text-xs capitalize"
                    >
                      {a}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Summary */}
            {listing.summary && (
              <Card>
                <CardHeader className="border-b">
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {listing.summary}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Description</CardTitle>
              </CardHeader>

              <CardContent className="prose prose-sm max-w-none text-sm text-foreground [&_h1]:text-base [&_h2]:text-sm [&_ol]:pl-4 [&_ul]:pl-4">
                {parse(renderDescription(listing.description))}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT — CTA + landlord */}
          <div className="space-y-4">
            {/* CTA card */}
            <Card className="sticky top-24">
              <CardContent className="space-y-4">
                <div>
                  {listing.pricePerYear && (
                    <p className="text-2xl font-bold">
                      {fmt(listing.pricePerYear)}
                      <span className="text-sm font-normal text-muted-foreground">
                        /yr
                      </span>
                    </p>
                  )}
                  {listing.pricePerNight && (
                    <p className="text-2xl font-bold">
                      {fmt(listing.pricePerNight)}
                      <span className="text-sm font-normal text-muted-foreground">
                        /night
                      </span>
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  {isLongTerm ? (
                    <>
                      <Button
                        className="w-full"
                        onClick={() => {
                          if (!user) {
                            router.push(`/login?redirect=/listings/${slug}`)
                            return
                          }
                          setShowTourRequest(true)
                        }}
                      >
                        <IconHomeDot className="size-4" /> Request a Tour
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleCTA}
                      >
                        <IconShieldCheck className="size-4" /> Apply directly
                      </Button>
                    </>
                  ) : (
                    <Button className="w-full" onClick={handleCTA}>
                      <IconMoon className="size-4" /> Book now
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleToggleSave}
                    disabled={savingId}
                  >
                    {isSaved ? (
                      <>
                        <IconBookmarkFilled className="size-4 text-yellow-500" />{" "}
                        Saved
                      </>
                    ) : (
                      <>
                        <IconBookmark className="size-4" /> Save listing
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                  {isShortlet
                    ? "No charge until confirmed by the host"
                    : "Free to apply — no commitment"}
                </p>
              </CardContent>
            </Card>

            {/* Landlord card */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Listed By</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarImage src={listing.landlord.image ?? ""} />
                  <AvatarFallback>{landlordInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">
                    {listing.landlord.firstName} {listing.landlord.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {listing.landlord._count.listings} active listing
                    {listing.landlord._count.listings !== 1 ? "s" : ""} · Since{" "}
                    {landlordSince}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar listings */}
        {similar.length > 0 && (
          <div className="space-y-4">
            <Separator />
            <h2 className="text-lg font-semibold">
              Similar listings in {listing.state}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((s) => {
                const price = s.pricePerNight
                  ? `${fmt(s.pricePerNight)}/night`
                  : s.pricePerYear
                    ? `${fmt(s.pricePerYear)}/yr`
                    : "—"
                return (
                  <Link
                    key={s.id}
                    href={`/listings/${s.slug ?? s.id}`}
                    className="group overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
                  >
                    <div className="relative h-36 bg-muted">
                      {s.photos[0] && (
                        <Image
                          src={s.photos[0]}
                          alt={s.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="p-3">
                      <p className="truncate text-sm font-semibold">
                        {s.title}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <IconMapPin className="size-3" /> {s.area}, {s.state}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <IconBed className="size-3" /> {s.bedrooms}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <IconBath className="size-3" /> {s.bathrooms}
                        </span>
                        <span className="ml-auto font-semibold text-foreground">
                          {price}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      {listing && isLongTerm && (
        <>
          <TourRequestDialog
            listing={listing}
            open={showTourRequest}
            onClose={() => setShowTourRequest(false)}
          />
          <ApplyDialog
            listing={listing}
            open={showApply}
            onClose={() => setShowApply(false)}
          />
        </>
      )}
      {listing && isShortlet && (
        <BookDialog
          listing={listing}
          open={showBook}
          onClose={() => setShowBook(false)}
        />
      )}
    </div>
  )
}
