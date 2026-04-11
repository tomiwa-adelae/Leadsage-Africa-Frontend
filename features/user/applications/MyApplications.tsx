"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  IconLoader2,
  IconClipboardList,
  IconMapPin,
  IconCalendar,
  IconCurrencyNaira,
  IconUser,
  IconPhone,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { deleteData, fetchData } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ── Types ──────────────────────────────────────────────────────────────────────

interface Application {
  id: string
  status: string
  message: string | null
  moveInDate: string | null
  landlordNote: string | null
  reviewedAt: string | null
  createdAt: string
  listing: {
    id: string
    slug: string | null
    title: string
    listingType: string
    state: string
    area: string
    photos: string[]
    pricePerYear: number | null
    landlord: {
      firstName: string
      lastName: string
      image: string | null
      phoneNumber: string | null
    }
  }
}

// ── Constants ──────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "WITHDRAWN", label: "Withdrawn" },
]

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

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n)

// ── Component ──────────────────────────────────────────────────────────────────

export function MyApplications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [withdrawTarget, setWithdrawTarget] = useState<string | null>(null)
  const [withdrawing, setWithdrawing] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetchData<Application[]>("/user/applications")
      .then(setApplications)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered =
    statusFilter === "ALL"
      ? applications
      : applications.filter((a) => a.status === statusFilter)

  async function handleWithdraw() {
    if (!withdrawTarget) return
    setWithdrawing(true)
    try {
      await deleteData(`/user/applications/${withdrawTarget}`)
      setApplications((prev) =>
        prev.map((a) =>
          a.id === withdrawTarget ? { ...a, status: "WITHDRAWN" } : a
        )
      )
      toast.success("Application withdrawn")
    } catch {
      toast.error("Failed to withdraw application")
    } finally {
      setWithdrawing(false)
      setWithdrawTarget(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          back
          title="My Applications"
          description={
            loading
              ? "Loading…"
              : `${applications.length} application${applications.length !== 1 ? "s" : ""}`
          }
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
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
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
          <IconLoader2 className="size-5 animate-spin" />
          Loading applications…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border bg-card text-center">
          <IconClipboardList className="size-10 text-muted-foreground/40" />
          <div>
            <p className="font-medium">
              {statusFilter === "ALL"
                ? "No applications yet"
                : `No ${APP_STATUS[statusFilter]?.label ?? statusFilter} applications`}
            </p>
            {statusFilter === "ALL" && (
              <p className="text-sm text-muted-foreground">
                Apply for a rental to track it here.
              </p>
            )}
          </div>
          {statusFilter === "ALL" && (
            <Button asChild size="sm">
              <Link href="/">Browse listings</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => {
            const badge = APP_STATUS[app.status] ?? {
              label: app.status,
              className: "",
            }
            const canWithdraw = ["PENDING", "UNDER_REVIEW"].includes(app.status)
            const landlord = app.listing.landlord

            return (
              <div
                key={app.id}
                className="overflow-hidden rounded-xl border bg-card"
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row">
                  {/* Photo */}
                  <div className="relative h-36 w-full flex-shrink-0 overflow-hidden rounded-lg bg-muted sm:h-28 sm:w-40">
                    {app.listing.photos[0] ? (
                      <Image
                        src={app.listing.photos[0]}
                        alt={app.listing.title}
                        fill
                        className="object-cover"
                      />
                    ) : null}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <Link
                            href={`/listings/${app.listing.slug ?? app.listing.id}`}
                            className="font-semibold hover:underline"
                          >
                            {app.listing.title}
                          </Link>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <IconMapPin className="size-3" />
                            {app.listing.area}, {app.listing.state}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${badge.className}`}
                        >
                          {badge.label}
                        </Badge>
                      </div>

                      {app.listing.pricePerYear && (
                        <p className="mt-1 text-sm font-semibold">
                          {fmt(app.listing.pricePerYear)}/year
                        </p>
                      )}

                      {app.moveInDate && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <IconCalendar className="size-3" />
                          Move-in:{" "}
                          {new Date(app.moveInDate).toLocaleDateString(
                            "en-NG",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                      )}
                    </div>

                    {/* Landlord info + actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <IconUser className="size-3.5" />
                        <span>
                          {landlord.firstName} {landlord.lastName}
                        </span>
                        {landlord.phoneNumber && (
                          <>
                            <span>·</span>
                            <a
                              href={`tel:${landlord.phoneNumber}`}
                              className="flex items-center gap-1 hover:text-foreground"
                            >
                              <IconPhone className="size-3" />
                              {landlord.phoneNumber}
                            </a>
                          </>
                        )}
                      </div>
                      {canWithdraw && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => setWithdrawTarget(app.id)}
                        >
                          Withdraw
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Landlord response note */}
                {app.landlordNote && (
                  <div
                    className={`border-t px-4 py-3 text-sm ${
                      app.status === "APPROVED"
                        ? "bg-green-50 text-green-800"
                        : app.status === "REJECTED"
                          ? "bg-red-50 text-red-800"
                          : "bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <span className="font-medium">Landlord note: </span>
                    {app.landlordNote}
                  </div>
                )}

                {/* Applied date */}
                <div className="border-t px-4 py-2 text-xs text-muted-foreground">
                  Applied{" "}
                  {new Date(app.createdAt).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Withdraw confirmation */}
      <AlertDialog
        open={!!withdrawTarget}
        onOpenChange={() => setWithdrawTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw application?</AlertDialogTitle>
            <AlertDialogDescription>
              This will withdraw your rental application. The landlord will no
              longer be able to review it. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={withdrawing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWithdraw}
              disabled={withdrawing}
              className="bg-red-600 hover:bg-red-700"
            >
              {withdrawing ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : null}
              Withdraw
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
