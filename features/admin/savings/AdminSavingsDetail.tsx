"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  IconLoader2,
  IconArrowLeft,
  IconPigMoney,
  IconUser,
  IconCalendar,
  IconTrendingUp,
  IconBuildingBank,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { fetchData } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PageHeader } from "@/components/PageHeader"

// ── Types ──────────────────────────────────────────────────────────────────────

interface Transaction {
  id: string
  type: string
  amount: number
  balance: number
  note: string | null
  createdAt: string
}

interface Plan {
  id: string
  planName: string | null
  status: string
  balance: number
  totalDeposited: number
  interestEarned: number
  duration: string
  frequency: string
  contributionAmount: number
  savingsTarget: number | null
  rentalLocation: string | null
  academicLevel: string
  expectedGradYear: number | null
  paymentMethod: string
  nuban: string | null
  bankName: string | null
  accountName: string | null
  startDate: string
  endDate: string
  createdAt: string
  transactions: Transaction[]
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

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ACTIVE: {
    label: "Active",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  PAUSED: {
    label: "Paused",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  MATURED: {
    label: "Matured",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    className: "border-slate-200 bg-slate-50 text-slate-600",
  },
  BROKEN: {
    label: "Broken",
    className: "border-red-200 bg-red-50 text-red-700",
  },
}

const TX_CONFIG: Record<
  string,
  { label: string; color: string; prefix: string }
> = {
  DEPOSIT: { label: "Deposit", color: "text-emerald-600", prefix: "+" },
  INTEREST: { label: "Interest", color: "text-blue-600", prefix: "+" },
  WITHDRAWAL: { label: "Withdrawal", color: "text-red-600", prefix: "-" },
  PENALTY: { label: "Penalty", color: "text-red-600", prefix: "-" },
  REFUND: { label: "Refund", color: "text-emerald-600", prefix: "+" },
}

// ── Component ──────────────────────────────────────────────────────────────────

export function AdminSavingsDetail({ id }: { id: string }) {
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData<Plan>(`/admin/savings/${id}`)
      .then(setPlan)
      .catch(() => toast.error("Failed to load plan"))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <IconLoader2 className="size-6 animate-spin" />
      </div>
    )
  }

  if (!plan) return null

  const badge = STATUS_CONFIG[plan.status] ?? {
    label: plan.status,
    className: "",
  }

  return (
    <div className="space-y-5">
      <PageHeader
        back
        title={
          <>
            {plan.planName ?? "FirstKey Plan"}{" "}
            <Badge variant="outline" className={`text-xs ${badge.className}`}>
              {badge.label}
            </Badge>
          </>
        }
        description={`Created ${fmtDate(plan.createdAt)}`}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Balances */}
        <Card>
          <CardHeader className="border-b pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <IconTrendingUp className="size-4" />
              Financials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              { label: "Total Balance", value: fmt(plan.balance), bold: true },
              { label: "Total Deposited", value: fmt(plan.totalDeposited) },
              {
                label: "Interest Earned",
                value: fmt(plan.interestEarned),
                accent: "text-emerald-600",
              },
              ...(plan.savingsTarget
                ? [{ label: "Savings Target", value: fmt(plan.savingsTarget) }]
                : []),
              {
                label: "Contribution",
                value: `${fmt(plan.contributionAmount)} / ${plan.frequency.toLowerCase()}`,
              },
            ].map(({ label, value, bold, accent }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-muted-foreground">{label}</span>
                <span
                  className={`font-medium ${bold ? "text-base font-bold" : ""} ${accent ?? ""}`}
                >
                  {value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Plan Info */}
        <Card>
          <CardHeader className="border-b pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <IconPigMoney className="size-4" />
              Plan Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              { label: "Duration", value: plan.duration.replace(/_/g, " ") },
              { label: "Frequency", value: plan.frequency },
              {
                label: "Payment Method",
                value: plan.paymentMethod.replace(/_/g, " "),
              },
              { label: "Academic Level", value: plan.academicLevel },
              ...(plan.expectedGradYear
                ? [{ label: "Grad Year", value: String(plan.expectedGradYear) }]
                : []),
              ...(plan.rentalLocation
                ? [{ label: "Rental Location", value: plan.rentalLocation }]
                : []),
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium capitalize">
                  {value.toLowerCase()}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t pt-2">
              <span className="text-muted-foreground">Start</span>
              <span className="font-medium">{fmtDate(plan.startDate)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Matures</span>
              <span className="font-medium">{fmtDate(plan.endDate)}</span>
            </div>
          </CardContent>
        </Card>

        {/* User */}
        <Card>
          <CardHeader className="border-b pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <IconUser className="size-4" />
              Account Holder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                  {plan.user.firstName[0]}
                  {plan.user.lastName[0]}
                </AvatarFallback>
                {plan.user.image && <AvatarImage src={plan.user.image} />}
              </Avatar>
              <div>
                <p className="font-semibold">
                  {plan.user.firstName} {plan.user.lastName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {plan.user.email}
                </p>
              </div>
            </div>
            {plan.user.phoneNumber && (
              <p className="text-sm text-muted-foreground">
                {plan.user.phoneNumber}
              </p>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/users`}>View user profile</Link>
            </Button>

            {plan.nuban && (
              <div className="mt-2 rounded-lg border bg-muted/30 p-3 text-sm">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <IconBuildingBank className="size-3.5" />
                  Savings NUBAN
                </div>
                <p className="mt-1 font-mono font-bold tracking-wider">
                  {plan.nuban}
                </p>
                {plan.bankName && (
                  <p className="text-xs text-muted-foreground">
                    {plan.bankName}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction history */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <IconCalendar className="size-4" />
            Transaction History ({plan.transactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {plan.transactions.length === 0 ? (
            <div className="flex h-20 items-center justify-center text-sm text-muted-foreground">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-2">
              {plan.transactions.map((tx) => {
                const cfg = TX_CONFIG[tx.type] ?? {
                  label: tx.type,
                  color: "",
                  prefix: "",
                }
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2.5 text-sm"
                  >
                    <div>
                      <p className="font-medium">{cfg.label}</p>
                      {tx.note && (
                        <p className="text-xs text-muted-foreground">
                          {tx.note}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {fmtDate(tx.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${cfg.color}`}>
                        {cfg.prefix}
                        {fmt(Math.abs(tx.amount))}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Bal: {fmt(tx.balance)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
