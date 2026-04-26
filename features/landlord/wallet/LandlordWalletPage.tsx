"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import { IconClock, IconLoader2, IconArrowDown } from "@tabler/icons-react"

import { fetchData } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WalletPage } from "@/features/user/wallet/WalletPage"

// ── Types ──────────────────────────────────────────────────────────────────────

interface PendingEscrow {
  id: string
  amount: number
  netAmount: number
  commission: number
  type: "SHORTLET_BOOKING" | "RENTAL_PAYMENT"
  releaseAt: string
  bookingId: string | null
  rentalPaymentId: string | null
  createdAt: string
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n)

function timeUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  if (diff <= 0) return "releasing soon"
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(hours / 24)
  if (days > 0) return `in ${days}d ${hours % 24}h`
  return `in ${hours}h`
}

// ── Pending Escrows Card ───────────────────────────────────────────────────────

function PendingEscrowsCard() {
  const [escrows, setEscrows] = useState<PendingEscrow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchData<PendingEscrow[]>("/wallet/pending-escrows")
      setEscrows(data)
    } catch {
      setEscrows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const total = escrows.reduce((sum, e) => sum + e.netAmount, 0)

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center justify-between gap-2 text-sm">
          <span className="flex items-center gap-2">
            <IconClock className="size-4" />
            Pending Earnings
          </span>
          {!loading && escrows.length > 0 && (
            <span className="text-base font-bold text-amber-600">
              {fmt(total)}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-20 items-center justify-center gap-2 text-muted-foreground">
            <IconLoader2 className="size-4 animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : escrows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No pending payments — all cleared.
          </p>
        ) : (
          <div className="space-y-2">
            {escrows.map((escrow) => (
              <div
                key={escrow.id}
                className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-7 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/40">
                    <IconArrowDown className="size-3.5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {escrow.type === "SHORTLET_BOOKING"
                        ? "Shortlet booking"
                        : "Rental payment"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Releases{" "}
                      {new Date(escrow.releaseAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      · {timeUntil(escrow.releaseAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-amber-600">
                    {fmt(escrow.netAmount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    after {fmt(escrow.commission)} fee
                  </p>
                </div>
              </div>
            ))}
            <p className="pt-1 text-center text-xs text-muted-foreground">
              Payments are released automatically after the hold period.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────

export function LandlordWalletPage() {
  return (
    <div className="space-y-4">
      <Suspense>
        <WalletPage />
      </Suspense>
      <PendingEscrowsCard />
    </div>
  )
}
