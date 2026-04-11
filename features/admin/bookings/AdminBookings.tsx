"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  IconLoader2,
  IconSearch,
  IconCalendar,
  IconCurrencyNaira,
  IconUser,
  IconExternalLink,
  IconBan,
  IconCircleCheck,
  IconRefresh,
  IconDownload,
  IconMoon,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { fetchData, updateData, postData } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Card, CardContent } from "@/components/ui/card"
import { BookingSheet } from "./BookingSheet"

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AdminBooking {
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
  adminNote: string | null
  paymentRef: string | null
  confirmedAt: string | null
  cancelledAt: string | null
  cancelReason: string | null
  createdAt: string
  listing: {
    id: string
    slug: string | null
    title: string
    area: string
    state: string
    photos: string[]
    landlordId: string
    landlord: {
      firstName: string
      lastName: string
      email: string
      phoneNumber: string | null
    }
  }
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    image: string | null
    phoneNumber: string | null
  }
}

interface BookingStats {
  total: number
  pending: number
  confirmed: number
  completed: number
  cancelled: number
  rejected: number
  grossRevenue: number
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n)

export const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  CONFIRMED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  REJECTED: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
}

export const PAYMENT_COLORS: Record<string, string> = {
  UNPAID: "bg-zinc-100 text-zinc-600",
  PAID: "bg-emerald-100 text-emerald-700",
  REFUNDED: "bg-blue-100 text-blue-700",
  PARTIALLY_REFUNDED: "bg-amber-100 text-amber-700",
}

