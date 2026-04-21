"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  IconLoader2,
  IconArrowDown,
  IconArrowUp,
  IconCalendar,
  IconTrendingUp,
  IconBuildingBank,
  IconCopy,
  IconCheck,
  IconAlertTriangle,
  IconPlayerPause,
  IconPlayerPlay,
  IconSettings,
  IconWallet,
  IconCreditCard,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import { fetchData, postData } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { SavingsPlan } from "./FirstKeyPage"

// ── Types ──────────────────────────────────────────────────────────────────────

interface Transaction {
  id: string
  type: "DEPOSIT" | "INTEREST" | "WITHDRAWAL" | "PENALTY" | "REFUND"
  amount: number
  balance: number
  note: string | null
  createdAt: string
}

interface PlanDetail extends SavingsPlan {
  transactions: Transaction[]
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

const TX_CONFIG = {
  DEPOSIT: { label: "Deposit", color: "text-emerald-600", prefix: "+" },
  INTEREST: { label: "Interest", color: "text-blue-600", prefix: "+" },
  WITHDRAWAL: { label: "Withdrawal", color: "text-red-600", prefix: "-" },
  PENALTY: { label: "Penalty", color: "text-red-600", prefix: "-" },
  REFUND: { label: "Refund", color: "text-emerald-600", prefix: "+" },
}

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

// ── Bank Transfer Section ──────────────────────────────────────────────────────

function BankTransferSection({
  plan,
  nubanCopied,
  onCopy,
  onProvisioned,
}: {
  plan: PlanDetail
  nubanCopied: boolean
  onCopy: () => void
  onProvisioned: () => void
}) {
  const [provisioning, setProvisioning] = useState(false)

  const handleProvision = async () => {
    setProvisioning(true)
    try {
      await postData(`/savings/${plan.id}/provision-account`, {})
      toast.success("Account number generated! Refreshing…")
      onProvisioned()
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? "Could not generate account number"
      )
    } finally {
      setProvisioning(false)
    }
  }

  if (!plan.nuban) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-dashed bg-muted/20 p-5 text-center">
          <IconBuildingBank className="mx-auto mb-2 size-8 text-muted-foreground/40" />
          <p className="text-sm font-medium">No account number yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            A dedicated savings account number will be generated for you.
            Requires wallet KYC (BVN verification) to be completed.
          </p>
        </div>
        <Button
          className="w-full"
          onClick={handleProvision}
          disabled={provisioning}
        >
          {provisioning ? (
            <>
              <IconLoader2 className="size-4 animate-spin" />
              &nbsp;Generating…
            </>
          ) : (
            <>
              <IconBuildingBank className="size-4" />
              &nbsp;Generate Account Number
            </>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="space-y-3 rounded-xl border bg-muted/30 p-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Account number</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-bold tracking-wider">
              {plan.nuban}
            </span>
            <button
              onClick={onCopy}
              className="text-muted-foreground hover:text-foreground"
            >
              {nubanCopied ? (
                <IconCheck className="size-4 text-emerald-600" />
              ) : (
                <IconCopy className="size-4" />
              )}
            </button>
          </div>
        </div>
        {plan.bankName && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Bank</span>
            <span>{plan.bankName}</span>
          </div>
        )}
        {plan.accountName && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Account name</span>
            <span>{plan.accountName}</span>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Transfer any amount from any Nigerian bank. Your balance updates
        instantly.
      </p>
    </div>
  )
}

// ── Top Up Dialog ──────────────────────────────────────────────────────────────

type TopUpMethod = "wallet" | "card" | "bank"

function TopUpDialog({
  open,
  onClose,
  plan,
  walletBalance,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  plan: PlanDetail
  walletBalance: number | null
  onSuccess: () => void
}) {
  const [method, setMethod] = useState<TopUpMethod>("wallet")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [nubanCopied, setNubanCopied] = useState(false)

  const copyNuban = () => {
    if (!plan.nuban) return
    navigator.clipboard.writeText(plan.nuban)
    setNubanCopied(true)
    setTimeout(() => setNubanCopied(false), 2000)
  }

  const handleWalletDeposit = async () => {
    const n = parseFloat(amount)
    if (!n || n < 100) {
      toast.error("Minimum deposit is ₦100")
      return
    }
    if (walletBalance !== null && walletBalance < n) {
      toast.error(`Insufficient wallet balance (${fmt(walletBalance)})`)
      return
    }
    setLoading(true)
    try {
      await postData(`/savings/${plan.id}/deposit`, { amount: n })
      toast.success(`₦${n.toLocaleString()} deposited`)
      onSuccess()
      onClose()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Deposit failed")
    } finally {
      setLoading(false)
    }
  }

  const handleCardDeposit = async () => {
    const n = parseFloat(amount)
    if (!n || n < 100) {
      toast.error("Minimum deposit is ₦100")
      return
    }
    setLoading(true)
    try {
      const { paymentUrl } = await postData<{
        paymentUrl: string
        reference: string
      }>(`/savings/${plan.id}/deposit/card`, { amount: n })
      window.location.href = paymentUrl
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? "Could not initialize payment"
      )
      setLoading(false)
    }
  }

