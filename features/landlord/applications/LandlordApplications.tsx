"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  IconLoader2,
  IconCalendar,
  IconMapPin,
  IconCheck,
  IconX,
  IconEye,
  IconPhone,
  IconCurrencyNaira,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { fetchData, updateData } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
    state: string
    area: string
    photos: string[]
    pricePerYear: number | null
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

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n)

const STATUS_COLORS: Record<string, string> = {
  PENDING:      "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  UNDER_REVIEW: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  APPROVED:     "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  REJECTED:     "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  WITHDRAWN:    "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400",
}

// ── Respond Dialog ─────────────────────────────────────────────────────────────

type RespondAction = "approve" | "reject"

function RespondDialog({
  application,
  action,
  onClose,
  onSuccess,
}: {
  application: Application
  action: RespondAction
  onClose: () => void
  onSuccess: () => void
}) {
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    try {
      await updateData(`/landlord/applications/${application.id}/${action}`, {
        note: note.trim() || undefined,
      })
      toast.success(action === "approve" ? "Application approved!" : "Application rejected.")
      onSuccess()
      onClose()
    } catch (err: any) {
      const msg = err?.response?.data?.message
      toast.error(typeof msg === "string" ? msg : "Action failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {action === "approve" ? "Approve application" : "Reject application"}
          </DialogTitle>
          <DialogDescription>
            {action === "approve"
              ? "The applicant will be notified and you can reach out to finalize the lease."
              : "The applicant will be informed that they were not successful."}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
          <p className="font-medium">{application.listing.title}</p>
          <p className="text-xs text-muted-foreground">
            {application.user.firstName} {application.user.lastName} ·{" "}
            {application.user.email}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label>
            Note to applicant{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            placeholder={
              action === "approve"
                ? "E.g. Welcome! Please contact us at 0800-xxx to arrange viewing…"
                : "E.g. We've already filled this position, but keep an eye out for new listings…"
            }
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            variant={action === "reject" ? "destructive" : "default"}
          >
            {loading && <IconLoader2 className="size-4 animate-spin" />}
            {action === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Application Card ───────────────────────────────────────────────────────────

function ApplicationCard({
  application,
  onRefresh,
}: {
  application: Application
  onRefresh: () => void
}) {
  const [action, setAction] = useState<RespondAction | null>(null)
  const [markingReview, setMarkingReview] = useState(false)

  const applicant = application.user
  const initials =
    `${applicant.firstName?.[0] ?? ""}${applicant.lastName?.[0] ?? ""}`.toUpperCase()
  const photo = application.listing.photos[0]
  const canAct = ["PENDING", "UNDER_REVIEW"].includes(application.status)
  const isPending = application.status === "PENDING"

  async function handleMarkReview() {
    setMarkingReview(true)
    try {
      await updateData(`/landlord/applications/${application.id}/review`, {})
      toast.success("Marked as under review")
      onRefresh()
    } catch {
      toast.error("Failed to update status")
    } finally {
      setMarkingReview(false)
    }
  }

  return (
    <>
      <div className="rounded-xl border bg-card shadow-xs">
        <div className="flex gap-4 p-4">
          {/* Listing thumbnail */}
          <div className="relative hidden size-20 flex-shrink-0 overflow-hidden rounded-lg sm:block">
            {photo ? (
              <Image src={photo} alt={application.listing.title} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted text-xs text-muted-foreground">
                No photo
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            {/* Top row */}
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <Link
                  href={`/listings/${application.listing.slug ?? application.listing.id}`}
                  className="font-semibold hover:underline"
                >
                  {application.listing.title}
                </Link>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <IconMapPin className="size-3.5" />
                  {application.listing.area}, {application.listing.state}
                  {application.listing.pricePerYear && (
                    <span className="ml-2 font-medium text-foreground">
                      {fmt(application.listing.pricePerYear)}/yr
                    </span>
                  )}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[application.status] ?? ""}`}
              >
                {application.status.replace("_", " ")}
              </span>
            </div>

            {/* Applicant */}
            <div className="flex items-center gap-2">
              <Avatar className="size-7">
                <AvatarImage src={applicant.image ?? undefined} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-none">
                  {applicant.firstName} {applicant.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{applicant.email}</p>
              </div>
              {applicant.phoneNumber && (
                <a
                  href={`tel:${applicant.phoneNumber}`}
                  className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <IconPhone className="size-3.5" />
                  {applicant.phoneNumber}
                </a>
              )}
            </div>

            {/* Move-in date + message */}
            <div className="space-y-1 text-sm">
              {application.moveInDate && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <IconCalendar className="size-3.5" />
                  Move-in:{" "}
                  {new Date(application.moveInDate).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
              {application.message && (
                <p className="rounded bg-muted px-2.5 py-1.5 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Message:</span>{" "}
                  {application.message}
                </p>
              )}
              {application.landlordNote && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Your note:</span>{" "}
                  {application.landlordNote}
                </p>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Applied{" "}
              {new Date(application.createdAt).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Actions */}
        {canAct && (
          <div className="flex justify-end gap-2 border-t px-4 py-3">
            {isPending && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleMarkReview}
                disabled={markingReview}
              >
                {markingReview ? (
                  <IconLoader2 className="size-4 animate-spin" />
                ) : (
                  <IconEye className="size-4" />
                )}
                Mark as reviewing
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => setAction("reject")}
            >
              <IconX className="size-4" />
              Reject
            </Button>
            <Button size="sm" onClick={() => setAction("approve")}>
              <IconCheck className="size-4" />
              Approve
            </Button>
          </div>
        )}
      </div>

      {action && (
        <RespondDialog
          application={application}
          action={action}
          onClose={() => setAction(null)}
          onSuccess={onRefresh}
        />
      )}
    </>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function LandlordApplications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("ALL")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = statusFilter !== "ALL" ? `?status=${statusFilter}` : ""
      const data = await fetchData<Application[]>(`/landlord/applications${params}`)
      setApplications(data)
    } catch {
      toast.error("Failed to load applications")
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { load() }, [load])

  const pendingCount = applications.filter((a) => a.status === "PENDING").length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications"
        description="Rental applications across your long-term listings"
      />

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="UNDER_REVIEW">Under review</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {applications.length} application{applications.length !== 1 ? "s" : ""}
          {pendingCount > 0 && (
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              {pendingCount} pending
            </span>
          )}
        </span>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center gap-2 text-muted-foreground">
          <IconLoader2 className="size-5 animate-spin" />
          Loading…
        </div>
      ) : applications.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm text-muted-foreground">No applications found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((a) => (
            <ApplicationCard key={a.id} application={a} onRefresh={load} />
          ))}
        </div>
      )}
    </div>
  )
}
