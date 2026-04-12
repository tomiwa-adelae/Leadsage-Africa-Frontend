"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  IconLoader2,
  IconCurrencyNaira,
  IconCalendar,
  IconCircleCheck,
  IconClockHour4,
  IconAlertCircle,
  IconCreditCard,
  IconWallet,
  IconChevronDown,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { fetchData, postData } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ── Types ──────────────────────────────────────────────────────────────────────

interface RentalPayment {
  id: string
  amount: number
  dueDate: string
  installmentNo: number | null
  totalInstallments: number | null
  status: "PENDING" | "PAID" | "OVERDUE" | "WAIVED"
  paidAt: string | null
  listing: {
    id: string
    title: string
    area: string
    state: string
    photos: string[]
  }
  agreement: {
    id: string
    startDate: string
    endDate: string
  } | null
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    icon: IconClockHour4,
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  },
  PAID: {
    label: "Paid",
    icon: IconCircleCheck,
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  OVERDUE: {
    label: "Overdue",
    icon: IconAlertCircle,
    className: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  },
  WAIVED: {
    label: "Waived",
    icon: IconCircleCheck,
    className: "bg-muted text-muted-foreground",
  },
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

export function RentalPayments() {
  const [payments, setPayments] = useState<RentalPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState<string | null>(null)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [data, wallet] = await Promise.all([
        fetchData<RentalPayment[]>("/user/rental-payments"),
        fetchData<{ availableBalance: number }>("/wallet").catch(() => null),
      ])
      setPayments(data)
      if (wallet) setWalletBalance(wallet.availableBalance)
    } catch {
      toast.error("Failed to load payments")
    } finally {
      setLoading(false)
    }
  }, [])

  async function handlePayCard(paymentId: string) {
    setPaying(paymentId)
    try {
      const { paymentUrl } = await postData<{ paymentUrl: string; reference: string }>(
        `/user/rental-payments/${paymentId}/pay`,
        {}
      )
      window.location.href = paymentUrl
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to initialize payment")
      setPaying(null)
    }
  }

  async function handlePayWallet(paymentId: string, amount: number) {
    if (walletBalance !== null && walletBalance < amount) {
      toast.error(`Insufficient wallet balance. You have ${fmt(walletBalance)}.`)
      return
    }
    setPaying(paymentId)
    try {
      await postData(`/wallet/pay/rent/${paymentId}`, {})
      toast.success("Paid from wallet — funds held in escrow for landlord")
      load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Wallet payment failed")
    } finally {
      setPaying(null)
    }
  }

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
        <IconLoader2 className="size-5 animate-spin" />
        Loading payments…
      </div>
    )
  }

  // Group by listing
  const grouped = payments.reduce<
    Record<
      string,
      { listing: RentalPayment["listing"]; payments: RentalPayment[] }
    >
  >((acc, p) => {
    const key = p.listing.id
    if (!acc[key]) acc[key] = { listing: p.listing, payments: [] }
    acc[key].payments.push(p)
    return acc
  }, {})

  const totalOwed = payments
    .filter((p) => p.status === "PENDING" || p.status === "OVERDUE")
    .reduce((s, p) => s + p.amount, 0)

  const totalPaid = payments
    .filter((p) => p.status === "PAID")
    .reduce((s, p) => s + p.amount, 0)

  return (
    <div className="space-y-4">
      <PageHeader
        back
        title="Rental Payments"
        description="Track your long-term rental payment schedule"
      />

      {payments.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border bg-card text-center">
          <IconCurrencyNaira className="size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No payment schedule yet
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/applications">View your applications</Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid gap-2 sm:grid-cols-2">
            <Card>
              <CardContent>
                <p className="text-xs text-muted-foreground">Outstanding</p>
                <p className="mt-1 text-2xl font-bold text-red-600">
                  {fmt(totalOwed)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <p className="text-xs text-muted-foreground">Total paid</p>
                <p className="mt-1 text-2xl font-bold text-emerald-600">
                  {fmt(totalPaid)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Grouped by property */}
          {Object.values(grouped).map(({ listing, payments: grp }) => (
            <Card key={listing.id}>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  {listing.photos[0] && (
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={listing.photos[0]}
                        alt={listing.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-sm">{listing.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {listing.area}, {listing.state}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {grp.map((p) => {
                    const cfg = STATUS_CONFIG[p.status]
                    const Icon = cfg.icon
                    const isOverdue = p.status === "OVERDUE"

                    return (
                      <div
                        key={p.id}
                        className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm ${
                          isOverdue
                            ? "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20"
                            : "bg-muted/30"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="font-medium">
                            {p.totalInstallments && p.installmentNo
                              ? `Installment ${p.installmentNo} of ${p.totalInstallments}`
                              : "Rent payment"}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <IconCalendar className="size-3" />
                            Due: {fmtDate(p.dueDate)}
                            {p.paidAt && ` · Paid: ${fmtDate(p.paidAt)}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{fmt(p.amount)}</span>
                          <span
                            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.className}`}
                          >
                            <Icon className="size-3" />
                            {cfg.label}
                          </span>
                          {(p.status === "PENDING" || p.status === "OVERDUE") && (
                            paying === p.id ? (
                              <Button size="sm" disabled>
                                <IconLoader2 className="size-3.5 animate-spin" />
                                Processing…
                              </Button>
                            ) : (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm">
                                    Pay now
                                    <IconChevronDown className="size-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handlePayCard(p.id)}>
                                    <IconCreditCard className="size-4" />
                                    Pay with Card
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handlePayWallet(p.id, p.amount)}
                                    disabled={walletBalance !== null && walletBalance < p.amount}
                                  >
                                    <IconWallet className="size-4" />
                                    <span>
                                      Pay with Wallet
                                      {walletBalance !== null && (
                                        <span className="ml-1 text-xs text-muted-foreground">
                                          ({fmt(walletBalance)})
                                        </span>
                                      )}
                                    </span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  )
}