  const METHODS: {
    key: TopUpMethod
    label: string
    icon: React.ElementType
  }[] = [
    { key: "wallet", label: "Wallet", icon: IconWallet },
    { key: "card", label: "Card", icon: IconCreditCard },
    { key: "bank", label: "Bank Transfer", icon: IconBuildingBank },
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Top Up — {plan.planName ?? "Savings Plan"}</DialogTitle>
          <DialogDescription>
            Choose how you'd like to add funds. Deposits earn 12% p.a.
            immediately.
          </DialogDescription>
        </DialogHeader>

        {/* Method tabs */}
        <div className="flex gap-1.5 rounded-xl border bg-muted/30 p-1">
          {METHODS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setMethod(key)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors",
                method === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Wallet */}
        {method === "wallet" && (
          <div className="space-y-3">
            {walletBalance !== null && (
              <p className="text-sm text-muted-foreground">
                Balance:{" "}
                <span className="font-medium">{fmt(walletBalance)}</span>
              </p>
            )}
            <div className="space-y-1">
              <Label>Amount (₦)</Label>
              <Input
                type="number"
                min={100}
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 10000"
              />
            </div>
            <Button
              className="w-full"
              onClick={handleWalletDeposit}
              disabled={loading || !amount}
            >
              {loading && <IconLoader2 className="size-4 animate-spin" />}
              {loading ? "Processing…" : "Deposit from Wallet"}
            </Button>
          </div>
        )}

        {/* Card */}
        {method === "card" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              You'll be redirected to Paystack to complete the payment securely.
            </p>
            <div className="space-y-1">
              <Label>Amount (₦)</Label>
              <Input
                type="number"
                min={100}
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 10000"
              />
            </div>
            <Button
              className="w-full"
              onClick={handleCardDeposit}
              disabled={loading || !amount}
            >
              {loading && <IconLoader2 className="size-4 animate-spin" />}
              {loading ? "Redirecting…" : "Pay with Card"}
            </Button>
          </div>
        )}

