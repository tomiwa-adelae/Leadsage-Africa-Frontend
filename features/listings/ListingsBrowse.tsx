"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  IconSearch,
  IconLoader2,
  IconMapPin,
  IconBed,
  IconBath,
  IconAdjustmentsHorizontal,
  IconBookmark,
  IconBookmarkFilled,
  IconBuildingSkyscraper,
  IconX,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { publicFetch, postData, deleteData } from "@/lib/api"
import { useAuth } from "@/store/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"

// ── Types ──────────────────────────────────────────────────────────────────────

interface Listing {
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
  furnished: string
  pricePerYear: number | null
  pricePerNight: number | null
  photos: string[]
  availableFrom: string
}

interface BrowseResponse {
  listings: Listing[]
  total: number
  page: number
  pages: number
}

// ── Constants ──────────────────────────────────────────────────────────────────

const LISTING_TYPES = [
  { value: "ALL", label: "All types" },
  { value: "LONG_TERM", label: "Long-term" },
  { value: "SHORTLET", label: "Shortlet" },
  { value: "OFFICE_SPACE", label: "Office Space" },
  { value: "HOTEL_ROOM", label: "Hotel Room" },
]

const BEDROOM_OPTIONS = [
  { value: "ALL", label: "Any" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
  { value: "5", label: "5+" },
]

const FURNISHED_OPTIONS = [
  { value: "ALL", label: "Any" },
  { value: "FURNISHED", label: "Furnished" },
  { value: "SEMI_FURNISHED", label: "Semi-furnished" },
  { value: "UNFURNISHED", label: "Unfurnished" },
]

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
  "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
]

const TYPE_LABELS: Record<string, string> = {
  LONG_TERM: "Long-term",
  SHORTLET: "Shortlet",
  OFFICE_SPACE: "Office",
  HOTEL_ROOM: "Hotel",
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n)

// ── Listing Card ───────────────────────────────────────────────────────────────

function ListingCard({
  listing,
  isSaved,
  onToggleSave,
  savingId,
}: {
  listing: Listing
  isSaved: boolean
  onToggleSave: (id: string, saved: boolean) => void
  savingId: string | null
}) {
  const price = listing.pricePerNight
    ? `${fmt(listing.pricePerNight)}/night`
    : listing.pricePerYear
    ? `${fmt(listing.pricePerYear)}/yr`
    : "—"

  return (
    <div className="group overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Photo */}
      <div className="relative h-48 bg-muted">
        <Link href={`/listings/${listing.slug ?? listing.id}`}>
          {listing.photos[0] ? (
            <Image
              src={listing.photos[0]}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              No photos
            </div>
          )}
        </Link>
        <div className="absolute left-2 top-2">
          <Badge className="bg-black/60 text-white border-0 text-xs backdrop-blur-sm">
            {TYPE_LABELS[listing.listingType] ?? listing.listingType}
          </Badge>
        </div>
        <button
          onClick={() => onToggleSave(listing.id, isSaved)}
          disabled={savingId === listing.id}
          className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
          title={isSaved ? "Remove from saved" : "Save listing"}
        >
          {savingId === listing.id ? (
            <IconLoader2 className="size-4 animate-spin" />
          ) : isSaved ? (
            <IconBookmarkFilled className="size-4 text-yellow-400" />
          ) : (
            <IconBookmark className="size-4" />
          )}
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <Link
          href={`/listings/${listing.slug ?? listing.id}`}
          className="block truncate text-sm font-semibold leading-tight hover:underline"
        >
          {listing.title}
        </Link>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <IconMapPin className="size-3 shrink-0" />
          <span className="truncate">{listing.area}, {listing.state}</span>
        </p>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <IconBed className="size-3" /> {listing.bedrooms} bed
          </span>
          <span className="flex items-center gap-1">
            <IconBath className="size-3" /> {listing.bathrooms} bath
          </span>
          <span className="ml-auto font-semibold text-foreground">{price}</span>
        </div>
      </div>
    </div>
  )
}

// ── Filter Panel (shared between sidebar + sheet) ─────────────────────────────

