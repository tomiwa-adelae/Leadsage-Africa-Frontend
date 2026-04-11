"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
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
  IconCurrencyNaira,
  IconCalendar,
  IconCircleCheck,
  IconX,
  IconUser,
  IconPhone,
  IconMail,
  IconHome,
  IconPaw,
  IconSmokingNo,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { fetchData, updateData } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// ── Types ──────────────────────────────────────────────────────────────────────

interface ListingDetail {
  id: string
  slug: string | null
  title: string
  summary: string | null
  description: string
  listingType: string
  propertyCategory: string
  status: string
  rejectionReason: string | null
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
  pricePerNight: number | null
  paymentFrequency: string | null
  cautionFee: number | null
  serviceCharge: number | null
  minimumNights: number | null
  amenities: string[]
  petFriendly: boolean
  smokingAllowed: boolean
  availableFrom: string
  photos: string[]
  views: number
  createdAt: string
  landlord: {
    id: string
    firstName: string
    lastName: string
    email: string
    image: string | null
    phoneNumber: string | null
    createdAt: string
    _count: { listings: number }
  }
}

// ── Constants ──────────────────────────────────────────────────────────────────

const PRESET_REASONS = [
  "Photos are blurry, insufficient, or misleading",
  "Pricing information is missing or appears inaccurate",
  "Property description is incomplete or unclear",
  "Location details are invalid or unverifiable",
  "Duplicate listing — this property is already listed",
  "Content violates our listing policies",
  "Property ownership or availability could not be verified",
  "Other (see details below)",
]

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  PUBLISHED: {
    label: "Published",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  PENDING_REVIEW: {
    label: "Pending Review",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  DRAFT: {
    label: "Draft",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
  ARCHIVED: {
    label: "Archived",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
}

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
    const parsed = JSON.parse(json)
    return generateHTML(parsed, [StarterKit])
  } catch {
    return json
  }
}

// ── Component ──────────────────────────────────────────────────────────────────

export function AdminListingDetail({ slug }: { slug: string }) {
  const router = useRouter()
  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activePhoto, setActivePhoto] = useState(0)
  const [actionId, setActionId] = useState<string | null>(null)
  const [showReject, setShowReject] = useState(false)
  const [presetReason, setPresetReason] = useState("")
  const [customReason, setCustomReason] = useState("")
  const [rejecting, setRejecting] = useState(false)

  useEffect(() => {
    fetchData<ListingDetail>(`/admin/listings/${slug}`)
      .then(setListing)
      .catch(() => setError("Listing not found."))
      .finally(() => setLoading(false))
  }, [slug])

  async function handleApprove() {
    if (!listing) return
    setActionId("approve")
    try {
      await updateData(`/admin/listings/${listing.id}/approve`, {})
      setListing((prev) =>
        prev ? { ...prev, status: "PUBLISHED", rejectionReason: null } : prev
      )
      toast.success("Listing approved and published.")
    } catch {
      toast.error("Failed to approve listing.")
    } finally {
      setActionId(null)
    }
  }

  async function handleReject() {
    if (!listing) return
    const finalReason =
      presetReason === PRESET_REASONS[PRESET_REASONS.length - 1] ||
      !presetReason
        ? customReason.trim()
        : presetReason +
          (customReason.trim() ? `\n\n${customReason.trim()}` : "")
    if (!finalReason) {
      toast.error("Please provide a reason.")
      return
    }

    setRejecting(true)
    try {
      await updateData(`/admin/listings/${listing.id}/reject`, {
        reason: finalReason,
      })
      setListing((prev) =>
        prev
          ? { ...prev, status: "REJECTED", rejectionReason: finalReason }
          : prev
      )
      toast.success("Listing rejected and landlord notified.")
      setShowReject(false)
    } catch {
      toast.error("Failed to reject listing.")
    } finally {
      setRejecting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
        <IconLoader2 className="size-5 animate-spin" />
        Loading listing…
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-destructive">
          {error ?? "Listing not found."}
        </p>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <IconArrowLeft className="size-4" />
          Go back
        </Button>
      </div>
    )
  }

  const badge = STATUS_BADGE[listing.status] ?? {
    label: listing.status,
    className: "",
  }
  const isPending = listing.status === "PENDING_REVIEW"
  const isRejected = listing.status === "REJECTED"
  const landlordInitials =
    `${listing.landlord.firstName?.[0] ?? ""}${listing.landlord.lastName?.[0] ?? ""}`.toUpperCase()

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <PageHeader back title={listing.title} />
        <Badge variant="outline" className={`text-sm ${badge.className}`}>
          {badge.label}
        </Badge>
      </div>

      {/* Status banner */}
      {isPending && (
        <div className="flex flex-col gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-yellow-800">
              This listing is pending review
            </p>
            <p className="text-sm text-yellow-700">
              Review the listing below and approve or reject it.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              className="bg-green-600 text-white hover:bg-green-700"
              onClick={handleApprove}
              disabled={!!actionId}
            >
              {actionId === "approve" ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : (
                <IconCircleCheck className="size-4" />
              )}
              Approve
            </Button>
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => {
                setShowReject(true)
                setPresetReason("")
                setCustomReason("")
              }}
              disabled={!!actionId}
            >
              <IconX className="size-4" />
              Reject
            </Button>
          </div>
        </div>
      )}

      {isRejected && listing.rejectionReason && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="font-semibold text-red-800">Rejected listing</p>
          <p className="mt-1 text-sm text-red-700">{listing.rejectionReason}</p>
          <Button
            size="sm"
            className="mt-3 bg-green-600 text-white hover:bg-green-700"
            onClick={handleApprove}
            disabled={!!actionId}
          >
            {actionId === "approve" ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : (
              <IconCircleCheck className="size-4" />
            )}
            Approve anyway
          </Button>
        </div>
      )}

      <div className="grid gap-2 lg:grid-cols-3">
        {/* LEFT — photos + details */}
        <div className="space-y-4 lg:col-span-2">
          {/* Photos */}
          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="relative h-72 bg-muted sm:h-96">
              {listing.photos[activePhoto] ? (
                <Image
                  src={listing.photos[activePhoto]}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No photos uploaded
                </div>
              )}
            </div>
            {listing.photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3">
                {listing.photos.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhoto(i)}
                    className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                      i === activePhoto
                        ? "border-primary"
                        : "border-transparent"
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

          {/* Core specs */}
          <div className="space-y-4 rounded-xl border bg-card p-5">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                {TYPE_LABELS[listing.listingType] ?? listing.listingType}
              </Badge>
              <Badge variant="outline">
                {listing.propertyCategory.replace(/_/g, " ")}
              </Badge>
              <Badge variant="outline">
                {FURNISHED_LABELS[listing.furnished] ?? listing.furnished}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
                    <Icon className="size-3.5" />
                    {label}
                  </div>
                  <p className="text-sm font-semibold">{value}</p>
                </div>
              ))}
            </div>

            <Separator />

            {/* Pricing */}
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Pricing
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {listing.pricePerYear && (
                  <div>
                    <p className="text-xs text-muted-foreground">Per year</p>
                    <p className="text-sm font-semibold">
                      {fmt(listing.pricePerYear)}
                    </p>
                    {listing.paymentFrequency && (
                      <p className="text-xs text-muted-foreground">
                        {FREQ_LABELS[listing.paymentFrequency] ??
                          listing.paymentFrequency}{" "}
                        payments
                      </p>
                    )}
                  </div>
                )}
                {listing.pricePerNight && (
                  <div>
                    <p className="text-xs text-muted-foreground">Per night</p>
                    <p className="text-sm font-semibold">
                      {fmt(listing.pricePerNight)}
                    </p>
                    {listing.minimumNights && (
                      <p className="text-xs text-muted-foreground">
                        Min. {listing.minimumNights} nights
                      </p>
                    )}
                  </div>
                )}
                {listing.cautionFee && (
                  <div>
                    <p className="text-xs text-muted-foreground">Caution fee</p>
                    <p className="text-sm font-semibold">
                      {fmt(listing.cautionFee)}
                    </p>
                  </div>
                )}
                {listing.serviceCharge && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Service charge
                    </p>
                    <p className="text-sm font-semibold">
                      {fmt(listing.serviceCharge)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Location */}
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Location
              </p>
              <div className="flex items-start gap-2 text-sm">
                <IconMapPin className="mt-0.5 size-4 flex-shrink-0 text-muted-foreground" />
                <span>
                  {listing.address}, {listing.area}, {listing.lga},{" "}
                  {listing.state}
                </span>
              </div>
            </div>

            <Separator />

            {/* Rules & availability */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <IconCalendar className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">Available from</span>
                <span className="font-medium">
                  {new Date(listing.availableFrom).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div
                className={`flex items-center gap-1.5 ${listing.petFriendly ? "text-green-600" : "text-muted-foreground"}`}
              >
                <IconPaw className="size-4" />
                <span>{listing.petFriendly ? "Pets allowed" : "No pets"}</span>
              </div>
              <div
                className={`flex items-center gap-1.5 ${listing.smokingAllowed ? "text-green-600" : "text-muted-foreground"}`}
              >
                <IconSmokingNo className="size-4" />
                <span>
                  {listing.smokingAllowed ? "Smoking allowed" : "No smoking"}
                </span>
              </div>
            </div>
          </div>

          {/* Amenities */}
          {listing.amenities.length > 0 && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {listing.amenities.map((a) => (
                  <Badge key={a} variant="secondary" className="text-xs">
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
            <CardContent>
              <div className="prose prose-sm max-w-none text-sm text-foreground [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_ol]:pl-4 [&_ul]:pl-4">
                {parse(renderDescription(listing.description))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT — landlord + meta */}
        <div className="space-y-4">
          {/* Landlord card */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Listed by</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarImage src={listing.landlord.image ?? ""} />
                  <AvatarFallback className="bg-muted text-sm">
                    {landlordInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">
                    {listing.landlord.firstName} {listing.landlord.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {listing.landlord._count.listings} listing
                    {listing.landlord._count.listings !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <a
                  href={`mailto:${listing.landlord.email}`}
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <IconMail className="size-4 flex-shrink-0" />
                  <span className="truncate">{listing.landlord.email}</span>
                </a>
                {listing.landlord.phoneNumber && (
                  <a
                    href={`tel:${listing.landlord.phoneNumber}`}
                    className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <IconPhone className="size-4 flex-shrink-0" />
                    {listing.landlord.phoneNumber}
                  </a>
                )}
              </div>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href={`/admin/users?search=${listing.landlord.email}`}>
                  <IconUser className="size-4" />
                  View user profile
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Listing meta */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Additional Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "ID", value: listing.id.slice(0, 8) + "…" },
                { label: "Slug", value: listing.slug ?? "—" },
                {
                  label: "Submitted",
                  value: new Date(listing.createdAt).toLocaleDateString(
                    "en-NG",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }
                  ),
                },
                { label: "Views", value: listing.views.toLocaleString() },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="max-w-36 truncate text-right font-mono font-medium">
                    {value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reject dialog */}
      <Dialog open={showReject} onOpenChange={setShowReject}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject listing</DialogTitle>
            <DialogDescription>
              The landlord will receive an email with the reason below.
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
              <Label>Reason</Label>
              <Select value={presetReason} onValueChange={setPresetReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason…" />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>
                Additional details{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Textarea
                placeholder="Add specific instructions for the landlord…"
                rows={3}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReject(false)}
              disabled={rejecting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejecting || (!presetReason && !customReason.trim())}
            >
              {rejecting ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : (
                <IconX className="size-4" />
              )}
              Reject & notify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
