"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import {
  IconLoader2,
  IconBolt,
  IconCalendar,
  IconEye,
  IconEdit,
  IconBuildingSkyscraper,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { updateData } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLandlordListings } from "./hooks/useLandlordListings"

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n)

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT: {
    label: "Draft",
    className: "bg-muted text-muted-foreground border-transparent",
  },
  PENDING_REVIEW: {
    label: "Pending Review",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  PUBLISHED: {
    label: "Live",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  ARCHIVED: {
    label: "Archived",
    className: "bg-muted text-muted-foreground border-transparent",
  },
  OCCUPIED: {
    label: "Occupied",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
}

// ── Component ──────────────────────────────────────────────────────────────────

export function LandlordShortlets() {
  const { listings, loading, setListings } = useLandlordListings()
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const shortlets = listings.filter((l) =>
    ["SHORTLET", "HOTEL_ROOM"].includes(l.listingType)
  )

  async function handleToggleInstantBook(listingId: string) {
    setTogglingId(listingId)
    try {
      const res = await updateData<{ id: string; instantBook: boolean }>(
        `/landlord/listings/${listingId}/instant-book`,
        {}
      )
      setListings((prev) =>
        prev.map((l) =>
          l.id === listingId ? { ...l, instantBook: res.instantBook } : l
        )
      )
      toast.success(
        res.instantBook ? "Instant Book enabled" : "Instant Book disabled"
      )
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update")
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          back
          title="Shortlets & Hotel Rooms"
          description={
            loading
              ? "Loading…"
              : `${shortlets.length} propert${shortlets.length !== 1 ? "ies" : "y"}`
          }
        />
        <Button asChild>
          <Link href="/landlord/listings/new">Add Listing</Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
          <IconLoader2 className="size-5 animate-spin" />
          Loading…
        </div>
      ) : shortlets.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border bg-card text-center">
          <IconBuildingSkyscraper className="size-10 text-muted-foreground/40" />
          <div>
            <p className="font-medium">No shortlets or hotel rooms yet</p>
            <p className="text-sm text-muted-foreground">
              Add a shortlet or hotel room listing to get started.
            </p>
          </div>
          <Button size="sm" asChild>
            <Link href="/landlord/listings/new">Add Listing</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shortlets.map((listing) => {
            const statusCfg = STATUS_CONFIG[listing.status] ?? {
              label: listing.status,
              className: "",
            }
            return (
              <Card key={listing.id} className="overflow-hidden p-0">
                {/* Photo */}
                <div className="relative h-44 w-full overflow-hidden bg-muted">
                  {listing.photos[0] ? (
                    <Image
                      src={listing.photos[0]}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                      No photo
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${statusCfg.className}`}
                    >
                      {statusCfg.label}
                    </Badge>
                  </div>
                  {listing.instantBook && (
                    <div className="absolute top-2 right-2">
                      <Badge className="gap-1 bg-amber-400 text-xs text-amber-900 hover:bg-amber-400">
                        <IconBolt className="size-3" />
                        Instant
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="space-y-3 pb-4">
                  <div>
                    <p className="line-clamp-1 font-semibold">
                      {listing.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {listing.area}, {listing.state}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold">
                      {listing.pricePerNight
                        ? `${fmt(listing.pricePerNight)}/night`
                        : "—"}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <IconEye className="size-3.5" />
                      {listing.views.toLocaleString()} views
                    </span>
                  </div>

                  {listing.minimumNights && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <IconCalendar className="size-3.5" />
                      Min. {listing.minimumNights} night
                      {listing.minimumNights !== 1 ? "s" : ""}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      asChild
                    >
                      <Link href={`/landlord/listings/${listing.id}`}>
                        <IconEye className="size-3.5" />
                        View
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      asChild
                    >
                      <Link href={`/landlord/listings/${listing.id}/edit`}>
                        <IconEdit className="size-3.5" />
                        Edit
                      </Link>
                    </Button>
                    {listing.status === "PUBLISHED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0"
                        onClick={() => handleToggleInstantBook(listing.id)}
                        disabled={togglingId === listing.id}
                        title={
                          listing.instantBook
                            ? "Disable Instant Book"
                            : "Enable Instant Book"
                        }
                      >
                        {togglingId === listing.id ? (
                          <IconLoader2 className="size-3.5 animate-spin" />
                        ) : (
                          <IconBolt
                            className={`size-3.5 ${listing.instantBook ? "text-amber-500" : ""}`}
                          />
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