function FilterPanel({
  filters,
  onChange,
  onClear,
}: {
  filters: Record<string, string>
  onChange: (key: string, value: string) => void
  onClear: () => void
}) {
  const hasActive = Object.entries(filters).some(
    ([k, v]) => k !== "search" && k !== "page" && v !== "ALL" && v !== ""
  )

  return (
    <div className="space-y-5">
      {hasActive && (
        <Button variant="outline" size="sm" className="w-full" onClick={onClear}>
          <IconX className="size-3.5" />
          Clear filters
        </Button>
      )}

      {/* Type */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Property type
        </Label>
        <Select value={filters.listingType || "ALL"} onValueChange={(v) => onChange("listingType", v)}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LISTING_TYPES.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* State */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          State
        </Label>
        <Select value={filters.state || "ALL"} onValueChange={(v) => onChange("state", v)}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Any state" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Any state</SelectItem>
            {NIGERIAN_STATES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bedrooms */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Bedrooms
        </Label>
        <div className="flex gap-1.5 flex-wrap">
          {BEDROOM_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => onChange("bedrooms", o.value)}
              className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                (filters.bedrooms || "ALL") === o.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:border-primary/50 hover:bg-muted"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Furnished */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Furnished
        </Label>
        <Select value={filters.furnished || "ALL"} onValueChange={(v) => onChange("furnished", v)}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FURNISHED_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Price range */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Max price
        </Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            className="h-9 text-sm"
            value={filters.minPrice || ""}
            onChange={(e) => onChange("minPrice", e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max"
            className="h-9 text-sm"
            value={filters.maxPrice || ""}
            onChange={(e) => onChange("maxPrice", e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function ListingsBrowse({ initialType }: { initialType?: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, _hasHydrated } = useAuth()

  const [data, setData] = useState<BrowseResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [savingId, setSavingId] = useState<string | null>(null)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    listingType: initialType || searchParams.get("type") || "ALL",
    state: searchParams.get("state") || "ALL",
    bedrooms: searchParams.get("bedrooms") || "ALL",
    furnished: searchParams.get("furnished") || "ALL",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  })

  const searchRef = useRef<HTMLInputElement>(null)

  // Load saved IDs for logged-in users
  useEffect(() => {
    if (!_hasHydrated || !user) return
    import("@/lib/api").then(({ fetchData }) =>
      fetchData<{ listing: { id: string } }[]>("/user/saved").then((items) =>
        setSavedIds(new Set(items.map((i) => i.listing.id)))
      ).catch(() => {})
    )
  }, [user, _hasHydrated])

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("page", String(page))
    if (filters.search) params.set("search", filters.search)
    if (filters.listingType !== "ALL") params.set("listingType", filters.listingType)
    if (filters.state !== "ALL") params.set("state", filters.state)
    if (filters.bedrooms !== "ALL") params.set("bedrooms", filters.bedrooms)
    if (filters.furnished !== "ALL") params.set("furnished", filters.furnished)
    if (filters.minPrice) params.set("minPrice", filters.minPrice)
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice)

    publicFetch<BrowseResponse>(`/api/listings/public?${params}`)
      .then(setData)
      .finally(() => setLoading(false))
  }, [filters, page])

  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
  }, [load])

  function handleFilterChange(key: string, value: string) {
    setPage(1)
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function clearFilters() {
    setPage(1)
    setFilters({
      search: "",
      listingType: "ALL",
      state: "ALL",
      bedrooms: "ALL",
      furnished: "ALL",
      minPrice: "",
      maxPrice: "",
    })
  }

  async function handleToggleSave(listingId: string, isSaved: boolean) {
    if (!user) {
      toast.info("Log in to save listings", {
        action: { label: "Login", onClick: () => router.push(`/login?redirect=/listings`) },
      })
      return
    }
    setSavingId(listingId)
    try {
      if (isSaved) {
        await deleteData(`/user/saved/${listingId}`)
        setSavedIds((prev) => { const s = new Set(prev); s.delete(listingId); return s })
        toast.success("Removed from saved")
      } else {
        await postData(`/user/saved/${listingId}`, {})
        setSavedIds((prev) => new Set(prev).add(listingId))
        toast.success("Saved to your list")
      }
    } catch {
      toast.error("Failed to update saved listings")
    } finally {
      setSavingId(null)
    }
  }

  const activeFilterCount = [
    filters.listingType !== "ALL",
    filters.state !== "ALL",
    filters.bedrooms !== "ALL",
    filters.furnished !== "ALL",
    !!filters.minPrice,
    !!filters.maxPrice,
  ].filter(Boolean).length

  return (
    <div className="min-h-screen bg-background">
      {/* Search bar + filter toggle */}
      <div className="border-b bg-card sticky top-20 z-40">
        <div className="container flex items-center gap-3 py-3">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              ref={searchRef}
              placeholder="Search by area, city, or title…"
              className="pl-9"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
          {/* Mobile filter button */}
          <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="shrink-0 lg:hidden relative">
                <IconAdjustmentsHorizontal className="size-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 overflow-y-auto">
              <SheetHeader className="mb-4">
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <FilterPanel
                filters={filters}
                onChange={(k, v) => { handleFilterChange(k, v); }}
                onClear={clearFilters}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="container py-6">
        <div className="flex gap-6">
          {/* Desktop sidebar filters */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-36 rounded-xl border bg-card p-4">
              <p className="mb-4 text-sm font-semibold">Filters</p>
              <FilterPanel filters={filters} onChange={handleFilterChange} onClear={clearFilters} />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Result count */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {loading ? (
                  "Searching…"
                ) : data ? (
                  `${data.total.toLocaleString()} listing${data.total !== 1 ? "s" : ""} found`
                ) : ""}
              </p>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="overflow-hidden rounded-xl border bg-card">
                    <div className="h-48 animate-pulse bg-muted" />
                    <div className="space-y-2 p-4">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !data?.listings.length ? (
              <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border bg-card text-center">
                <IconBuildingSkyscraper className="size-10 text-muted-foreground/40" />
                <div>
                  <p className="font-medium">No listings found</p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your filters or search term.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {data.listings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    isSaved={savedIds.has(listing.id)}
                    onToggleSave={handleToggleSave}
                    savingId={savingId}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {data && data.pages > 1 && (
              <div className="mt-8 flex items-center justify-between text-sm text-muted-foreground">
                <span>Page {data.page} of {data.pages}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page <= 1 || loading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= data.pages || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
