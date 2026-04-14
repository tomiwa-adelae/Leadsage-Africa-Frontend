"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  IconLoader2,
  IconPlus,
  IconPigMoney,
  IconCalendar,
  IconTrendingUp,
  IconCircleCheck,
  IconClockHour4,
  IconAlertCircle,
  IconPlayerPause,
  IconPlayerPlay,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { fetchData } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SavingsPlan {
  id: string
  planName: string | null
  academicLevel: string
  expectedGradYear: number
  duration: "ONE_YEAR" | "TWO_YEARS" | "UNTIL_GRADUATION"
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM"
  contributionAmount: number
  savingsTarget: number | null
  rentalLocation: string | null
  paymentMethod: "WALLET" | "CARD" | "BANK_TRANSFER"
  status: "ACTIVE" | "PAUSED" | "MATURED" | "WITHDRAWN" | "BROKEN"
  totalDeposited: number
  interestEarned: number
  balance: number
  progressPct: number | null
  isMatured: boolean
  daysRemaining: number
  startDate: string
  endDate: string
  nextContributionAt: string | null
  nuban: string | null
  bankName: string | null
  accountName: string | null
  dreamHousePhoto: string | null
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n)

const DURATION_LABEL = {
  ONE_YEAR: "1 Year",
  TWO_YEARS: "2 Years",
  UNTIL_GRADUATION: "Until Graduation",
}

const FREQ_LABEL = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  CUSTOM: "Custom",
}

const STATUS_CONFIG = {
  ACTIVE: {
    label: "Active",
    icon: IconPlayerPlay,
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  PAUSED: {
    label: "Paused",
    icon: IconPlayerPause as any,
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  },
  MATURED: {
    label: "Matured",
    icon: IconCircleCheck,
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    icon: IconCircleCheck,
    className: "bg-muted text-muted-foreground",
  },
  BROKEN: {
    label: "Closed",
    icon: IconAlertCircle,
    className: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  },
}

// ── Plan Card ──────────────────────────────────────────────────────────────────

function PlanCard({ plan }: { plan: SavingsPlan }) {
  const cfg = STATUS_CONFIG[plan.status]
  const Icon = cfg.icon

  return (
    <Link href={`/firstkey/${plan.id}`}>
      <Card className="group cursor-pointer transition-shadow hover:shadow-md">
        {plan.dreamHousePhoto && (
          <div
            className="h-28 rounded-t-xl bg-cover bg-center"
            style={{ backgroundImage: `url(${plan.dreamHousePhoto})` }}
          />
        )}
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base">
                {plan.planName ?? "FirstKey Savings"}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {plan.academicLevel} Level · {DURATION_LABEL[plan.duration]} ·{" "}
                {FREQ_LABEL[plan.frequency]}
              </p>
            </div>
            <span
              className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.className}`}
            >
              <Icon className="size-3" />
              {cfg.label}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className="text-xl font-bold">{fmt(plan.balance)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Interest earned</p>
              <p className="text-sm font-semibold text-emerald-600">
                {fmt(plan.interestEarned)}
              </p>
            </div>
          </div>

          {plan.savingsTarget && plan.progressPct !== null && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>
                  {plan.progressPct.toFixed(1)}% of {fmt(plan.savingsTarget)}
                </span>
              </div>
              <Progress value={plan.progressPct} className="h-1.5" />
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <IconCalendar className="size-3" />
              {plan.isMatured ? "Matured" : `${plan.daysRemaining}d remaining`}
            </span>
            <span className="flex items-center gap-1">
              <IconTrendingUp className="size-3" />
              12% p.a.
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function FirstKeyPage() {
  const [plans, setPlans] = useState<SavingsPlan[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchData<SavingsPlan[]>("/savings")
      setPlans(data)
    } catch {
      toast.error("Failed to load savings plans")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
        <IconLoader2 className="size-5 animate-spin" />
        Loading savings…
      </div>
    )
  }

  const activePlans = plans.filter(
    (p) => p.status === "ACTIVE" || p.status === "PAUSED"
  )
  const totalBalance = activePlans.reduce((s, p) => s + p.balance, 0)
  const totalInterest = activePlans.reduce((s, p) => s + p.interestEarned, 0)

  return (
    <div className="space-y-4">
      <PageHeader
        back
        title="FirstKey Savings"
        description="Save toward your next home with 12% annual interest"
        action={
          <Button asChild size="sm">
            <Link href="/firstkey/new">
              <IconPlus className="size-4" />
              New Plan
            </Link>
          </Button>
        }
      />

      {plans.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border bg-card text-center">
          <IconPigMoney className="size-12 text-muted-foreground/30" />
          <div>
            <p className="font-medium">Start saving for your home</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Open a FirstKey plan and earn 12% interest annually
            </p>
          </div>
          <Button asChild>
            <Link href="/firstkey/new">
              <IconPlus className="size-4" />
              Create Your First Plan
            </Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Summary */}
          {activePlans.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-3">
              <Card>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Total balance</p>
                  <p className="mt-1 text-2xl font-bold">{fmt(totalBalance)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Total interest
                  </p>
                  <p className="mt-1 text-2xl font-bold text-emerald-600">
                    {fmt(totalInterest)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Active plans</p>
                  <p className="mt-1 text-2xl font-bold">
                    {activePlans.length}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Plans grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
