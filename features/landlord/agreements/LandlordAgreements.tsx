"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  IconLoader2,
  IconFileText,
  IconArrowRight,
  IconCircleCheck,
  IconClockHour4,
  IconPencil,
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
  tenantSignedAt: string | null
  tenantSignature: string | null
  landlordSignedAt: string | null
  landlordSignature: string | null
  createdAt: string
  listing: {
    id: string
    slug: string | null
    title: string
    area: string
    state: string
    photos: string[]
  }
  application: {
    id: string
    status: string
    user: {
      firstName: string
      lastName: string
      email: string
      image: string | null
    }
  }
  payments: {
    id: string
    amount: number
    dueDate: string
    status: string
    installmentNo: number | null
  }[]
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  PENDING_TENANT: { label: "Awaiting tenant signature", className: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" },
  PENDING_LANDLORD: { label: "Awaiting your signature", className: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" },
  FULLY_SIGNED: { label: "Fully signed", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" },
  CANCELLED: { label: "Cancelled", className: "bg-muted text-muted-foreground" },
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n)

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })

// ── Main Component ─────────────────────────────────────────────────────────────

export function LandlordAgreements() {
  const { user } = useAuth()
  const [agreements, setAgreements] = useState<Agreement[]>([])
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState<Agreement | null>(null)
  const [signature, setSignature] = useState("")
  const [submittingSig, setSubmittingSig] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchData<Agreement[]>("/landlord/agreements")
      setAgreements(data)
    } catch {
      toast.error("Failed to load agreements")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSign() {
    if (!signature.trim() || !signing) return
    setSubmittingSig(true)
    try {
      await postData(`/landlord/agreements/${signing.id}/sign`, { signature: signature.trim() })
      toast.success("Agreement signed! Tenancy is now confirmed.")
      setSigning(null)
      setSignature("")
      load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to sign")
    } finally {
      setSubmittingSig(false)
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

  const pendingSign = agreements.filter((a) => a.status === "PENDING_LANDLORD")

  return (
    <div className="space-y-4">
      <PageHeader back title="Rental Agreements" description="Manage tenancy agreements for your properties" />

      {/* Pending sign CTA */}
      {pendingSign.length > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-900 dark:bg-blue-950/30">
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
            {pendingSign.length} agreement{pendingSign.length > 1 ? "s" : ""} awaiting your signature
          </p>
        </div>
      )}

      {agreements.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border bg-card text-center">
          <IconFileText className="size-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No agreements yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {agreements.map((a) => {
            const cfg = STATUS_CONFIG[a.status]

            return (
              <Card key={a.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-semibold truncate">{a.listing.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.listing.area}, {a.listing.state}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Tenant: {a.application.user.firstName} {a.application.user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {fmtDate(a.startDate)} → {fmtDate(a.endDate)} · {fmt(a.monthlyRent)}/mo
                      </p>

                      {/* Signature status */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className={`flex items-center gap-1 text-xs ${a.tenantSignedAt ? "text-emerald-600" : "text-amber-600"}`}>
                          {a.tenantSignedAt ? <IconCircleCheck className="size-3" /> : <IconClockHour4 className="size-3" />}
                          Tenant
                        </span>
                        <span className={`flex items-center gap-1 text-xs ${a.landlordSignedAt ? "text-emerald-600" : "text-amber-600"}`}>
                          {a.landlordSignedAt ? <IconCircleCheck className="size-3" /> : <IconClockHour4 className="size-3" />}
                          You
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.className}`}>
                        {cfg.label}
                      </span>

                      <div className="flex gap-2">
                        {a.status === "PENDING_LANDLORD" && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSigning(a)
                              setSignature(`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim())
                            }}
                          >
                            <IconPencil className="size-3.5" />
                            Sign
                          </Button>
                        )}
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/landlord/agreements/${a.id}`}>
                            View <IconArrowRight className="size-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Sign Dialog */}
      <Dialog open={!!signing} onOpenChange={(o) => !o && setSigning(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sign the Tenancy Agreement</DialogTitle>
            <DialogDescription>
              Type your full legal name to countersign{" "}
              {signing ? `the agreement for "${signing.listing.title}"` : "this agreement"}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Your full legal name</Label>
              <Input
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
              />
            </div>
            {signature.trim() && (
              <div className="rounded-lg border bg-white p-3 text-center dark:bg-zinc-900">
                <p className="font-serif text-2xl italic">{signature}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date().toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSigning(null)} disabled={submittingSig}>
              Cancel
            </Button>
            <Button onClick={handleSign} disabled={submittingSig || !signature.trim()}>
              {submittingSig && <IconLoader2 className="size-4 animate-spin" />}
              Sign Agreement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
