"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  IconLoader2,
  IconCircleCheck,
  IconX,
  IconEye,
  IconMapPin,
  IconCurrencyNaira,
  IconBed,
  IconBath,
  IconClipboardCheck,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { fetchData, postData, updateData } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

interface AdminListing {
  id: string
  slug: string | null
  title: string
  listingType: string
  propertyCategory: string
  state: string
  lga: string
  area: string
  address: string
  bedrooms: number
  bathrooms: number
  pricePerYear: number | null
  pricePerNight: number | null
  photos: string[]
  amenities: string[]
  description: string
  createdAt: string
  landlord: {
    id: string
    firstName: string
    lastName: string
    email: string
    image: string | null
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

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n)

const TYPE_LABELS: Record<string, string> = {
  LONG_TERM: "Long-term",
  SHORTLET: "Shortlet",
  OFFICE_SPACE: "Office Space",
  HOTEL_ROOM: "Hotel Room",
}

// ── Listing Card ───────────────────────────────────────────────────────────────

function ListingCard({
  listing,
  onApprove,
  onReject,
  approving,
}: {
  listing: AdminListing
  onApprove: (id: string) => void
  onReject: (listing: AdminListing) => void
  approving: string | null
}) {
  const price = listing.pricePerNight
    ? `${fmt(listing.pricePerNight)}/night`
    : listing.pricePerYear
      ? `${fmt(listing.pricePerYear)}/year`
      : "—"

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Photo strip */}
      <div className="relative h-44 bg-muted">
        {listing.photos[0] ? (
          <Image
            src={listing.photos[0]}
            alt={listing.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No photos
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="text-xs">
            {TYPE_LABELS[listing.listingType] ?? listing.listingType}
          </Badge>
        </div>
        {listing.photos.length > 1 && (
          <div className="absolute right-2 bottom-2 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white">
            +{listing.photos.length - 1} photos
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <Link
          href={`/admin/listings/${listing.slug ?? listing.id}`}
          className="truncate text-sm font-semibold hover:underline"
        >
          {listing.title}
        </Link>

        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <IconMapPin className="size-3 shrink-0" />
          <span className="truncate">
            {listing.area}, {listing.state}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <IconBed className="size-3" />
            {listing.bedrooms} bed
          </span>
          <span className="flex items-center gap-1">
            <IconBath className="size-3" />
            {listing.bathrooms} bath
          </span>
          <span className="ml-auto flex items-center gap-1 font-semibold text-foreground">
            <IconCurrencyNaira className="size-3" />
            {price}
          </span>
        </div>

        {/* Landlord */}
        <div className="mt-3 border-t pt-3">
          <p className="text-xs text-muted-foreground">
            Listed by{" "}
            <span className="font-medium text-foreground">
              {listing.landlord.firstName} {listing.landlord.lastName}
            </span>{" "}
            · {listing.landlord.email}
          </p>
          <p className="text-xs text-muted-foreground">
            Submitted{" "}
            {new Date(listing.createdAt).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-green-600 text-white hover:bg-green-700"
            onClick={() => onApprove(listing.id)}
            disabled={approving === listing.id}
          >
            {approving === listing.id ? (
              <IconLoader2 className="size-3.5 animate-spin" />
            ) : (
              <IconCircleCheck className="size-3.5" />
            )}
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => onReject(listing)}
            disabled={approving === listing.id}
          >
            <IconX className="size-3.5" />
            Reject
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function ModerationQueue() {
  const [listings, setListings] = useState<AdminListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Approve state
  const [approving, setApproving] = useState<string | null>(null)

  // Reject dialog state
  const [rejectTarget, setRejectTarget] = useState<AdminListing | null>(null)
  const [presetReason, setPresetReason] = useState("")
  const [customReason, setCustomReason] = useState("")
  const [rejecting, setRejecting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetchData<{ listings: AdminListing[] }>(
      "/admin/listings?status=PENDING_REVIEW&limit=50"
    )
      .then((data) => setListings(data.listings))
      .catch(() => setError("Failed to load pending listings."))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleApprove(id: string) {
    setApproving(id)
    try {
      await updateData(`/admin/listings/${id}/approve`, {})
      setListings((prev) => prev.filter((l) => l.id !== id))
      toast.success("Listing approved and landlord notified.")
    } catch {
      toast.error("Failed to approve listing.")
    } finally {
      setApproving(null)
    }
  }

  function openRejectDialog(listing: AdminListing) {
    setRejectTarget(listing)
    setPresetReason("")
    setCustomReason("")
  }

  async function handleReject() {
    if (!rejectTarget) return

    const finalReason =
      presetReason === "Other (see details below)" || !presetReason
        ? customReason.trim()
        : presetReason +
          (customReason.trim() ? `\n\n${customReason.trim()}` : "")

    if (!finalReason) {
      toast.error("Please provide a rejection reason.")
      return
    }

    setRejecting(true)
    try {
      await updateData(`/admin/listings/${rejectTarget.id}/reject`, {
        reason: finalReason,
      })
      setListings((prev) => prev.filter((l) => l.id !== rejectTarget.id))
      toast.success("Listing rejected and landlord notified.")
      setRejectTarget(null)
    } catch {
      toast.error("Failed to reject listing.")
    } finally {
      setRejecting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        back
        title="Moderation Queue"
        description={
          loading
            ? "Loading…"
            : `${listings.length} listing${listings.length !== 1 ? "s" : ""} pending review`
        }
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
          <IconLoader2 className="size-5 animate-spin" />
          Loading pending listings…
        </div>
      ) : error ? (
        <div className="flex h-64 items-center justify-center text-sm text-destructive">
          {error}
        </div>
      ) : listings.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border bg-card text-center">
          <IconClipboardCheck className="size-10 text-muted-foreground/40" />
          <div>
            <p className="font-medium">All caught up!</p>
            <p className="text-sm text-muted-foreground">
              No listings are pending review right now.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onApprove={handleApprove}
              onReject={openRejectDialog}
              approving={approving}
            />
          ))}
        </div>
      )}

      {/* Reject dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={() => setRejectTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject listing</DialogTitle>
            <DialogDescription>
              The landlord will be emailed with the reason below. Be specific so
              they know exactly what to fix.
            </DialogDescription>
          </DialogHeader>

          {rejectTarget && (
            <div className="space-y-4">
              {/* Listing preview */}
              <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
                <p className="font-medium">{rejectTarget.title}</p>
                <p className="text-xs text-muted-foreground">
                  {rejectTarget.area}, {rejectTarget.state}
                </p>
              </div>

              {/* Preset reason */}
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

              {/* Custom details */}
              <div className="space-y-1.5">
                <Label>
                  Additional details{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  placeholder="Add any specific instructions or clarifications for the landlord…"
                  rows={3}
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectTarget(null)}
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
              Reject & notify landlord
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