        {/* Bank Transfer */}
        {method === "bank" && (
          <BankTransferSection
            plan={plan}
            nubanCopied={nubanCopied}
            onCopy={copyNuban}
            onProvisioned={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Withdraw Dialog ────────────────────────────────────────────────────────────

function WithdrawDialog({
  open,
  onClose,
  plan,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  plan: PlanDetail
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)

  const daysActive = Math.floor(
    (Date.now() - new Date(plan.startDate).getTime()) / 86_400_000
  )

  let penaltyDesc = ""
  if (!plan.isMatured) {
    if (daysActive < 30)
      penaltyDesc = "All earned interest will be forfeited (< 30 days)"
    else if (daysActive < 90)
      penaltyDesc = "50% of earned interest will be forfeited (30–90 days)"
    else
      penaltyDesc = `25% of interest + 2% principal fee will be deducted (> 90 days)`
  }

  const handleWithdraw = async () => {
    setLoading(true)
    try {
      const res = await postData<{
        payout: number
        penalty: number
        isMatured: boolean
      }>(`/savings/${plan.id}/withdraw`, {})
      toast.success(`₦${res.payout.toLocaleString()} credited to your wallet`)
      onSuccess()
      onClose()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Withdrawal failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {plan.isMatured ? "Withdraw Savings" : "Early Withdrawal"}
          </DialogTitle>
          <DialogDescription>
            {plan.isMatured
              ? "Your plan has matured. Withdraw your full balance + interest."
              : "Withdrawing before maturity incurs a penalty."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1 rounded-lg bg-muted/50 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deposited</span>
              <span>{fmt(plan.totalDeposited)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Interest earned</span>
              <span className="text-emerald-600">
                +{fmt(plan.interestEarned)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-1 font-semibold">
              <span>Total balance</span>
              <span>{fmt(plan.balance)}</span>
            </div>
          </div>

          {!plan.isMatured && penaltyDesc && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
              <IconAlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>{penaltyDesc}</span>
            </div>
          )}

          <Button
            variant={plan.isMatured ? "default" : "destructive"}
            className="w-full"
            onClick={handleWithdraw}
            disabled={loading}
          >
            {loading ? <IconLoader2 className="size-4 animate-spin" /> : null}
            {loading
              ? "Processing…"
              : plan.isMatured
                ? "Withdraw to Wallet"
                : "Confirm Early Withdrawal"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function SavingsPlanDetail({ id }: { id: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [plan, setPlan] = useState<PlanDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [depositOpen, setDepositOpen] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [txPage, setTxPage] = useState(1)
  const [txTotal, setTxTotal] = useState(0)
  const [txLoading, setTxLoading] = useState(false)
  const TX_PAGE_SIZE = 20

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [data, wallet, txData] = await Promise.all([
        fetchData<PlanDetail>(`/savings/${id}`),
        fetchData<{ availableBalance: number }>("/wallet").catch(() => null),
        fetchData<{ transactions: Transaction[]; total: number }>(
          `/savings/${id}/transactions?page=1&limit=${TX_PAGE_SIZE}`
        ).catch(() => null),
      ])
      setPlan(data)
      if (wallet) setWalletBalance(wallet.availableBalance)
      if (txData) {
        setPlan((prev) =>
          prev ? { ...prev, transactions: txData.transactions } : prev
        )
        setTxTotal(txData.total)
        setTxPage(1)
      }
    } catch {
      toast.error("Failed to load plan")
    } finally {
      setLoading(false)
    }
  }, [id])

  const loadMoreTx = async () => {
    if (txLoading) return
    setTxLoading(true)
    try {
      const nextPage = txPage + 1
      const data = await fetchData<{
        transactions: Transaction[]
        total: number
      }>(`/savings/${id}/transactions?page=${nextPage}&limit=${TX_PAGE_SIZE}`)
      setPlan((prev) =>
        prev
          ? {
              ...prev,
              transactions: [...prev.transactions, ...data.transactions],
            }
          : prev
      )
      setTxPage(nextPage)
      setTxTotal(data.total)
    } catch {
      toast.error("Failed to load more transactions")
    } finally {
      setTxLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [load])

  // Auto-verify card deposit when Paystack redirects back with ?verify=<ref>
  useEffect(() => {
    const ref = searchParams.get("verify")
    if (!ref) return

    // Clear the query param immediately to avoid re-triggering
    router.replace(`/firstkey/${id}`, { scroll: false })

    postData(`/savings/${id}/deposit/card/verify`, { reference: ref })
      .then((res: any) => {
        if (res?.alreadyVerified) return
        toast.success(
          `₦${res?.amount?.toLocaleString() ?? ""} deposited via card`
        )
        load()
      })
      .catch((err: any) => {
        toast.error(
          err?.response?.data?.message ?? "Card payment verification failed"
        )
      })
  }, []) // run once on mount

  const togglePause = async () => {
    if (!plan) return
    setActionLoading(true)
    try {
      const endpoint = plan.status === "ACTIVE" ? "pause" : "resume"
      await postData(`/savings/${plan.id}/${endpoint}`, {})
      toast.success(plan.status === "ACTIVE" ? "Plan paused" : "Plan resumed")
      load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Action failed")
    } finally {
      setActionLoading(false)
    }
  }

  const copyNuban = () => {
    if (!plan?.nuban) return
    navigator.clipboard.writeText(plan.nuban)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
        <IconLoader2 className="size-5 animate-spin" />
        Loading plan…
      </div>
    )
  }

  if (!plan) return null

  const isActive = plan.status === "ACTIVE" || plan.status === "PAUSED"

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-1 md:flex-row md:items-center">
        <PageHeader
          back
          title={plan.planName ?? "FirstKey Savings"}
          description={`${plan.academicLevel} Level · ${DURATION_LABEL[plan.duration]} · ${FREQ_LABEL[plan.frequency]}`}
        />
        {isActive && (
          <Button
            variant="outline"
            className="w-full md:w-auto"
            onClick={() => router.push(`/firstkey/${id}/settings`)}
          >
            <IconSettings className="size-4" />
            Settings
          </Button>
        )}
      </div>

      {/* Balance card */}
      <Card className="overflow-hidden">
        {plan.dreamHousePhoto && (
          <div
            className="h-32 bg-cover bg-center"
            style={{ backgroundImage: `url(${plan.dreamHousePhoto})` }}
          />
        )}
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className="text-2xl font-bold">{fmt(plan.balance)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Deposited</p>
              <p className="text-lg font-semibold">
                {fmt(plan.totalDeposited)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Interest</p>
              <p className="text-lg font-semibold text-emerald-600">
                {fmt(plan.interestEarned)}
              </p>
            </div>
          </div>

          {plan.savingsTarget && plan.progressPct !== null && (
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Target progress</span>
                <span>
                  {plan.progressPct.toFixed(1)}% of {fmt(plan.savingsTarget)}
                </span>
              </div>
              <Progress value={plan.progressPct} className="h-2" />
            </div>
          )}

          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <IconCalendar className="size-3" />
              Matures {fmtDate(plan.endDate)}
              {!plan.isMatured && ` (${plan.daysRemaining}d)`}
            </span>
            <span className="flex items-center gap-1">
              <IconTrendingUp className="size-3" />
              12% p.a.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {isActive && (
        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => setDepositOpen(true)}>
            <IconArrowDown className="size-4" />
            Top Up
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={togglePause}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : plan.status === "ACTIVE" ? (
              <IconPlayerPause className="size-4" />
            ) : (
              <IconPlayerPlay className="size-4" />
            )}
            {plan.status === "ACTIVE" ? "Pause" : "Resume"}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setWithdrawOpen(true)}
          >
            <IconArrowUp className="size-4" />
            Withdraw
          </Button>
        </div>
      )}

      {/* Matured — withdraw CTA */}
      {plan.status === "MATURED" && (
        <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20">
          <CardContent className="flex items-center justify-between pt-4">
            <div>
              <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                Your savings have matured!
              </p>
              <p className="text-sm text-emerald-600">
                Withdraw {fmt(plan.balance)} to your wallet
              </p>
            </div>
            <Button onClick={() => setWithdrawOpen(true)}>Withdraw</Button>
          </CardContent>
        </Card>
      )}

      {/* Bank account details — shown for all plans */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <IconBuildingBank className="size-4" />
            Your Savings Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          {plan.nuban ? (
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Account number</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold tracking-wider">
                    {plan.nuban}
                  </span>
                  <button onClick={copyNuban}>
                    {copied ? (
                      <IconCheck className="size-4 text-emerald-600" />
                    ) : (
                      <IconCopy className="size-4 text-muted-foreground hover:text-foreground" />
                    )}
                  </button>
                </div>
              </div>
              {plan.bankName && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Bank</span>
                  <span>{plan.bankName}</span>
                </div>
              )}
              {plan.accountName && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Account name</span>
                  <span>{plan.accountName}</span>
                </div>
              )}
              <p className="pt-1 text-xs text-muted-foreground">
                Transfer to this account from any bank. Funds reflect instantly.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
                <p className="font-medium text-amber-800 dark:text-amber-400">
                  Account number not generated yet
                </p>
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-500">
                  A dedicated NUBAN is required to receive bank transfers into
                  this plan. Generating one requires{" "}
                  <Link
                    href="/wallet"
                    className="underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-300"
                  >
                    wallet BVN verification
                  </Link>{" "}
                  to be completed first.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDepositOpen(true)}
              >
                <IconBuildingBank className="size-4" />
                Generate Account Number
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction history */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle>Transaction History</CardTitle>
          <span className="text-xs text-muted-foreground">
            {txTotal > 0 ? `${plan.transactions.length} of ${txTotal}` : ""}
          </span>
        </CardHeader>
        <CardContent>
          {plan.transactions.length === 0 ? (
            <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
              No transactions yet. Make your first deposit!
            </div>
          ) : (
            <div className="space-y-2">
              {plan.transactions.map((tx) => {
                const cfg = TX_CONFIG[tx.type]
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

              {plan.transactions.length < txTotal && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1 w-full"
                  onClick={loadMoreTx}
                  disabled={txLoading}
                >
                  {txLoading ? (
                    <IconLoader2 className="size-4 animate-spin" />
                  ) : (
                    `Load more (${txTotal - plan.transactions.length} remaining)`
                  )}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {depositOpen && (
        <TopUpDialog
          open={depositOpen}
          onClose={() => setDepositOpen(false)}
          plan={plan}
          walletBalance={walletBalance}
          onSuccess={load}
        />
      )}

      {withdrawOpen && (
        <WithdrawDialog
          open={withdrawOpen}
          onClose={() => setWithdrawOpen(false)}
          plan={plan}
          onSuccess={load}
        />
      )}
    </div>
  )
}
