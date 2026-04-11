"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  IconLoader2,
  IconBookmark,
  IconMapPin,
  IconBed,
  IconBath,
  IconCurrencyNaira,
  IconTrash,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { deleteData, fetchData } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// ── Types ──────────────────────────────────────────────────────────────────────

interface SavedItem {
  id: string
  createdAt: string
  listing: {
    id: string
    slug: string | null
    title: string
    listingType: string
    propertyCategory: string
    state: string
    lga: string
    area: string
    bedrooms: number
    bathrooms: number
    pricePerYear: number | null
    pricePerNight: number | null
    photos: string[]
    status: string
    availableFrom: string
  }
}

// ── Constants ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  LONG_TERM: "Long-term",
  SHORTLET: "Shortlet",
  OFFICE_SPACE: "Office Space",
  HOTEL_ROOM: "Hotel Room",
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n)

// ── Component ──────────────────────────────────────────────────────────────────

export function SavedListings() {
  const [items, setItems] = useState<SavedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    fetchData<SavedItem[]>("/user/saved")
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleRemove(listingId: string) {
    setRemoving(listingId)
    try {
      await deleteData(`/user/saved/${listingId}`)
      setItems((prev) => prev.filter((i) => i.listing.id !== listingId))
      toast.success("Removed from saved listings")
    } catch {
      toast.error("Failed to remove listing")
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        back
        title="Saved Listings"
        description={
          loading
            ? "Loading…"
            : `${items.length} saved listing${items.length !== 1 ? "s" : ""}`
        }
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
          <IconLoader2 className="size-5 animate-spin" />
          Loading saved listings…
        </div>
      ) : items.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border bg-card text-center">
          <IconBookmark className="size-10 text-muted-foreground/40" />
          <div>
            <p className="font-medium">No saved listings yet</p>
            <p className="text-sm text-muted-foreground">
              Browse properties and save the ones you like.
            </p>
          </div>
          <Button asChild size="sm">
            <Link href="/">Browse listings</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => {
            const { listing } = item
            const price = listing.pricePerNight
              ? `${fmt(listing.pricePerNight)}/night`
              : listing.pricePerYear
                ? `${fmt(listing.pricePerYear)}/year`
                : "—"
            const href = `/listings/${listing.slug ?? listing.id}`

            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl border bg-card shadow-sm"
              >
                {/* Photo */}
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
                  <button
                    onClick={() => handleRemove(listing.id)}
                    disabled={removing === listing.id}
                    className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-red-600"
                    title="Remove from saved"
                  >
                    {removing === listing.id ? (
                      <IconLoader2 className="size-3.5 animate-spin" />
                    ) : (
                      <IconTrash className="size-3.5" />
                    )}
                  </button>
                </div>

                {/* Info */}
                <div className="p-4">
                  <Link
                    href={href}
                    className="block truncate text-sm font-semibold hover:underline"
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

                  <div className="mt-4">
                    <Button size="sm" className="w-full" asChild>
                      <Link href={href}>View listing</Link>
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
