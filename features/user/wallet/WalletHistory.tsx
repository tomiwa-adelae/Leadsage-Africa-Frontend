"use client"

import { useCallback, useEffect, useState } from "react"
import {
  IconLoader2,
  IconWallet,
  IconArrowUp,
  IconArrowDown,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react"
import { toast } from "sonner"
import Link from "next/link"

import { fetchData } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ── Types ──────────────────────────────────────────────────────────────────────

interface WalletTx {
  id: string
  type: string
  amount: number
  balanceAfter: number
  description: string
  reference: string | null
  createdAt: string
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n)

const fmtDate = (d: string) =>
  new Date(d).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

const TX_COLORS: Record<string, string> = {
  CREDIT: "text-emerald-600",
  ESCROW_RELEASE: "text-emerald-600",
  REFUND: "text-emerald-600",
  DEBIT: "text-red-600",
  ESCROW_HOLD: "text-amber-600",
  WITHDRAWAL: "text-red-600",
  COMMISSION: "text-muted-foreground",
}

const TX_LABELS: Record<string, string> = {
  CREDIT: "Credit",
  ESCROW_RELEASE: "Payment released",
  REFUND: "Refund",
  DEBIT: "Debit",
  ESCROW_HOLD: "Held in escrow",
  WITHDRAWAL: "Withdrawal",
  COMMISSION: "Commission",
}

const CREDIT_TYPES = ["CREDIT", "ESCROW_RELEASE", "REFUND"]

const LIMIT_OPTIONS = [20, 50, 100]

// ── Component ──────────────────────────────────────────────────────────────────

export function WalletHistory() {
  const [txs, setTxs] = useState<WalletTx[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchData<{ transactions: WalletTx[]; total: number }>(
        `/wallet/transactions?limit=${limit}&page=${page}`
      )
      setTxs(data.transactions)
      setTotal(data.total)
    } catch {
      toast.error("Could not load transactions")
    } finally {
      setLoading(false)
    }
  }, [limit, page])

  useEffect(() => {
    load()
  }, [load])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      <PageHeader
        back
        title="Transaction History"
        description="All wallet credits, debits, and movements."
      />

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <IconWallet className="size-4" />
              {total > 0
                ? `${total.toLocaleString()} transactions`
                : "Transactions"}
            </span>
            <Select
              value={String(limit)}
              onValueChange={(v) => {
                setLimit(parseInt(v))
                setPage(1)
              }}
            >
              <SelectTrigger className="h-7 w-32 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LIMIT_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-48 items-center justify-center gap-2 text-muted-foreground">
              <IconLoader2 className="size-5 animate-spin" />
              Loading…
            </div>
          ) : txs.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
              <IconWallet className="size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No transactions yet
              </p>
              <Link
                href="/wallet"
                className="text-xs text-primary hover:underline"
              >
                Back to wallet
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {txs.map((tx) => {
                const isCredit = CREDIT_TYPES.includes(tx.type)
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-muted/20"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-8 items-center justify-center rounded-full ${
                          isCredit
                            ? "bg-emerald-100 dark:bg-emerald-950/40"
                            : "bg-red-100 dark:bg-red-950/40"
                        }`}
                      >
                        {isCredit ? (
                          <IconArrowDown className="size-4 text-emerald-600" />
                        ) : (
                          <IconArrowUp className="size-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {TX_LABELS[tx.type] ?? tx.type} ·{" "}
                          {fmtDate(tx.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${TX_COLORS[tx.type] ?? ""}`}
                      >
                        {isCredit ? "+" : "−"}
                        {fmt(tx.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Bal: {fmt(tx.balanceAfter)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1 || loading}
              onClick={() => setPage((p) => p - 1)}
            >
              <IconChevronLeft className="size-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <IconChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
