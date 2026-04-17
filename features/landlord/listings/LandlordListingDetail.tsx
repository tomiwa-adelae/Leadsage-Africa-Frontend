"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  IconLoader2,
  IconArrowLeft,
  IconEdit,
  IconBolt,
  IconBed,
  IconBath,
  IconRuler,
  IconMapPin,
  IconEye,
  IconClipboardList,
  IconCalendar,
  IconAlertTriangle,
  IconCircleCheck,
  IconClockHour4,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { fetchData, updateData } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PageHeader } from "@/components/PageHeader"

// ── Types ──────────────────────────────────────────────────────────────────────

interface ListingUser {
  id: string
  firstName: string
  lastName: string
  email: string
  image: string | null
  phoneNumber: string | null
}

interface Application {
  id: string
  status: string
  createdAt: string
  user: ListingUser
}

interface Booking {
  id: string
  status: string
  paymentStatus: string
  checkIn: string
  checkOut: string
  totalPrice: number
  createdAt: string
  user: ListingUser
}

interface ListingDetail {
  id: string
  slug: string | null
  listingType: string
  title: string
  summary: string | null
  description: string
  state: string
  lga: string
  area: string
  address: string
  propertyCategory: string
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
  status: string
  rejectionReason: string | null
  instantBook: boolean
  views: number
  createdAt: string
  applicationCount: number
  bookingCount: number
  recentApplications: Application[]
  recentBookings: Booking[]
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
    day: "numeric",
    month: "short",
    year: "numeric",
  })

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
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
}

const APP_STATUS: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  APPROVED: {
    label: "Approved",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
}

const BOOKING_STATUS: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  CONFIRMED: {
    label: "Confirmed",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 border-red-200",
  },
}

const TYPE_LABELS: Record<string, string> = {
  LONG_TERM: "Long-Term Rental",
  SHORTLET: "Shortlet",
  OFFICE_SPACE: "Office Space",
  HOTEL_ROOM: "Hotel Room",
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function DetailRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  )
}

