"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  IconPlus,
  IconSearch,
  IconDots,
  IconEdit,
  IconEye,
  IconArchive,
  IconTrash,
  IconAlertTriangle,
  IconClockHour4,
  IconX,
  IconLoader2,
  IconBolt,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { deleteData, updateData } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/PageHeader"
import { useLandlordListings } from "../hooks/useLandlordListings"
import {
  BackendListingStatus,
  BackendListingType,
  LandlordListing,
} from "../types/listing"

// ── Display helpers ────────────────────────────────────────────────────────────

const statusConfig: Record<
  BackendListingStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className: "bg-muted text-muted-foreground border-transparent",
  },
  PENDING_REVIEW: {
    label: "Pending Review",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  PUBLISHED: {
    label: "Published",
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
    className: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
  },
}

const typeLabels: Record<BackendListingType, string> = {
  LONG_TERM: "Long-term",
  SHORTLET: "Shortlet",
  OFFICE_SPACE: "Office Space",
  HOTEL_ROOM: "Hotel Room",
}

const tabFilters: { label: string; value: BackendListingStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Occupied", value: "OCCUPIED" },
  { label: "Draft", value: "DRAFT" },
  { label: "Pending Review", value: "PENDING_REVIEW" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Archived", value: "ARCHIVED" },
]

function getPrice(listing: LandlordListing): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(n)

  if (listing.listingType === "SHORTLET" || listing.listingType === "HOTEL_ROOM") {
    return listing.pricePerNight ? `${fmt(listing.pricePerNight)}/night` : "—"
  }
  return listing.pricePerYear ? `${fmt(listing.pricePerYear)}/year` : "—"
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

// ── Component ──────────────────────────────────────────────────────────────────

export function ListingsTable() {
  const { listings, loading, error, setListings } = useLandlordListings()
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<BackendListingStatus | "ALL">("ALL")
  const [dismissedBanners, setDismissedBanners] = useState<BackendListingStatus[]>([])
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [markingAvailableId, setMarkingAvailableId] = useState<string | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [actioning, setActioning] = useState(false)

  async function handleMarkAvailable(listingId: string) {
    setMarkingAvailableId(listingId)
    try {
      await updateData(`/landlord/listings/${listingId}/mark-available`, {})
      setListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, status: "PUBLISHED" as const } : l))
      )
      toast.success("Listing marked as available and re-published")
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update listing")
    } finally {
      setMarkingAvailableId(null)
    }
  }

  async function handleToggleInstantBook(listingId: string) {
    setTogglingId(listingId)
    try {
      const res = await updateData<{ id: string; instantBook: boolean }>(
        `/landlord/listings/${listingId}/instant-book`,
        {}
      )
      setListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, instantBook: res.instantBook } : l))
      )
      toast.success(
        res.instantBook ? "Instant Book enabled" : "Instant Book disabled"
      )
    } catch (err: any) {
      const msg = err?.response?.data?.message
      toast.error(typeof msg === "string" ? msg : "Failed to update setting")
    } finally {
      setTogglingId(null)
    }
  }

  async function handleArchive() {
    if (!archiveTarget) return
    setActioning(true)
    try {
      await updateData(`/listings/${archiveTarget}/archive`, {})
      setListings((prev) =>
        prev.map((l) =>
          l.id === archiveTarget ? { ...l, status: "ARCHIVED" as const } : l
        )
      )
      toast.success("Listing archived")
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to archive listing")
    } finally {
      setActioning(false)
      setArchiveTarget(null)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setActioning(true)
    try {
      await deleteData(`/listings/${deleteTarget}`)
      setListings((prev) => prev.filter((l) => l.id !== deleteTarget))
      toast.success("Listing deleted")
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to delete listing")
    } finally {
      setActioning(false)
      setDeleteTarget(null)
    }
  }

  const pendingCount = listings.filter((l) => l.status === "PENDING_REVIEW").length
  const rejectedCount = listings.filter((l) => l.status === "REJECTED").length

  const filtered = listings.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.area.toLowerCase().includes(search.toLowerCase())
    const matchesTab = activeTab === "ALL" || l.status === activeTab
    return matchesSearch && matchesTab
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          back
          title="My Listings"
          description="Manage all your property listings"
        />
        <Button asChild>
          <Link href="/landlord/listings/new">
            <IconPlus className="size-4" />
            Add Listing
          </Link>
        </Button>
      </div>

      {/* Pending review banner */}
      {pendingCount > 0 && !dismissedBanners.includes("PENDING_REVIEW") && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3">
          <div className="flex items-start gap-3">
            <IconClockHour4 className="mt-0.5 size-4 flex-shrink-0 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                {pendingCount === 1
                  ? "1 listing is awaiting admin review"
                  : `${pendingCount} listings are awaiting admin review`}
              </p>
              <p className="mt-0.5 text-xs text-yellow-700">
                Our team reviews new listings within 24–48 hours. You&apos;ll
                be notified by email once approved.
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              setDismissedBanners((prev) => [...prev, "PENDING_REVIEW"])
            }
            className="flex-shrink-0 text-yellow-500 hover:text-yellow-700"
            aria-label="Dismiss"
          >
            <IconX className="size-4" />
          </button>
        </div>
      )}

      {/* Rejected banner */}
      {rejectedCount > 0 && !dismissedBanners.includes("REJECTED") && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex items-start gap-3">
            <IconAlertTriangle className="mt-0.5 size-4 flex-shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-800">
                {rejectedCount === 1
                  ? "1 listing was rejected"
                  : `${rejectedCount} listings were rejected`}{" "}
                and need your attention
              </p>
              <p className="mt-0.5 text-xs text-red-700">
                Review the rejection reason, update the listing, and resubmit
                for approval.
              </p>
              <button
                onClick={() => setActiveTab("REJECTED")}
                className="mt-1 text-xs font-medium text-red-700 underline underline-offset-2 hover:text-red-900"
              >
                View rejected listings
              </button>
            </div>
          </div>
          <button
            onClick={() =>
              setDismissedBanners((prev) => [...prev, "REJECTED"])
            }
            className="flex-shrink-0 text-red-400 hover:text-red-600"
            aria-label="Dismiss"
          >
            <IconX className="size-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={activeTab}
          onValueChange={(v) =>
            setActiveTab(v as BackendListingStatus | "ALL")
          }
        >
          <TabsList className="h-9">
            {tabFilters.map(({ label, value }) => (
              <TabsTrigger key={value} value={value} className="px-3 text-xs">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-64">
          <IconSearch className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-8 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[320px]">Property</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <IconLoader2 className="size-4 animate-spin" />
                    <span className="text-sm">Loading listings…</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-sm text-destructive"
                >
                  {error}
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground"
                >
                  {listings.length === 0
                    ? "You haven't added any listings yet."
                    : "No listings match your search."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((listing) => {
                const { label, className } = statusConfig[listing.status]
                return (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                          {listing.photos[0] ? (
                            <Image
                              src={listing.photos[0]}
                              alt={listing.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                              No img
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-[200px] truncate text-sm font-medium">
                            {listing.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {listing.area}, {listing.state}
                          </p>
                          {listing.status === "REJECTED" && (
                            <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-red-600">
                              <IconAlertTriangle className="size-3" />
                              Needs attention
                            </p>
                          )}
                          {listing.status === "PENDING_REVIEW" && (
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-yellow-600">
                              <IconClockHour4 className="size-3" />
                              Under review
                            </p>
                          )}
                          {listing.status === "OCCUPIED" && (
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                              Currently occupied
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {typeLabels[listing.listingType]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {getPrice(listing)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("text-xs", className)}
                      >
                        {label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {listing.views.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(listing.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                          >
                            <IconDots className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <Link href={`/landlord/listings/${listing.id}`}>
                              <IconEye className="size-4" /> View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/landlord/listings/${listing.id}/edit`}
                            >
                              <IconEdit className="size-4" /> Edit
                            </Link>
                          </DropdownMenuItem>
                          {["SHORTLET", "HOTEL_ROOM"].includes(listing.listingType) &&
                            listing.status === "PUBLISHED" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleToggleInstantBook(listing.id)
                                  }
                                  disabled={togglingId === listing.id}
                                >
                                  {togglingId === listing.id ? (
                                    <IconLoader2 className="size-4 animate-spin" />
                                  ) : (
                                    <IconBolt className="size-4" />
                                  )}
                                  {listing.instantBook
                                    ? "Disable Instant Book"
                                    : "Enable Instant Book"}
                                </DropdownMenuItem>
                              </>
                            )}
                          {listing.status === "OCCUPIED" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleMarkAvailable(listing.id)}
                                disabled={markingAvailableId === listing.id}
                              >
                                {markingAvailableId === listing.id ? (
                                  <IconLoader2 className="size-4 animate-spin" />
                                ) : (
                                  <IconBolt className="size-4" />
                                )}
                                Mark as Available
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          {listing.status !== "ARCHIVED" && (
                            <DropdownMenuItem
                              onClick={() => setArchiveTarget(listing.id)}
                            >
                              <IconArchive className="size-4" /> Archive
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteTarget(listing.id)}
                          >
                            <IconTrash className="size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && !error && (
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {listings.length} listings
        </p>
      )}

      {/* Archive confirmation */}
      <AlertDialog
        open={!!archiveTarget}
        onOpenChange={(open) => !open && setArchiveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this listing?</AlertDialogTitle>
            <AlertDialogDescription>
              The listing will be hidden from renters and marked as archived. You
              can contact support to restore it if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actioning}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive} disabled={actioning}>
              {actioning && <IconLoader2 className="size-4 animate-spin" />}
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the listing. Any active bookings or
              applications linked to it will remain, but the listing will no
              longer be visible. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actioning}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={actioning}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actioning && <IconLoader2 className="size-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
