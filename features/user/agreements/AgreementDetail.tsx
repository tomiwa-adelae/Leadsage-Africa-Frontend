"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  IconLoader2,
  IconFileText,
  IconCircleCheck,
  IconClockHour4,
  IconPencil,
  IconInfoCircle,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { fetchData, postData } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/store/useAuth"

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
  }
  application: {
    id: string
    status: string
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

const STATUS_CONFIG = {
  PENDING_TENANT: {
    label: "Awaiting your signature",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    icon: IconClockHour4,
  },
  PENDING_LANDLORD: {
    label: "Awaiting landlord signature",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
    icon: IconClockHour4,
  },
  FULLY_SIGNED: {
    label: "Fully signed",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    icon: IconCircleCheck,
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground",
    icon: IconClockHour4,
  },
}

const PAYMENT_STATUS: Record<string, string> = {
  PENDING: "text-amber-600",
  PAID: "text-emerald-600",
  OVERDUE: "text-red-600",
  WAIVED: "text-muted-foreground",
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n)

// ── Main Component ─────────────────────────────────────────────────────────────

export function AgreementDetail({ id }: { id: string }) {
  const { user } = useAuth()
  const [agreement, setAgreement] = useState<Agreement | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSignDialog, setShowSignDialog] = useState(false)
  const [signature, setSignature] = useState("")
  const [signing, setSigning] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchData<Agreement>(`/user/agreements/${id}`)
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

  async function handleSign() {
    if (!signature.trim()) {
      toast.error("Please type your full name as your signature")
      return
    }
    setSigning(true)
    try {
      await postData(`/user/agreements/${id}/sign`, {
        signature: signature.trim(),
      })
      toast.success("Agreement signed! The landlord will countersign shortly.")
      setShowSignDialog(false)
      load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to sign agreement")
    } finally {
      setSigning(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
        <IconLoader2 className="size-5 animate-spin" />
        Loading agreement…
      </div>
    )
  }

  if (!agreement) return null

  const cfg = STATUS_CONFIG[agreement.status]
  const StatusIcon = cfg.icon

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          back
          title="Tenancy Agreement"
          description={agreement.listing.title}
        />
        <span
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${cfg.className}`}
        >
          <StatusIcon className="size-3.5" />
          {cfg.label}
        </span>
      </div>

      {/* Sign CTA */}
      {agreement.status === "PENDING_TENANT" && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/30">
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Action required: Sign this agreement
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Read the full agreement below, then e-sign with your full name.
            </p>
          </div>
          <Button size="sm" onClick={() => setShowSignDialog(true)}>
            <IconPencil className="size-3.5" />
            Sign now
          </Button>
        </div>
      )}

      {/* Summary card */}
      <Card>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <SummaryBox
              label="Monthly rent"
              value={fmt(agreement.monthlyRent)}
            />
            {agreement.cautionFee && (
              <SummaryBox
                label="Caution deposit"
                value={fmt(agreement.cautionFee)}
              />
            )}
            <SummaryBox
              label="Start date"
              value={fmtDate(agreement.startDate)}
            />
            <SummaryBox label="End date" value={fmtDate(agreement.endDate)} />
          </div>
        </CardContent>
      </Card>

      {/* Signature status */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-sm">Signatures</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tenant</span>
            {agreement.tenantSignedAt ? (
              <span className="flex items-center gap-1 text-emerald-600">
                <IconCircleCheck className="size-4" />
                Signed by {agreement.tenantSignature} on{" "}
                {fmtDate(agreement.tenantSignedAt)}
              </span>
            ) : (
              <span className="text-amber-600">Pending</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Landlord</span>
            {agreement.landlordSignedAt ? (
              <span className="flex items-center gap-1 text-emerald-600">
                <IconCircleCheck className="size-4" />
                Signed on {fmtDate(agreement.landlordSignedAt)}
              </span>
            ) : (
              <span className="text-amber-600">Pending</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payments */}
      {agreement.payments.length > 0 && (
        <Card>
          <CardHeader className="border-b pb-3">
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
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{fmt(p.amount)}</p>
                    <p
                      className={`text-xs font-medium ${PAYMENT_STATUS[p.status] ?? ""}`}
                    >
                      {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full agreement document */}
      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <IconFileText className="size-4" />
            Full Agreement Document
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div
            className="prose prose-sm dark:prose-invert max-w-none overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: agreement.content }}
          />
        </CardContent>
      </Card>

      {/* Sign Dialog */}
      <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>E-sign the Agreement</DialogTitle>
            <DialogDescription>
              Type your full legal name below to sign this tenancy agreement.
              This constitutes a legally binding electronic signature.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-start gap-2 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
              <IconInfoCircle className="mt-0.5 size-4 shrink-0" />
              <p>
                By signing, you confirm you have read and agree to all terms in
                this agreement. Your name, timestamp, and IP address will be
                recorded.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Your full legal name</Label>
              <Input
                placeholder={`${user?.firstName ?? "First"} ${user?.lastName ?? "Last"}`}
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Type exactly as it appears on your ID
              </p>
            </div>

            {signature.trim() && (
              <div className="rounded-lg border bg-white p-3 text-center dark:bg-zinc-900">
                <p className="font-serif text-2xl italic">{signature}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date().toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSignDialog(false)}
              disabled={signing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSign}
              disabled={signing || !signature.trim()}
            >
              {signing && <IconLoader2 className="size-4 animate-spin" />}
              Sign Agreement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