function PhotoGallery({ photos, title }: { photos: string[]; title: string }) {
  const [idx, setIdx] = useState(0)
  if (photos.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
        No photos uploaded
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="relative h-72 w-full overflow-hidden rounded-xl bg-muted">
        <Image src={photos[idx]} alt={title} fill className="object-cover" />
        {photos.length > 1 && (
          <>
            <button
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
              disabled={idx === 0}
              className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 disabled:opacity-30"
            >
              <IconChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => setIdx((i) => Math.min(photos.length - 1, i + 1))}
              disabled={idx === photos.length - 1}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 disabled:opacity-30"
            >
              <IconChevronRight className="size-4" />
            </button>
            <span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
              {idx + 1} / {photos.length}
            </span>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {photos.map((p, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`relative size-14 shrink-0 overflow-hidden rounded-md border-2 transition-all ${i === idx ? "border-primary" : "border-transparent opacity-60 hover:opacity-90"}`}
            >
              <Image
                src={p}
                alt={`Photo ${i + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function LandlordListingDetail({ id }: { id: string }) {
  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [togglingInstantBook, setTogglingInstantBook] = useState(false)
  const [markingAvailable, setMarkingAvailable] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetchData<ListingDetail>(`/landlord/listings/${id}`)
      .then(setListing)
      .catch(() => toast.error("Failed to load listing"))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function handleToggleInstantBook() {
    if (!listing) return
    setTogglingInstantBook(true)
    try {
      const res = await updateData<{ id: string; instantBook: boolean }>(
        `/landlord/listings/${id}/instant-book`,
        {}
      )
      setListing((prev) =>
        prev ? { ...prev, instantBook: res.instantBook } : prev
      )
      toast.success(
        res.instantBook ? "Instant Book enabled" : "Instant Book disabled"
      )
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update")
    } finally {
      setTogglingInstantBook(false)
    }
  }

  async function handleMarkAvailable() {
    if (!listing) return
    setMarkingAvailable(true)
    try {
      await updateData(`/landlord/listings/${id}/mark-available`, {})
      setListing((prev) => (prev ? { ...prev, status: "PUBLISHED" } : prev))
      toast.success("Listing marked as available")
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update")
    } finally {
      setMarkingAvailable(false)
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

  if (!listing) return null

  const statusCfg = STATUS_CONFIG[listing.status] ?? {
    label: listing.status,
    className: "",
  }
  const isShortlet = ["SHORTLET", "HOTEL_ROOM"].includes(listing.listingType)
  const price = isShortlet
    ? listing.pricePerNight
      ? `${fmt(listing.pricePerNight)}/night`
      : "—"
    : listing.pricePerYear
      ? `${fmt(listing.pricePerYear)}/year`
      : "—"

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          back
          title={
            <>
              {listing.title}{" "}
              <Badge
                variant="outline"
                className={`text-xs ${statusCfg.className}`}
              >
                {statusCfg.label}
              </Badge>
            </>
          }
          description={
            <p className="flex items-center justify-start gap-1">
              <IconMapPin className="size-3.5" />
              {listing.area}, {listing.state}
            </p>
          }
        />

        <div className="flex flex-wrap items-center gap-2">
          {listing.status === "OCCUPIED" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAvailable}
              disabled={markingAvailable}
            >
              {markingAvailable && (
                <IconLoader2 className="size-4 animate-spin" />
              )}
              Mark Available
            </Button>
          )}
          {isShortlet && listing.status === "PUBLISHED" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleInstantBook}
              disabled={togglingInstantBook}
            >
              {togglingInstantBook ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : (
                <IconBolt className="size-4" />
              )}
              {listing.instantBook
                ? "Disable Instant Book"
                : "Enable Instant Book"}
            </Button>
          )}
          <Button size="sm" asChild>
            <Link href={`/landlord/listings/${id}/edit`}>
              <IconEdit className="size-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Rejection banner */}
      {listing.status === "REJECTED" && listing.rejectionReason && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <IconAlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              Listing rejected
            </p>
            <p className="text-sm text-red-700">{listing.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* Pending banner */}
      {listing.status === "PENDING_REVIEW" && (
        <div className="flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3">
          <IconClockHour4 className="mt-0.5 size-4 shrink-0 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            This listing is awaiting admin review. Our team typically reviews
            listings within 24–48 hours.
          </p>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: IconEye,
            label: "Views",
            value: listing.views.toLocaleString(),
          },
          {
            icon: IconClipboardList,
            label: "Applications",
            value: listing.applicationCount,
            href: "/landlord/listings/applications",
          },
          {
            icon: IconCalendar,
            label: "Bookings",
            value: listing.bookingCount,
            href: "/landlord/listings/bookings",
          },
        ].map(({ icon: Icon, label, value, href }) => (
          <Card
            key={label}
            className={
              href ? "cursor-pointer transition-shadow hover:shadow-md" : ""
            }
          >
            {href ? (
              <Link href={href}>
                <CardContent className="flex flex-col items-center justify-center py-4 text-center">
                  <Icon className="mb-1 size-5 text-muted-foreground" />
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </CardContent>
              </Link>
            ) : (
              <CardContent className="flex flex-col items-center justify-center py-4 text-center">
                <Icon className="mb-1 size-5 text-muted-foreground" />
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Left: photos + description */}
        <div className="space-y-4 lg:col-span-3">
          <PhotoGallery photos={listing.photos} title={listing.title} />

          {listing.summary && (
            <Card>
              <CardContent className="text-sm text-muted-foreground">
                {listing.summary}
              </CardContent>
            </Card>
          )}

          {/* Amenities */}
          {listing.amenities.length > 0 && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-sm">Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {listing.amenities.map((a) => (
                    <span
                      key={a}
                      className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs capitalize"
                    >
                      <IconCircleCheck className="size-3 text-emerald-500" />
                      {a.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: details */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-sm">Property Details</CardTitle>
            </CardHeader>
            <CardContent className="divide-y text-sm">
              <DetailRow
                label="Type"
                value={TYPE_LABELS[listing.listingType] ?? listing.listingType}
              />
              <DetailRow
                label="Category"
                value={listing.propertyCategory
                  .replace(/_/g, " ")
                  .toLowerCase()}
              />
              <DetailRow
                label="Size"
                value={
                  <span className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <IconBed className="size-3.5" /> {listing.bedrooms} bed
                    </span>
                    <span className="flex items-center gap-1">
                      <IconBath className="size-3.5" /> {listing.bathrooms} bath
                    </span>
                    {listing.sizeInSqm && (
                      <span className="flex items-center gap-1">
                        <IconRuler className="size-3.5" /> {listing.sizeInSqm}m²
                      </span>
                    )}
                  </span>
                }
              />
              <DetailRow
                label="Furnished"
                value={listing.furnished.replace(/_/g, " ").toLowerCase()}
              />
              <DetailRow label="Price" value={price} />
              {listing.cautionFee && (
                <DetailRow
                  label="Caution fee"
                  value={fmt(listing.cautionFee)}
                />
              )}
              {listing.serviceCharge && (
                <DetailRow
                  label="Service charge"
                  value={fmt(listing.serviceCharge)}
                />
              )}
              {listing.paymentFrequency && (
                <DetailRow
                  label="Payment"
                  value={listing.paymentFrequency
                    .replace(/_/g, " ")
                    .toLowerCase()}
                />
              )}
              {listing.minimumNights && (
                <DetailRow
                  label="Min nights"
                  value={`${listing.minimumNights} nights`}
                />
              )}
              <DetailRow
                label="Available from"
                value={fmtDate(listing.availableFrom)}
              />
              <DetailRow
                label="Pet friendly"
                value={listing.petFriendly ? "Yes" : "No"}
              />
              <DetailRow
                label="Smoking"
                value={listing.smokingAllowed ? "Allowed" : "Not allowed"}
              />
              {isShortlet && (
                <DetailRow
                  label="Instant Book"
                  value={
                    <span
                      className={
                        listing.instantBook
                          ? "text-emerald-600"
                          : "text-muted-foreground"
                      }
                    >
                      {listing.instantBook ? "Enabled" : "Disabled"}
                    </span>
                  }
                />
              )}
              <DetailRow label="Listed" value={fmtDate(listing.createdAt)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-sm">Location</CardTitle>
            </CardHeader>
            <CardContent className="divide-y text-sm">
              <DetailRow label="Address" value={listing.address} />
              <DetailRow label="Area" value={listing.area} />
              <DetailRow label="LGA" value={listing.lga} />
              <DetailRow label="State" value={listing.state} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <CardTitle className="text-sm">Recent Applications</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/landlord/listings/applications">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {listing.recentApplications.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No applications yet
              </p>
            ) : (
              listing.recentApplications.map((app) => {
                const badge = APP_STATUS[app.status] ?? {
                  label: app.status,
                  className: "",
                }
                return (
                  <div
                    key={app.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <Avatar className="size-8 shrink-0">
                      <AvatarFallback className="text-xs">
                        {app.user.firstName[0]}
                        {app.user.lastName[0]}
                      </AvatarFallback>
                      {app.user.image && <AvatarImage src={app.user.image} />}
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {app.user.firstName} {app.user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {fmtDate(app.createdAt)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 text-xs ${badge.className}`}
                    >
                      {badge.label}
                    </Badge>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <CardTitle className="text-sm">Recent Bookings</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/landlord/listings/bookings">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {listing.recentBookings.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No bookings yet
              </p>
            ) : (
              listing.recentBookings.map((booking) => {
                const badge = BOOKING_STATUS[booking.status] ?? {
                  label: booking.status,
                  className: "",
                }
                return (
                  <Link
                    key={booking.id}
                    href={`/landlord/listings/bookings/${booking.id}`}
                  >
                    <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40">
                      <Avatar className="size-8 shrink-0">
                        <AvatarFallback className="text-xs">
                          {booking.user.firstName[0]}
                          {booking.user.lastName[0]}
                        </AvatarFallback>
                        {booking.user.image && (
                          <AvatarImage src={booking.user.image} />
                        )}
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                          {booking.user.firstName} {booking.user.lastName}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <IconCalendar className="size-3" />
                          {fmtDate(booking.checkIn)} —{" "}
                          {fmtDate(booking.checkOut)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold">
                          {fmt(booking.totalPrice)}
                        </p>
                        <Badge
                          variant="outline"
                          className={`mt-0.5 text-[10px] ${badge.className}`}
                        >
                          {badge.label}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
