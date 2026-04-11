"use client"

import { useCallback, useEffect, useState } from "react"
import {
  IconLoader2,
  IconFileText,
  IconCircleCheck,
  IconClockHour4,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { fetchData, updateData } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// ── Types ──────────────────────────────────────────────────────────────────────

interface Agreement {
  id: string
  status: "PENDING_TENANT" | "PENDING_LANDLORD" | "FULLY_SIGNED" | "CANCELLED"
  content: string
  startDate: string
  endDate: string
  monthlyRent: number
  cautionFee: number | null
  serviceCharge: number | null
  tenantSignedAt: string | null
  tenantSignature: string | null
  landlordSignedAt: string | null
  landlordSignature: string | null
  createdAt: string
  listing: {
    title: string
    area: string
    state: string
    address: string
    photos: string[]
    landlord: { firstName: string; lastName: string; email: string }
  }
  application: {
    id: string
    status: string
    user: {
      firstName: string
      lastName: string
      email: string
      phoneNumber: string | null
    }
  }
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

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n)

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

const PAYMENT_STATUS_CLASS: Record<string, string> = {
  PENDING: "text-amber-600",
  PAID: "text-emerald-600",
  OVERDUE: "text-red-600",
  WAIVED: "text-muted-foreground",
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function AdminAgreementDetail({ id }: { id: string }) {
  const [agreement, setAgreement] = useState<Agreement | null>(null)
  const [loading, setLoading] = useState(true)
  const [markingPayment, setMarkingPayment] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchData<Agreement>(`/admin/agreements/${id}`)
      setAgreement(data)
    } catch {
      toast.error("Failed to load agreement")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function handleMarkPaid(paymentId: string) {
    setMarkingPayment(paymentId)
    try {
      await updateData(`/admin/rental-payments/${paymentId}/paid`, {})
      toast.success("Payment marked as paid")
      load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed")
    } finally {
      setMarkingPayment(null)
    }
  }

  async function handleMarkOverdue(paymentId: string) {
    setMarkingPayment(paymentId)
    try {
      await updateData(`/admin/rental-payments/${paymentId}/overdue`, {})
      toast.success("Marked as overdue")
      load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed")
    } finally {
      setMarkingPayment(null)
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

  if (!agreement) return null

  return (
    <div className="space-y-4">
      <PageHeader
        back
        title="Rental Agreement"
        description={agreement.listing.title}
      />

      {/* Summary */}
      <div className="grid gap-2 sm:grid-cols-4">
        <SummaryBox label="Monthly rent" value={fmt(agreement.monthlyRent)} />
        {agreement.cautionFee && (
          <SummaryBox label="Caution" value={fmt(agreement.cautionFee)} />
        )}
        <SummaryBox label="Start" value={fmtDate(agreement.startDate)} />
        <SummaryBox label="End" value={fmtDate(agreement.endDate)} />
      </div>

      {/* Parties */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-sm">Tenant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-semibold">
              {agreement.application.user.firstName}{" "}
              {agreement.application.user.lastName}
            </p>
            <p className="text-muted-foreground">
              {agreement.application.user.email}
            </p>
            {agreement.tenantSignedAt ? (
              <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
                <IconCircleCheck className="size-3.5" />
                Signed on {fmtDate(agreement.tenantSignedAt)}
                {agreement.tenantSignature &&
                  ` as "${agreement.tenantSignature}"`}
              </p>
            ) : (
              <p className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                <IconClockHour4 className="size-3.5" />
                Awaiting signature
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-sm">Landlord</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-semibold">
              {agreement.listing.landlord.firstName}{" "}
              {agreement.listing.landlord.lastName}
            </p>
            <p className="text-muted-foreground">
              {agreement.listing.landlord.email}
            </p>
            {agreement.landlordSignedAt ? (
              <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
                <IconCircleCheck className="size-3.5" />
                Signed on {fmtDate(agreement.landlordSignedAt)}
              </p>
            ) : (
              <p className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                <IconClockHour4 className="size-3.5" />
                Awaiting signature
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payments */}
      {agreement.payments.length > 0 && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-sm">Payment Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {agreement.payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {p.totalInstallments && p.installmentNo
                        ? `Installment ${p.installmentNo}/${p.totalInstallments}`
                        : "Payment"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Due: {fmtDate(p.dueDate)}
                      {p.paidAt && ` · Paid: ${fmtDate(p.paidAt)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold">{fmt(p.amount)}</p>
                      <p
                        className={`text-xs font-medium ${PAYMENT_STATUS_CLASS[p.status] ?? ""}`}
                      >
                        {p.status}
                      </p>
                    </div>
                    {p.status === "PENDING" && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive"
                          disabled={markingPayment === p.id}
                          onClick={() => handleMarkOverdue(p.id)}
                        >
                          Overdue
                        </Button>
                        <Button
                          size="sm"
                          disabled={markingPayment === p.id}
                          onClick={() => handleMarkPaid(p.id)}
                        >
                          {markingPayment === p.id ? (
                            <IconLoader2 className="size-3.5 animate-spin" />
                          ) : null}
                          Mark paid
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full document */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-sm">
            <IconFileText className="size-4" />
            Agreement Document
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div
            className="prose prose-sm dark:prose-invert max-w-none overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: agreement.content }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 px-3 py-2 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-semibold">{value}</p>
    </div>
  )
}
