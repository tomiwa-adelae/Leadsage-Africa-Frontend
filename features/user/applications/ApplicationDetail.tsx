"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  IconLoader2,
  IconMapPin,
  IconCalendar,
  IconBriefcase,
  IconUsers,
  IconCircleCheck,
  IconClockHour4,
  IconCircleX,
  IconFileText,
  IconCurrencyNaira,
  IconArrowRight,
  IconUser,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { fetchData } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// ── Types ──────────────────────────────────────────────────────────────────────

interface Application {
  id: string
  status: string
  adminStatus: string | null
  screeningSubmittedAt: string | null
  moveInDate: string | null
  tenancyMonths: number | null
  reasonForMoving: string | null
  message: string | null
  nin: string | null
  ninVerified: boolean
  employmentStatus: string | null
  employer: string | null
  jobTitle: string | null
  monthlyIncome: number | null
  ref1Name: string | null
  ref1Phone: string | null
  ref1Relation: string | null
  ref2Name: string | null
  ref2Phone: string | null
  ref2Relation: string | null
  landlordNote: string | null
  adminNote: string | null
  createdAt: string
  listing: {
    id: string
    slug: string | null
    title: string
    area: string
    state: string
    address: string
    photos: string[]
    pricePerYear: number | null
    paymentFrequency: string | null
    cautionFee: number | null
    landlord: {
      firstName: string
      lastName: string
      image: string | null
      phoneNumber: string | null
    }
  }
  tourRequest: {
    id: string
    status: string
    scheduledAt: string | null
  } | null
  agreement: {
    id: string
    status: string
    startDate: string
    endDate: string
    monthlyRent: number
    cautionFee: number | null
    tenantSignedAt: string | null
    landlordSignedAt: string | null
  } | null
  payments: {
    id: string
    amount: number
    dueDate: string
    installmentNo: number | null
    totalInstallments: number | null
    status: string
    paidAt: string | null
  }[]
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending Review", className: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" },
  UNDER_REVIEW: { label: "Under Review", className: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" },
  APPROVED: { label: "Approved", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400" },
  WITHDRAWN: { label: "Withdrawn", className: "bg-muted text-muted-foreground" },
}

const AGREEMENT_STATUS: Record<string, { label: string; className: string }> = {
  PENDING_TENANT: { label: "Awaiting your signature", className: "text-amber-600" },
  PENDING_LANDLORD: { label: "Awaiting landlord signature", className: "text-blue-600" },
  FULLY_SIGNED: { label: "Fully signed", className: "text-emerald-600" },
  CANCELLED: { label: "Cancelled", className: "text-muted-foreground" },
}

const PAYMENT_STATUS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "text-amber-600" },
  PAID: { label: "Paid", className: "text-emerald-600" },
  OVERDUE: { label: "Overdue", className: "text-red-600" },
  WAIVED: { label: "Waived", className: "text-muted-foreground" },
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n)

// ── Main Component ─────────────────────────────────────────────────────────────

