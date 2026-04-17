"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  IconLoader2,
  IconCircleCheck,
  IconCircleX,
  IconShield,
  IconBriefcase,
  IconUsers,
  IconFileText,
  IconChevronDown,
  IconChevronUp,
  IconArrowRight,
  IconTrash,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { fetchData, updateData, postData } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// ── Types ──────────────────────────────────────────────────────────────────────

interface ScreeningApp {
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
  ninVerifiedAt: string | null
  employmentStatus: string | null
  employer: string | null
  jobTitle: string | null
  monthlyIncome: number | null
  employmentDocUrl: string | null
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
    serviceCharge: number | null
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
    phoneNumber: string | null
    image: string | null
    nin: string | null
    ninVerified: boolean
  }
  tourRequest: {
    id: string
    status: string
    scheduledAt: string | null
    completedAt: string | null
  } | null
  agreement: any
  payments: any[]
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

// ── Main Component ─────────────────────────────────────────────────────────────

export function AdminScreeningDetail({ id }: { id: string }) {
  const [app, setApp] = useState<ScreeningApp | null>(null)
  const [loading, setLoading] = useState(true)
  const [verifyingNin, setVerifyingNin] = useState(false)
  const [reviewNote, setReviewNote] = useState("")
  const [reviewing, setReviewing] = useState(false)
  const [showAgreementDialog, setShowAgreementDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

  // Agreement form
  const [agStartDate, setAgStartDate] = useState("")
  const [agEndDate, setAgEndDate] = useState("")
  const [agMonthlyRent, setAgMonthlyRent] = useState("")
  const [agCautionFee, setAgCautionFee] = useState("")
  const [agServiceCharge, setAgServiceCharge] = useState("")
  const [generatingAgreement, setGeneratingAgreement] = useState(false)

  // Payment form
  const [payInstallments, setPayInstallments] = useState<{ amount: string; dueDate: string }[]>([])
  const [creatingPayment, setCreatingPayment] = useState(false)

  function openPaymentDialog() {
    const agreement = app?.agreement
    if (agreement?.startDate && agreement?.endDate && agreement?.monthlyRent) {
      const start = new Date(agreement.startDate)
      const end = new Date(agreement.endDate)
      const generated: { amount: string; dueDate: string }[] = []
      const current = new Date(start)
      while (current <= end) {
        generated.push({
          amount: String(agreement.monthlyRent),
          dueDate: current.toISOString().slice(0, 10),
        })
        current.setMonth(current.getMonth() + 1)
      }
      setPayInstallments(generated.length > 0 ? generated : [{ amount: "", dueDate: "" }])
    } else {
      setPayInstallments([{ amount: "", dueDate: "" }])
    }
    setShowPaymentDialog(true)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchData<ScreeningApp>(
        `/admin/screening-applications/${id}`
      )
      setApp(data)
      // Pre-fill agreement form from listing
      if (data.listing.pricePerYear) {
        setAgMonthlyRent(String(Math.round(data.listing.pricePerYear / 12)))
      }
      if (data.listing.cautionFee)
        setAgCautionFee(String(data.listing.cautionFee))
      if (data.listing.serviceCharge)
        setAgServiceCharge(String(data.listing.serviceCharge))
    } catch {
      toast.error("Failed to load application")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function handleVerifyNin() {
    setVerifyingNin(true)
    try {
      const res = await postData<{ verified: boolean; message: string }>(
        `/admin/screening-applications/${id}/verify-nin`,
        {}
      )
      if (res.verified) {
        toast.success("NIN verified successfully")
      } else {
        toast.error(`NIN not verified: ${res.message}`)
      }
      load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Verification failed")
    } finally {
      setVerifyingNin(false)
    }
  }

  async function handleReview(status: "APPROVED" | "REJECTED") {
    setReviewing(true)
    try {
      await updateData(`/admin/screening-applications/${id}/review`, {
        status,
        note: reviewNote || undefined,
      })
      toast.success(
        status === "APPROVED" ? "Application approved" : "Application rejected"
      )
      setReviewNote("")
      load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed")
    } finally {
      setReviewing(false)
    }
  }

  async function handleGenerateAgreement() {
    setGeneratingAgreement(true)
    try {
      await postData("/admin/agreements", {
        applicationId: id,
        startDate: agStartDate,
        endDate: agEndDate,
        monthlyRent: Number(agMonthlyRent),
        cautionFee: agCautionFee ? Number(agCautionFee) : undefined,
        serviceCharge: agServiceCharge ? Number(agServiceCharge) : undefined,
      })
      toast.success("Agreement generated and sent to tenant")
      setShowAgreementDialog(false)
      load()
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? "Failed to generate agreement"
      )
    } finally {
      setGeneratingAgreement(false)
    }
  }

  async function handleCreatePayments() {
    setCreatingPayment(true)
    try {
      const validInstallments = payInstallments.filter(
        (i) => i.amount && i.dueDate
      )
      await postData("/admin/rental-payments", {
        applicationId: id,
        agreementId: app?.agreement?.id,
        installments: validInstallments.map((i) => ({
          amount: Number(i.amount),
          dueDate: i.dueDate,
        })),
      })
      toast.success("Payment schedule created")
      setShowPaymentDialog(false)
      load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed")
    } finally {
      setCreatingPayment(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
        <IconLoader2 className="size-5 animate-spin" />
        Loading…
      </div>
    )
  }

  if (!app) return null

  const canGenerateAgreement =
    !app.agreement &&
    (app.adminStatus === "APPROVED" || app.status === "APPROVED")

  return (
    <div className="space-y-4">
      <PageHeader
        back
        title="Screening Application"
        description={app.listing.title}
      />

      {/* Applicant & Listing */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-sm">Applicant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <p className="font-semibold">
              {app.user.firstName} {app.user.lastName}
            </p>
            <p className="text-muted-foreground">{app.user.email}</p>
            {app.user.phoneNumber && (
              <p className="text-muted-foreground">{app.user.phoneNumber}</p>
            )}

            {/* NIN verification */}
            <div className="mt-3 flex items-center justify-between rounded-lg border bg-muted/30 p-2">
              <div>
                <p className="text-xs font-medium">
                  NIN: {app.nin ?? "Not provided"}
                </p>
                {app.ninVerified ? (
                  <p className="flex items-center gap-1 text-xs text-emerald-600">
                    <IconCircleCheck className="size-3" />
                    Verified{" "}
                    {app.ninVerifiedAt
                      ? `on ${fmtDate(app.ninVerifiedAt)}`
                      : ""}
                  </p>
                ) : (
                  <p className="text-xs text-amber-600">Not verified</p>
                )}
              </div>
              {app.nin && !app.ninVerified && (
                <Button
                  size="sm"
                  onClick={handleVerifyNin}
                  disabled={verifyingNin}
                >
                  {verifyingNin ? (
                    <IconLoader2 className="size-3.5 animate-spin" />
                  ) : (
                    <IconShield className="size-3.5" />
                  )}
                  Verify NIN
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-sm">Listing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <p className="font-semibold">{app.listing.title}</p>
            <p className="text-muted-foreground">
              {app.listing.address}, {app.listing.area}, {app.listing.state}
            </p>
            {app.listing.pricePerYear && (
              <p className="font-medium">{fmt(app.listing.pricePerYear)}/yr</p>
            )}
            <p className="text-xs text-muted-foreground">
              Landlord: {app.listing.landlord.firstName}{" "}
              {app.listing.landlord.lastName} · {app.listing.landlord.email}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tenancy intent */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-sm">Tenancy Intent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {app.moveInDate && (
            <InfoRow label="Move-in date" value={fmtDate(app.moveInDate)} />
          )}
          {app.tenancyMonths && (
            <InfoRow label="Duration" value={`${app.tenancyMonths} months`} />
          )}
          {app.reasonForMoving && (
            <InfoRow label="Reason for moving" value={app.reasonForMoving} />
          )}
          {app.message && <InfoRow label="Message" value={app.message} />}
        </CardContent>
      </Card>

      {/* Employment */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-sm">
            <IconBriefcase className="size-4" /> Employment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {app.employmentStatus ? (
            <>
              <InfoRow label="Status" value={app.employmentStatus} />
              {app.employer && (
                <InfoRow label="Employer" value={app.employer} />
              )}
              {app.jobTitle && (
                <InfoRow label="Job title" value={app.jobTitle} />
              )}
              {app.monthlyIncome && (
                <InfoRow
                  label="Monthly income"
                  value={fmt(app.monthlyIncome)}
                />
              )}
              {app.employmentDocUrl && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Employment doc</span>
                  <a
                    href={app.employmentDocUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    View document
                  </a>
                </div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">Not provided</p>
          )}
        </CardContent>
      </Card>

      {/* References */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-sm">
            <IconUsers className="size-4" /> References
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {app.ref1Name ? (
            <div>
              <p className="font-medium">{app.ref1Name}</p>
              <p className="text-xs text-muted-foreground">
                {app.ref1Phone} · {app.ref1Relation}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">Reference 1 not provided</p>
          )}
          {app.ref2Name ? (
            <div>
              <p className="font-medium">{app.ref2Name}</p>
              <p className="text-xs text-muted-foreground">
                {app.ref2Phone} · {app.ref2Relation}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">Reference 2 not provided</p>
          )}
        </CardContent>
      </Card>

      {/* Admin review */}
      {!["REJECTED"].includes(app.adminStatus ?? "") && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-sm">Admin Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Internal note (optional)</Label>
              <Textarea
                placeholder="Notes visible to the applicant if rejected"
                rows={2}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-destructive"
                disabled={reviewing}
                onClick={() => handleReview("REJECTED")}
              >
                <IconCircleX className="size-3.5" />
                Reject
              </Button>
              <Button
                size="sm"
                disabled={reviewing}
                onClick={() => handleReview("APPROVED")}
              >
                <IconCircleCheck className="size-3.5" />
                Approve
              </Button>
            </div>
            {app.adminNote && (
              <p className="rounded-md bg-muted px-3 py-2 text-sm">
                <span className="font-medium">Previous note: </span>
                {app.adminNote}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Generate Agreement */}
      {canGenerateAgreement && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950/30">
          <div>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              Application approved — Generate agreement
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              Review the terms and generate the tenancy agreement for the tenant
              to sign.
            </p>
          </div>
          <Button size="sm" onClick={() => setShowAgreementDialog(true)}>
            <IconFileText className="size-3.5" />
            Generate
          </Button>
        </div>
      )}

      {/* Agreement link */}
      {app.agreement && (
        <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Agreement exists</p>
            <p className="text-xs text-muted-foreground">
              Status: {app.agreement.status}
            </p>
          </div>
          <div className="flex gap-2">
            {app.agreement.status === "FULLY_SIGNED" &&
              app.payments.length === 0 && (
                <Button size="sm" variant="outline" onClick={openPaymentDialog}>
                  Create payments
                </Button>
              )}
            <Button size="sm" variant="outline" asChild>
              <Link href={`/admin/agreements/${app.agreement.id}`}>
                View <IconArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Generate Agreement Dialog */}
      <Dialog open={showAgreementDialog} onOpenChange={setShowAgreementDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Tenancy Agreement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Start date</Label>
                <Input
                  type="date"
                  value={agStartDate}
                  onChange={(e) => setAgStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>End date</Label>
                <Input
                  type="date"
                  value={agEndDate}
                  onChange={(e) => setAgEndDate(e.target.value)}
                  min={agStartDate}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Monthly rent (₦)</Label>
                <Input
                  type="number"
                  value={agMonthlyRent}
                  onChange={(e) => setAgMonthlyRent(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Caution fee (₦)</Label>
                <Input
                  type="number"
                  value={agCautionFee}
                  onChange={(e) => setAgCautionFee(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Service charge (₦)</Label>
                <Input
                  type="number"
                  value={agServiceCharge}
                  onChange={(e) => setAgServiceCharge(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAgreementDialog(false)}
              disabled={generatingAgreement}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateAgreement}
              disabled={
                generatingAgreement ||
                !agStartDate ||
                !agEndDate ||
                !agMonthlyRent
              }
            >
              {generatingAgreement && (
                <IconLoader2 className="size-4 animate-spin" />
              )}
              Generate & Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Payment Schedule</DialogTitle>
          </DialogHeader>
          <div className="max-h-72 space-y-3 overflow-y-auto">
            {payInstallments.map((inst, i) => (
              <div key={i} className="flex items-end gap-2">
                <div className="grid flex-1 grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label>Amount (₦) – installment {i + 1}</Label>
                    <Input
                      type="number"
                      value={inst.amount}
                      onChange={(e) => {
                        const copy = [...payInstallments]
                        copy[i] = { ...copy[i], amount: e.target.value }
                        setPayInstallments(copy)
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Due date</Label>
                    <Input
                      type="date"
                      value={inst.dueDate}
                      onChange={(e) => {
                        const copy = [...payInstallments]
                        copy[i] = { ...copy[i], dueDate: e.target.value }
                        setPayInstallments(copy)
                      }}
                    />
                  </div>
                </div>
                {payInstallments.length > 1 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="mb-0.5 shrink-0 text-destructive hover:text-destructive"
                    onClick={() =>
                      setPayInstallments((prev) => prev.filter((_, idx) => idx !== i))
                    }
                  >
                    <IconTrash className="size-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() =>
                setPayInstallments((prev) => [
                  ...prev,
                  { amount: "", dueDate: "" },
                ])
              }
            >
              + Add installment
            </Button>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
              disabled={creatingPayment}
            >
              Cancel
            </Button>
            <Button onClick={handleCreatePayments} disabled={creatingPayment}>
              {creatingPayment && (
                <IconLoader2 className="size-4 animate-spin" />
              )}
              Create Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}
