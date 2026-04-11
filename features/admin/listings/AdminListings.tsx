"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  IconLoader2,
  IconSearch,
  IconHome,
  IconMapPin,
  IconCurrencyNaira,
  IconFilter,
  IconCircleCheck,
  IconX,
  IconClock,
  IconArchive,
  IconEye,
  IconDots,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { fetchData, updateData } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

// ── Types ──────────────────────────────────────────────────────────────────────

interface AdminListing {
  id: string
  slug: string | null
  title: string
  listingType: string
  status: string
  state: string
  area: string
  pricePerYear: number | null
  pricePerNight: number | null
  photos: string[]
  views: number
  createdAt: string
  landlord: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

interface ListingsResponse {
  listings: AdminListing[]
  total: number
  page: number
  pages: number
}

// ── Constants ──────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  { value: "PENDING_REVIEW", label: "Pending review" },
  { value: "PUBLISHED", label: "Published" },
  { value: "REJECTED", label: "Rejected" },
  { value: "DRAFT", label: "Draft" },
  { value: "ARCHIVED", label: "Archived" },
]

const TYPE_OPTIONS = [
  { value: "ALL", label: "All types" },
  { value: "LONG_TERM", label: "Long-term" },
  { value: "SHORTLET", label: "Shortlet" },
  { value: "OFFICE_SPACE", label: "Office Space" },
  { value: "HOTEL_ROOM", label: "Hotel Room" },
]

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
    label: "Pending",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  DRAFT: {
    label: "Draft",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  ARCHIVED: {
    label: "Archived",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
}

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

// ── Component ──────────────────────────────────────────────────────────────────

export function AdminListings() {
  const [data, setData] = useState<ListingsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [page, setPage] = useState(1)

  // Approve/reject state
  const [actionId, setActionId] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<AdminListing | null>(null)
  const [presetReason, setPresetReason] = useState("")
  const [customReason, setCustomReason] = useState("")
  const [rejecting, setRejecting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("page", String(page))
    params.set("limit", "15")
    if (search) params.set("search", search)
    if (statusFilter !== "ALL") params.set("status", statusFilter)
    if (typeFilter !== "ALL") params.set("listingType", typeFilter)

    fetchData<ListingsResponse>(`/admin/listings?${params}`)
      .then(setData)
      .catch(() => setError("Failed to load listings."))
      .finally(() => setLoading(false))
  }, [search, statusFilter, typeFilter, page])

  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
  }, [load])

  async function handleApprove(id: string) {
    setActionId(id)
    try {
      await updateData(`/admin/listings/${id}/approve`, {})
      toast.success("Listing approved and published.")
      load()
    } catch {
      toast.error("Failed to approve listing.")
    } finally {
      setActionId(null)
    }
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
      toast.success("Listing rejected and landlord notified.")
      setRejectTarget(null)
      load()
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
        title="All Listings"
        description={
          data ? `${data.total.toLocaleString()} total listings` : ""
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-52 flex-1">
          <IconSearch className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search title, area, address…"
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={typeFilter}
          onValueChange={(v) => {
            setTypeFilter(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Listing</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Landlord</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Date</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-40 text-center">
                  <IconLoader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-40 text-center text-sm text-destructive"
                >
                  {error}
                </TableCell>
              </TableRow>
            ) : !data?.listings.length ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-40 text-center text-sm text-muted-foreground"
                >
                  No listings found
                </TableCell>
              </TableRow>
            ) : (
              data.listings.map((l) => {
                const badge = STATUS_BADGE[l.status] ?? {
                  label: l.status,
                  className: "",
                }
                const price = l.pricePerNight
                  ? `${fmt(l.pricePerNight)}/night`
                  : l.pricePerYear
                    ? `${fmt(l.pricePerYear)}/yr`
                    : "—"
                return (
                  <TableRow key={l.id}>
                    <TableCell className="max-w-52">
                      <Link
                        href={`/admin/listings/${l.slug ?? l.id}`}
                        className="truncate text-sm font-medium hover:underline"
                      >
                        {l.title}
                      </Link>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <IconMapPin className="size-3" />
                        {l.area}, {l.state}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {TYPE_LABELS[l.listingType] ?? l.listingType}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${badge.className}`}
                      >
                        {badge.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <p className="font-medium">
                        {l.landlord.firstName} {l.landlord.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {l.landlord.email}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm">{price}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {l.views.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {new Date(l.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={actionId === l.id}
                          >
                            {actionId === l.id ? (
                              <IconLoader2 className="size-4 animate-spin" />
                            ) : (
                              <IconDots className="size-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {l.status === "PENDING_REVIEW" && (
                            <>
                              <DropdownMenuItem
                                className="text-green-600 focus:text-green-600"
                                onClick={() => handleApprove(l.id)}
                              >
                                <IconCircleCheck className="size-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => {
                                  setRejectTarget(l)
                                  setPresetReason("")
                                  setCustomReason("")
                                }}
                              >
                                <IconX className="size-4" />
                                Reject
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {l.status === "REJECTED" && (
                            <>
                              <DropdownMenuItem
                                className="text-green-600 focus:text-green-600"
                                onClick={() => handleApprove(l.id)}
                              >
                                <IconCircleCheck className="size-4" />
                                Approve anyway
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem asChild>
                            <a
                              href={`/landlord/listings/${l.id}`}
                              target="_blank"
                              rel="noopener"
                            >
                              <IconEye className="size-4" />
                              View listing
                            </a>
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

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {data.page} of {data.pages} ({data.total} total)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= data.pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Reject dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={() => setRejectTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject listing</DialogTitle>
            <DialogDescription>
              The landlord will receive an email with the reason below.
            </DialogDescription>
          </DialogHeader>
          {rejectTarget && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
                <p className="font-medium">{rejectTarget.title}</p>
                <p className="text-xs text-muted-foreground">
                  {rejectTarget.area}, {rejectTarget.state}
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
              Reject & notify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