export function ApplicationDetail({ id }: { id: string }) {
  const [app, setApp] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [showScreening, setShowScreening] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchData<Application>(`/user/applications/${id}`)
      setApp(data)
    } catch {
      toast.error("Failed to load application")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
        <IconLoader2 className="size-5 animate-spin" />
        Loading application…
      </div>
    )
  }

  if (!app) return null

  const statusCfg = STATUS_CONFIG[app.status] ?? { label: app.status, className: "bg-muted text-muted-foreground" }

  return (
    <div className="space-y-4">
      <PageHeader
        back
        title="Application Detail"
        description="Track your rental application status"
      />

      {/* Listing card */}
      <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
        {app.listing.photos[0] && (
          <div className="relative hidden size-16 flex-shrink-0 overflow-hidden rounded-lg sm:block">
            <Image
              src={app.listing.photos[0]}
              alt={app.listing.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <Link
            href={`/listings/${app.listing.slug ?? app.listing.id}`}
            className="font-semibold hover:underline"
          >
            {app.listing.title}
          </Link>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <IconMapPin className="size-3" />
            {app.listing.area}, {app.listing.state}
          </p>
          {app.listing.pricePerYear && (
            <p className="text-xs font-medium">{fmt(app.listing.pricePerYear)}/yr</p>
          )}
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusCfg.className}`}>
          {statusCfg.label}
        </span>
      </div>

      {/* Progress timeline */}
      <Card>
        <CardContent className="pt-5">
          <ol className="relative border-l border-border pl-6 space-y-4">
            <TimelineStep
              done
              label="Application submitted"
              date={app.screeningSubmittedAt ?? app.createdAt}
            />
            <TimelineStep
              done={!!app.tourRequest}
              active={!app.tourRequest}
              label="Property tour"
              sublabel={
                app.tourRequest
                  ? app.tourRequest.status === "COMPLETED"
                    ? "Tour completed"
                    : "Tour scheduled"
                  : "Request a tour from the listing page"
              }
            />
            <TimelineStep
              done={["UNDER_REVIEW", "APPROVED"].includes(app.status)}
              label="Screening review"
              sublabel="Landlord and Leadsage team review your application"
            />
            <TimelineStep
              done={!!app.agreement}
              label="Rental agreement"
              sublabel={
                app.agreement
                  ? AGREEMENT_STATUS[app.agreement.status]?.label ?? app.agreement.status
                  : "Generated after approval"
              }
            />
            <TimelineStep
              done={app.payments.some((p) => p.status === "PAID")}
              label="Payment"
              sublabel={
                app.payments.length
                  ? `${app.payments.filter((p) => p.status === "PAID").length}/${app.payments.length} paid`
                  : "Created after agreement is signed"
              }
            />
          </ol>
        </CardContent>
      </Card>

      {/* Landlord / Admin notes */}
      {(app.landlordNote || app.adminNote) && (
        <div className="space-y-2">
          {app.landlordNote && (
            <div className={`rounded-xl border px-4 py-3 text-sm ${
              app.status === "APPROVED"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
                : app.status === "REJECTED"
                  ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
                  : "border-border bg-muted"
            }`}>
              <p className="mb-0.5 text-xs font-medium uppercase tracking-wide opacity-70">
                Landlord note
              </p>
              {app.landlordNote}
            </div>
          )}
          {app.adminNote && (
            <div className="rounded-xl border px-4 py-3 text-sm border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
              <p className="mb-0.5 text-xs font-medium uppercase tracking-wide opacity-70">
                Leadsage note
              </p>
              {app.adminNote}
            </div>
          )}
        </div>
      )}

      {/* Agreement CTA */}
      {app.agreement && app.agreement.status === "PENDING_TENANT" && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/30">
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Your agreement is ready to sign
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Review and e-sign your tenancy agreement to proceed.
            </p>
          </div>
          <Button size="sm" asChild>
            <Link href={`/agreements/${app.agreement.id}`}>
              Sign now <IconArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      )}

      {/* Agreement summary */}
      {app.agreement && app.agreement.status !== "PENDING_TENANT" && (
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <IconFileText className="size-4" />
                Tenancy Agreement
              </CardTitle>
              <Link href={`/agreements/${app.agreement.id}`} className="text-xs text-primary hover:underline">
                View full agreement
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4 text-sm space-y-2">
            <InfoRow label="Monthly rent" value={fmt(app.agreement.monthlyRent)} />
            {app.agreement.cautionFee && (
              <InfoRow label="Caution deposit" value={fmt(app.agreement.cautionFee)} />
            )}
            <InfoRow label="Start date" value={fmtDate(app.agreement.startDate)} />
            <InfoRow label="End date" value={fmtDate(app.agreement.endDate)} />
            <InfoRow
              label="Status"
              value={AGREEMENT_STATUS[app.agreement.status]?.label ?? app.agreement.status}
              valueClassName={AGREEMENT_STATUS[app.agreement.status]?.className}
            />
          </CardContent>
        </Card>
      )}

      {/* Payments */}
      {app.payments.length > 0 && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-sm">
              <IconCurrencyNaira className="size-4" />
              Payment Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              {app.payments.map((p) => {
                const pCfg = PAYMENT_STATUS[p.status] ?? { label: p.status, className: "" }
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        {p.totalInstallments && p.installmentNo
                          ? `Installment ${p.installmentNo} of ${p.totalInstallments}`
                          : "Payment"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Due: {fmtDate(p.dueDate)}
                        {p.paidAt && ` · Paid: ${fmtDate(p.paidAt)}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{fmt(p.amount)}</p>
                      <p className={`text-xs font-medium ${pCfg.className}`}>
                        {pCfg.label}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Screening details (collapsible) */}
      {app.screeningSubmittedAt && (
        <Card>
          <button
            className="flex w-full items-center justify-between px-6 py-4"
            onClick={() => setShowScreening((v) => !v)}
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <IconUser className="size-4" />
              Your submitted details
            </span>
            {showScreening ? (
              <IconChevronUp className="size-4 text-muted-foreground" />
            ) : (
              <IconChevronDown className="size-4 text-muted-foreground" />
            )}
          </button>

          {showScreening && (
            <div className="border-t px-6 pb-5 pt-4 text-sm space-y-2">
              {app.moveInDate && (
                <InfoRow label="Move-in date" value={fmtDate(app.moveInDate)} />
              )}
              {app.tenancyMonths && (
                <InfoRow label="Tenancy duration" value={`${app.tenancyMonths} months`} />
              )}
              {app.reasonForMoving && (
                <InfoRow label="Reason for moving" value={app.reasonForMoving} />
              )}
              {app.employmentStatus && (
                <InfoRow label="Employment" value={app.employmentStatus} />
              )}
              {app.employer && <InfoRow label="Employer" value={app.employer} />}
              {app.jobTitle && <InfoRow label="Job title" value={app.jobTitle} />}
              {app.monthlyIncome && (
                <InfoRow label="Monthly income" value={fmt(app.monthlyIncome)} />
              )}
              {app.nin && (
                <InfoRow
                  label="NIN"
                  value={app.nin.slice(0, 3) + "••••••••"}
                  sublabel={app.ninVerified ? "Verified" : "Pending verification"}
                  sublabelClassName={app.ninVerified ? "text-emerald-600" : "text-amber-600"}
                />
              )}
              {app.ref1Name && (
                <InfoRow
                  label="Reference 1"
                  value={`${app.ref1Name} · ${app.ref1Phone ?? ""} · ${app.ref1Relation ?? ""}`}
                />
              )}
              {app.ref2Name && (
                <InfoRow
                  label="Reference 2"
                  value={`${app.ref2Name} · ${app.ref2Phone ?? ""} · ${app.ref2Relation ?? ""}`}
                />
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

function TimelineStep({
  done,
  active,
  label,
  sublabel,
  date,
}: {
  done?: boolean
  active?: boolean
  label: string
  sublabel?: string
  date?: string
}) {
  return (
    <li className="relative">
      <div
        className={`absolute -left-[22px] flex size-4 items-center justify-center rounded-full border-2 ${
          done
            ? "border-primary bg-primary"
            : active
              ? "border-primary bg-background"
              : "border-border bg-background"
        }`}
      >
        {done && <IconCircleCheck className="size-3 text-primary-foreground" />}
      </div>
      <p className={`text-sm font-medium ${done ? "" : "text-muted-foreground"}`}>
        {label}
      </p>
      {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
      {date && (
        <p className="text-xs text-muted-foreground">
          {new Date(date).toLocaleDateString("en-NG", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      )}
    </li>
  )
}

function InfoRow({
  label,
  value,
  valueClassName,
  sublabel,
  sublabelClassName,
}: {
  label: string
  value: string
  valueClassName?: string
  sublabel?: string
  sublabelClassName?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <div className="text-right">
        <span className={`font-medium ${valueClassName ?? ""}`}>{value}</span>
        {sublabel && (
          <p className={`text-xs ${sublabelClassName ?? "text-muted-foreground"}`}>
            {sublabel}
          </p>
        )}
      </div>
    </div>
  )
}