function exportCSV(bookings: AdminBooking[]) {
  const headers = [
    "Booking ID",
    "Guest Name",
    "Guest Email",
    "Guest Phone",
    "Listing",
    "Landlord",
    "Check-in",
    "Check-out",
    "Nights",
    "Total (₦)",
    "Status",
    "Payment",
    "Payment Ref",
    "Booked At",
  ]

  const rows = bookings.map((b) => [
    b.id,
    `${b.user.firstName} ${b.user.lastName}`,
    b.user.email,
    b.user.phoneNumber ?? "",
    b.listing.title,
    `${b.listing.landlord.firstName} ${b.listing.landlord.lastName}`,
    new Date(b.checkIn).toLocaleDateString("en-NG"),
    new Date(b.checkOut).toLocaleDateString("en-NG"),
    b.nights,
    b.totalPrice,
    b.status,
    b.paymentStatus,
    b.paymentRef ?? "",
    new Date(b.createdAt).toLocaleString("en-NG"),
  ])

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n")

  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `leadsage-bookings-${new Date().toISOString().split("T")[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Stats Bar ──────────────────────────────────────────────────────────────────

function StatsBar({ stats }: { stats: BookingStats }) {
  const items = [
    { label: "Total", value: stats.total, color: "text-foreground" },
    { label: "Pending", value: stats.pending, color: "text-amber-600" },
    { label: "Confirmed", value: stats.confirmed, color: "text-emerald-600" },
    { label: "Completed", value: stats.completed, color: "text-blue-600" },
    { label: "Cancelled", value: stats.cancelled, color: "text-red-500" },
    { label: "Rejected", value: stats.rejected, color: "text-zinc-500" },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-7">
      {items.map(({ label, value, color }) => (
        <Card key={label} className="shadow-none">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </CardContent>
        </Card>
      ))}
      <Card className="shadow-none lg:col-span-1">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Gross Revenue</p>
          <p className="text-lg font-bold text-emerald-600">
            {fmt(stats.grossRevenue)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function AdminBookings() {
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [stats, setStats] = useState<BookingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [paymentFilter, setPaymentFilter] = useState("ALL")

  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(
    null
  )

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "ALL") params.set("status", statusFilter)
      if (paymentFilter !== "ALL") params.set("paymentStatus", paymentFilter)
      if (search) params.set("search", search)
      params.set("page", String(page))
      params.set("limit", "20")

      const data = await fetchData<{
        bookings: AdminBooking[]
        total: number
        page: number
        pages: number
      }>(`/admin/bookings?${params}`)

      setBookings(data.bookings)
      setTotal(data.total)
      setPage(data.page)
      setPages(data.pages)
    } catch {
      toast.error("Failed to load bookings")
    } finally {
      setLoading(false)
    }
  }, [statusFilter, paymentFilter, search, page])

  useEffect(() => {
    fetchData<BookingStats>("/admin/bookings/stats")
      .then(setStats)
      .catch(() => {})
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Sync search with debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  function handleBookingUpdated(updated: AdminBooking) {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
    setSelectedBooking(updated)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          back
          title="Bookings"
          description="All shortlet and hotel bookings across the platform"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportCSV(bookings)}
          disabled={bookings.length === 0}
        >
          <IconDownload className="size-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      {stats && <StatsBar stats={stats} />}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-64">
          <IconSearch className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search guest, listing…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8 text-sm"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="h-9 w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={paymentFilter}
          onValueChange={(v) => {
            setPaymentFilter(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="h-9 w-44">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All payments</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="UNPAID">Unpaid</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
            <SelectItem value="PARTIALLY_REFUNDED">Partial refund</SelectItem>
          </SelectContent>
        </Select>

        <span className="ml-auto text-xs text-muted-foreground">
          {total} booking{total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Guest</TableHead>
              <TableHead>Listing</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <IconLoader2 className="size-4 animate-spin" />
                    Loading…
                  </div>
                </TableCell>
              </TableRow>
            ) : bookings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-40 text-center text-sm text-muted-foreground"
                >
                  No bookings found.
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((b) => {
                const guestName = `${b.user.firstName} ${b.user.lastName}`
                const initials =
                  `${b.user.firstName?.[0] ?? ""}${b.user.lastName?.[0] ?? ""}`.toUpperCase()
                const photo = b.listing.photos[0]

                return (
                  <TableRow
                    key={b.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedBooking(b)}
                  >
                    {/* Guest */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-8">
                          <AvatarImage src={b.user.image ?? undefined} />
                          <AvatarFallback className="text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {guestName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {b.user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Listing */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="relative hidden size-9 flex-shrink-0 overflow-hidden rounded sm:block">
                          {photo ? (
                            <Image
                              src={photo}
                              alt={b.listing.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center bg-muted text-[10px] text-muted-foreground">
                              No img
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-[160px] truncate text-sm font-medium">
                            {b.listing.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {b.listing.area}, {b.listing.state}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Dates */}
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <IconCalendar className="size-3.5 shrink-0" />
                        <span>
                          {new Date(b.checkIn).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                          })}
                          {" → "}
                          {new Date(b.checkOut).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <IconMoon className="size-3.5" />
                        {b.nights}n
                      </p>
                    </TableCell>

                    {/* Amount */}
                    <TableCell>
                      <span className="text-sm font-semibold">
                        {fmt(b.totalPrice)}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[b.status] ?? ""}`}
                      >
                        {b.status}
                      </span>
                    </TableCell>

                    {/* Payment */}
                    <TableCell>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${PAYMENT_COLORS[b.paymentStatus] ?? ""}`}
                      >
                        {b.paymentStatus.replace("_", " ")}
                      </span>
                    </TableCell>

                    {/* Detail link */}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Link
                        href={`/admin/bookings/${b.id}`}
                        className="flex items-center justify-center rounded p-1 text-muted-foreground hover:text-foreground"
                        title="Full details"
                      >
                        <IconExternalLink className="size-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {page} of {pages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              <IconChevronLeft className="size-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages || loading}
            >
              Next
              <IconChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Side sheet */}
      {selectedBooking && (
        <BookingSheet
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdated={handleBookingUpdated}
        />
      )}
    </div>
  )
}
