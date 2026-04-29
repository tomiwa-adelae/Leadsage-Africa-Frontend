"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  IconLoader2,
  IconCopy,
  IconCheck,
  IconWallet,
  IconArrowUp,
  IconArrowDown,
  IconShieldCheck,
  IconAlertCircle,
  IconBuildingBank,
  IconCreditCard,
  IconRefresh,
  IconPlus,
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

import { fetchData, postData } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { SetPinModal } from "@/components/SetPinModal"
import { PinModal } from "@/components/PinModal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { CurrencyInput } from "@/components/ui/currency-input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"

// ── Types ──────────────────────────────────────────────────────────────────────

interface WalletAccount {
  id: string
  kycStatus: "PENDING" | "SUBMITTED" | "VERIFIED" | "FAILED"
  isActive: boolean
  virtualAccountNo: string | null
  virtualAccountName: string | null
  virtualBankName: string | null
  availableBalance: number
  pendingBalance: number
  transactionPinSet: boolean
  withdrawalAccountNumber: string | null
  withdrawalBankName: string | null
  withdrawalAccountName: string | null
  withdrawalAccountChangedAt: string | null
  cooldownDaysLeft?: number
}

interface WithdrawalRequest {
  id: string
  amount: number
  fee: number
  netAmount: number
  bankAccountNumber: string
  bankName: string
  accountName: string
  status: "PENDING" | "COMPLETED" | "REJECTED" | "CANCELLED"
  adminNote: string | null
  processedAt: string | null
  createdAt: string
}

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

// Popular Nigerian banks
const BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "Fidelity Bank", code: "070" },
  { name: "First Bank", code: "011" },
  { name: "First City Monument Bank (FCMB)", code: "214" },
  { name: "Guaranty Trust Bank (GTB)", code: "058" },
  { name: "Heritage Bank", code: "030" },
  { name: "Keystone Bank", code: "082" },
  { name: "Polaris Bank", code: "076" },
  { name: "Providus Bank", code: "101" },
  { name: "Stanbic IBTC", code: "221" },
  { name: "Sterling Bank", code: "232" },
  { name: "Union Bank", code: "032" },
  { name: "United Bank for Africa (UBA)", code: "033" },
  { name: "Unity Bank", code: "215" },
  { name: "Wema Bank", code: "035" },
  { name: "Zenith Bank", code: "057" },
  { name: "Opay", code: "100004" },
  { name: "Palmpay", code: "999991" },
  { name: "Kuda Bank", code: "50211" },
  { name: "Moniepoint", code: "50515" },
]

// ── Main Component ─────────────────────────────────────────────────────────────

export function WalletPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [wallet, setWallet] = useState<WalletAccount | null>(null)
  const [txs, setTxs] = useState<WalletTx[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  // Top-up dialog
  const [showTopup, setShowTopup] = useState(false)
  const [topupMethod, setTopupMethod] = useState<"bank" | "card">("bank")
  const [topupAmount, setTopupAmount] = useState("")
  const [topupLoading, setTopupLoading] = useState(false)
  const [syncingBalance, setSyncingBalance] = useState(false)

  // KYC dialog
  const [showKyc, setShowKyc] = useState(false)
  const [kycForm, setKycForm] = useState({
    bvn: "",
    dateOfBirth: "",
    gender: "",
  })
  const [submittingKyc, setSubmittingKyc] = useState(false)

  // Withdrawal requests
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawalRequest[]>(
    []
  )

  // Bank account setup dialog
  const [showBankAccount, setShowBankAccount] = useState(false)
  const [bankForm, setBankForm] = useState({
    accountNumber: "",
    bankCode: "",
    bankName: "",
  })
  const [verifiedBankName, setVerifiedBankName] = useState("")
  const [verifyingBank, setVerifyingBank] = useState(false)
  const [savingBank, setSavingBank] = useState(false)

  // Withdrawal request dialog
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [requestingWithdrawal, setRequestingWithdrawal] = useState(false)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  // KYC auto-sync
  const [syncing, setSyncing] = useState(false)
  const syncAttempts = useRef(0)
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Balance polling (after "I've made the transfer")
  const balanceSyncAttempts = useRef(0)
  const balanceSyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // PIN modals
  const [showSetPin, setShowSetPin] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinModalMode, setPinModalMode] = useState<"withdraw" | "saveBank">(
    "withdraw"
  )

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [w, txRes, wr] = await Promise.all([
        fetchData<WalletAccount>("/wallet"),
        fetchData<{ transactions: WalletTx[] }>("/wallet/transactions?limit=5"),
        fetchData<WithdrawalRequest[]>("/wallet/withdraw/requests").catch(
          () => [] as WithdrawalRequest[]
        ),
      ])
      setWallet(w)
      setTxs(txRes.transactions)
      setWithdrawRequests(wr)
      if (!w.transactionPinSet) setShowSetPin(true)
      if (w.kycStatus === "SUBMITTED" || w.kycStatus === "FAILED") {
        syncAttempts.current = 0
        startAutoSync()
      }
      // Silent balance sync on every page load — catches missed webhooks
      if (w.isActive) {
        postData<{ synced: boolean; credited?: number }>("/wallet/sync", {})
          .then((res) => {
            if (res.synced && res.credited) {
              setWallet((prev) =>
                prev
                  ? {
                      ...prev,
                      availableBalance: prev.availableBalance + res.credited!,
                    }
                  : prev
              )
              fetchData<{ transactions: WalletTx[] }>(
                "/wallet/transactions?limit=5"
              )
                .then((r) => setTxs(r.transactions))
                .catch(() => {})
            }
          })
          .catch(() => {})
      }
    } catch {
      toast.error("Failed to load wallet")
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function startAutoSync() {
    if (syncTimer.current) clearTimeout(syncTimer.current)
    syncAttempts.current = 0
    runSync()
  }

  async function runSync() {
    if (syncAttempts.current >= 6) {
      setSyncing(false)
      return
    }
    setSyncing(true)
    try {
      const result = await postData<{ status: string }>("/wallet/kyc/sync", {})
      if (result.status === "VERIFIED") {
        setSyncing(false)
        await load()
        toast.success("Wallet activated successfully!")
        return
      }
    } catch {
      // non-fatal — keep polling
    }
    syncAttempts.current += 1
    syncTimer.current = setTimeout(runSync, 8000)
  }

  useEffect(() => {
    load()
    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current)
      if (balanceSyncTimer.current) clearTimeout(balanceSyncTimer.current)
    }
  }, [load])

  // Auto-verify card top-up when Paystack redirects back with ?verify=<ref>
  useEffect(() => {
    const ref = searchParams.get("verify")
    if (!ref) return
    router.replace("/wallet", { scroll: false })
    postData<{ success: boolean; amount?: number; alreadyVerified?: boolean }>(
      "/wallet/topup/card/verify",
      { reference: ref }
    )
      .then((res) => {
        if (!res.alreadyVerified && res.amount) {
          toast.success(`₦${res.amount.toLocaleString()} added to your wallet!`)
          load()
        }
      })
      .catch(() => toast.error("Could not verify card payment"))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCardTopup() {
    const n = parseFloat(topupAmount)
    if (!n || n < 1000) {
      toast.error("Minimum top-up is ₦1000")
      return
    }
    setTopupLoading(true)
    try {
      const { paymentUrl } = await postData<{ paymentUrl: string }>(
        "/wallet/topup/card",
        { amount: n }
      )
      window.location.href = paymentUrl
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? "Could not initialize payment"
      )
      setTopupLoading(false)
    }
  }

  function startBalanceSync() {
    if (balanceSyncTimer.current) clearTimeout(balanceSyncTimer.current)
    balanceSyncAttempts.current = 0
    setSyncingBalance(true)
    runBalanceSync()
  }

  async function runBalanceSync() {
    if (balanceSyncAttempts.current >= 12) {
      setSyncingBalance(false)
      toast.info(
        "Transfer not detected yet — it will reflect automatically once confirmed."
      )
      return
    }
    try {
      const res = await postData<{ synced: boolean; credited?: number }>(
        "/wallet/sync",
        {}
      )
      if (res.synced && res.credited) {
        setSyncingBalance(false)
        toast.success(`₦${res.credited.toLocaleString()} transfer confirmed!`)
        setShowTopup(false)
        load()
        return
      }
    } catch {
      // non-fatal — keep polling
    }
    balanceSyncAttempts.current += 1
    balanceSyncTimer.current = setTimeout(runBalanceSync, 5000)
  }

  function copyAccountNumber() {
    if (!wallet?.virtualAccountNo) return
    navigator.clipboard.writeText(wallet.virtualAccountNo)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleKyc() {
    if (!kycForm.bvn || !kycForm.dateOfBirth || !kycForm.gender) {
      toast.error("Please fill all fields")
      return
    }
    setSubmittingKyc(true)
    try {
      await postData("/wallet/kyc", {
        bvn: kycForm.bvn,
        dateOfBirth: kycForm.dateOfBirth,
        gender: kycForm.gender,
      })
      setShowKyc(false)
      setWallet((w) => (w ? { ...w, kycStatus: "SUBMITTED" } : w))
      startAutoSync()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "KYC submission failed")
    } finally {
      setSubmittingKyc(false)
    }
  }

  // ── Bank account setup ─────────────────────────────────────────────────────

  async function handleVerifyBank() {
    if (!bankForm.accountNumber || !bankForm.bankCode) return
    setVerifyingBank(true)
    setVerifiedBankName("")
    try {
      const { accountName } = await postData<{ accountName: string }>(
        "/wallet/verify-bank",
        { accountNumber: bankForm.accountNumber, bankCode: bankForm.bankCode }
      )
      setVerifiedBankName(accountName)
      toast.success(`Account verified: ${accountName}`)
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Could not verify account")
    } finally {
      setVerifyingBank(false)
    }
  }

  function openSaveBankPin() {
    if (!verifiedBankName || !bankForm.bankCode || !bankForm.accountNumber) {
      toast.error("Please verify your account number first")
      return
    }
    setPinModalMode("saveBank")
    setShowBankAccount(false)
    setShowPinModal(true)
  }

  async function executeSaveBank(pin: string) {
    setShowPinModal(false)
    setSavingBank(true)
    try {
      await postData("/wallet/bank-account", {
        accountNumber: bankForm.accountNumber,
        bankCode: bankForm.bankCode,
        bankName: bankForm.bankName,
        pin,
      })
      toast.success("Withdrawal account saved")
      setBankForm({ accountNumber: "", bankCode: "", bankName: "" })
      setVerifiedBankName("")
      load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Could not save account")
    } finally {
      setSavingBank(false)
    }
  }

  // ── Withdrawal request ─────────────────────────────────────────────────────

  function handleWithdraw() {
    const amount = parseFloat(withdrawAmount)
    if (!amount || amount < 1000) {
      toast.error("Minimum withdrawal is ₦1,000")
      return
    }
    if (!wallet?.withdrawalAccountNumber) {
      toast.error("Please set a withdrawal account first")
      return
    }
    setPinModalMode("withdraw")
    setShowWithdraw(false)
    setShowPinModal(true)
  }

  async function executeWithdraw(pin: string) {
    setShowPinModal(false)
    setRequestingWithdrawal(true)
    try {
      const res = await postData<{ message: string; id: string }>(
        "/wallet/withdraw/request",
        { amount: parseFloat(withdrawAmount), pin }
      )
      toast.success(res.message)
      setWithdrawAmount("")
      load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Withdrawal request failed")
    } finally {
      setRequestingWithdrawal(false)
    }
  }

  async function handleCancel(id: string) {
    setCancellingId(id)
    try {
      await postData(`/wallet/withdraw/${id}/cancel`, {})
      toast.success("Withdrawal request cancelled")
      load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Could not cancel request")
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
        <IconLoader2 className="size-5 animate-spin" />
        Loading wallet…
      </div>
    )
  }

  if (!wallet) return null

  const isActive = wallet.isActive && wallet.kycStatus === "VERIFIED"
  const bankName = wallet.virtualBankName ?? "Wema Bank"

  return (
    <div className="space-y-4">
      <PageHeader
        back
        title="My Wallet"
        description="Your Leadsage wallet — fund, pay, and withdraw"
      />

      {/* KYC banner */}
      {!isActive && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            {syncing ? (
              <IconLoader2 className="mt-0.5 size-5 shrink-0 animate-spin text-amber-600" />
            ) : (
              <IconAlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600" />
            )}
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                {syncing
                  ? "Verifying your identity…"
                  : wallet.kycStatus === "SUBMITTED"
                    ? "Verification in progress"
                    : wallet.kycStatus === "FAILED"
                      ? "Verification failed — please try again"
                      : "Activate your wallet"}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {syncing
                  ? "Checking your BVN with your bank. This usually takes under a minute."
                  : wallet.kycStatus === "SUBMITTED"
                    ? "Still processing — we'll activate your wallet automatically when done."
                    : wallet.kycStatus === "FAILED"
                      ? "Your BVN details could not be verified. Please check and resubmit."
                      : "Submit your BVN to activate deposits, payments, and withdrawals."}
              </p>
            </div>
          </div>
          {!syncing && wallet.kycStatus !== "SUBMITTED" && (
            <Button size="sm" onClick={() => setShowKyc(true)}>
              <IconShieldCheck className="size-3.5" />
              Verify BVN
            </Button>
          )}
        </div>
      )}

      {/* Balance card */}
      <Card>
        <CardContent>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Available balance</p>
              <p className="mt-1 text-3xl font-bold">
                {fmt(wallet.availableBalance)}
              </p>
              {wallet.pendingBalance > 0 && (
                <p className="mt-1 text-xs text-amber-600">
                  + {fmt(wallet.pendingBalance)} pending release
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={!isActive}
                onClick={() => {
                  setTopupMethod("bank")
                  setShowTopup(true)
                }}
              >
                <IconPlus className="size-3.5" />
                Add Money
              </Button>
              <Button
                size="sm"
                // className="hidden"
                variant="outline"
                disabled={!isActive || wallet.availableBalance <= 0}
                onClick={() => setShowWithdraw(true)}
              >
                <IconArrowUp className="size-3.5" />
                Withdraw
              </Button>
            </div>
          </div>

          {/* Bank account — compact, always visible when active */}
          {isActive && wallet.virtualAccountNo && (
            <div className="mt-4 rounded-lg border bg-muted/40 p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Fund by bank transfer:
              </p>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-lg font-bold tracking-wider">
                    {wallet.virtualAccountNo}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {bankName}
                    {wallet.virtualAccountName
                      ? ` · ${wallet.virtualAccountName}`
                      : ""}
                  </p>
                </div>
                <Button size="icon" variant="ghost" onClick={copyAccountNumber}>
                  {copied ? (
                    <IconCheck className="size-4 text-emerald-600" />
                  ) : (
                    <IconCopy className="size-4" />
                  )}
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 hidden w-full"
                onClick={startBalanceSync}
                disabled={syncingBalance}
              >
                {syncingBalance ? (
                  <IconLoader2 className="size-4 animate-spin" />
                ) : (
                  <IconRefresh className="size-4" />
                )}
                {syncingBalance ? "Checking…" : "I've made the transfer"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending withdrawal banner — shown prominently when a request is in flight */}
      {withdrawRequests.some((r) => r.status === "PENDING") && (
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-900 dark:bg-blue-950/30">
          <IconLoader2 className="mt-0.5 size-5 shrink-0 animate-spin text-blue-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
              Withdrawal request pending
            </p>
            {withdrawRequests
              .filter((r) => r.status === "PENDING")
              .map((r) => (
                <p
                  key={r.id}
                  className="text-xs text-blue-700 dark:text-blue-400"
                >
                  {fmt(r.amount)} → {r.accountName} ({r.bankName}) · being
                  processed within 24 hours
                </p>
              ))}
          </div>
          <button
            className="text-xs whitespace-nowrap text-blue-600 underline hover:text-blue-800"
            onClick={() =>
              handleCancel(
                withdrawRequests.find((r) => r.status === "PENDING")!.id
              )
            }
            disabled={!!cancellingId}
          >
            {cancellingId ? (
              <IconLoader2 className="inline size-3 animate-spin" />
            ) : (
              "Cancel"
            )}
          </button>
        </div>
      )}

      {/* Rejected withdrawal notice */}
      {withdrawRequests.some((r) => r.status === "REJECTED") &&
        !withdrawRequests.some((r) => r.status === "PENDING") && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950/30">
            <IconAlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                Withdrawal request declined
              </p>
              {withdrawRequests
                .filter((r) => r.status === "REJECTED")
                .slice(0, 1)
                .map((r) => (
                  <p
                    key={r.id}
                    className="text-xs text-red-700 dark:text-red-400"
                  >
                    {fmt(r.amount)} — {r.adminNote ?? "No reason provided"}
                  </p>
                ))}
            </div>
          </div>
        )}

      {/* Transactions */}
      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <IconWallet className="size-4" />
              Recent Transactions
            </span>
            {txs.length > 0 && (
              <Link
                href="/wallet/history"
                className="text-xs font-normal text-primary hover:underline"
              >
                View all
              </Link>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {txs.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center gap-2 text-center">
              <IconBuildingBank className="size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No transactions yet
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {txs.map((tx) => {
                const isCredit = [
                  "CREDIT",
                  "ESCROW_RELEASE",
                  "REFUND",
                ].includes(tx.type)
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-7 items-center justify-center rounded-full ${isCredit ? "bg-emerald-100 dark:bg-emerald-950/40" : "bg-red-100 dark:bg-red-950/40"}`}
                      >
                        {isCredit ? (
                          <IconArrowDown className="size-3.5 text-emerald-600" />
                        ) : (
                          <IconArrowUp className="size-3.5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {TX_LABELS[tx.type] ?? tx.type} ·{" "}
                          {new Date(tx.createdAt).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${TX_COLORS[tx.type] ?? ""}`}
                      >
                        {isCredit ? "+" : "-"}
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

      {/* Top-up Dialog */}
      <Dialog open={showTopup} onOpenChange={setShowTopup}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Money</DialogTitle>
            <DialogDescription>
              Fund your Sage Nest wallet via bank transfer or card.
            </DialogDescription>
          </DialogHeader>

          {/* Method tabs */}
          <div className="flex gap-1.5 rounded-xl border bg-muted/30 p-1">
            {[
              {
                key: "bank" as const,
                label: "Bank Transfer",
                icon: IconBuildingBank,
              },
              { key: "card" as const, label: "Card", icon: IconCreditCard },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTopupMethod(key)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors",
                  topupMethod === key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Bank Transfer */}
          {topupMethod === "bank" && wallet?.virtualAccountNo && (
            <div className="space-y-3">
              <div className="space-y-2 rounded-xl border bg-muted/30 p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Account number</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold tracking-wider">
                      {wallet.virtualAccountNo}
                    </span>
                    <button
                      onClick={copyAccountNumber}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {copied ? (
                        <IconCheck className="size-4 text-emerald-600" />
                      ) : (
                        <IconCopy className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Bank</span>
                  <span>{bankName}</span>
                </div>
                {wallet.virtualAccountName && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Account name</span>
                    <span>{wallet.virtualAccountName}</span>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={startBalanceSync}
                disabled={syncingBalance}
              >
                {syncingBalance ? (
                  <IconLoader2 className="size-4 animate-spin" />
                ) : (
                  <IconRefresh className="size-4" />
                )}
                {syncingBalance ? "Checking…" : "I've made the transfer"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Transfer from any Nigerian bank, then tap above to confirm.
              </p>
            </div>
          )}

          {/* Card */}
          {topupMethod === "card" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Amount (₦)</Label>
                <CurrencyInput
                  min={1000}
                  autoFocus
                  placeholder="e.g. 10,000"
                  value={topupAmount}
                  onChange={setTopupAmount}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                You'll be redirected to Paystack to complete the payment
                securely.
              </p>
              <Button
                className="w-full"
                onClick={handleCardTopup}
                disabled={topupLoading || !topupAmount}
              >
                {topupLoading && (
                  <IconLoader2 className="size-4 animate-spin" />
                )}
                {topupLoading ? "Redirecting…" : "Pay with Card"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* KYC Dialog */}
      <Dialog open={showKyc} onOpenChange={setShowKyc}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Verify your identity</DialogTitle>
            <DialogDescription>
              Your BVN is required to activate your wallet. It is used only for
              identity verification and is never stored in plain text.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>BVN (Bank Verification Number)</Label>
              <Input
                placeholder="11-digit BVN"
                maxLength={11}
                value={kycForm.bvn}
                onChange={(e) =>
                  setKycForm((f) => ({ ...f, bvn: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={kycForm.dateOfBirth}
                onChange={(e) =>
                  setKycForm((f) => ({ ...f, dateOfBirth: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Gender</Label>
              <Select
                value={kycForm.gender}
                onValueChange={(v) => setKycForm((f) => ({ ...f, gender: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowKyc(false)}
              disabled={submittingKyc}
            >
              Cancel
            </Button>
            <Button onClick={handleKyc} disabled={submittingKyc}>
              {submittingKyc && <IconLoader2 className="size-4 animate-spin" />}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdrawal account card */}
      {isActive && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <IconBuildingBank className="size-4" />
                Withdrawal Account
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => setShowBankAccount(true)}
                disabled={
                  !!(
                    wallet.cooldownDaysLeft &&
                    wallet.cooldownDaysLeft > 0 &&
                    wallet.withdrawalAccountNumber
                  )
                }
              >
                {wallet.withdrawalAccountNumber ? "Change" : "Set up"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {wallet.withdrawalAccountNumber ? (
              <div className="space-y-1">
                <p className="text-sm font-semibold">
                  {wallet.withdrawalAccountName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {wallet.withdrawalAccountNumber} · {wallet.withdrawalBankName}
                </p>
                {wallet.cooldownDaysLeft && wallet.cooldownDaysLeft > 0 ? (
                  <p className="text-xs text-amber-600">
                    Can change again in {wallet.cooldownDaysLeft} day(s)
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No withdrawal account set. Add one to enable withdrawals.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Withdrawal requests history */}
      {isActive && withdrawRequests.length > 0 && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-sm">
              <IconArrowUp className="size-4" />
              Withdrawal Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {withdrawRequests.map((req) => {
                const statusColors: Record<string, string> = {
                  PENDING: "text-amber-600 bg-amber-50 border-amber-200",
                  COMPLETED:
                    "text-emerald-600 bg-emerald-50 border-emerald-200",
                  REJECTED: "text-red-600 bg-red-50 border-red-200",
                  CANCELLED: "text-muted-foreground bg-muted/30 border-border",
                }
                return (
                  <div
                    key={req.id}
                    className="space-y-1 rounded-lg border bg-muted/20 px-3 py-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {fmt(req.amount)} withdrawal
                        </p>
                        <p className="text-xs text-muted-foreground">
                          You receive {fmt(req.netAmount)} · {req.accountName}
                        </p>
                      </div>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusColors[req.status]}`}
                      >
                        {req.status.charAt(0) +
                          req.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                    {req.adminNote && (
                      <p className="text-xs text-red-600">
                        Reason: {req.adminNote}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(req.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    {req.status === "PENDING" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-0 text-xs text-red-600 hover:text-red-700"
                        onClick={() => handleCancel(req.id)}
                        disabled={cancellingId === req.id}
                      >
                        {cancellingId === req.id ? (
                          <IconLoader2 className="size-3 animate-spin" />
                        ) : (
                          "Cancel request"
                        )}
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Set PIN — blocking on first load */}
      <SetPinModal
        open={showSetPin}
        onSuccess={() => {
          setShowSetPin(false)
          setWallet((w) => (w ? { ...w, transactionPinSet: true } : w))
        }}
      />

      {/* Unified PIN modal */}
      <PinModal
        open={showPinModal}
        description={
          pinModalMode === "withdraw"
            ? "Enter your PIN to submit this withdrawal request."
            : "Enter your PIN to save this withdrawal account."
        }
        onConfirm={
          pinModalMode === "withdraw" ? executeWithdraw : executeSaveBank
        }
        onCancel={() => setShowPinModal(false)}
      />

      {/* Bank account setup dialog */}
      <Dialog open={showBankAccount} onOpenChange={setShowBankAccount}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {wallet.withdrawalAccountNumber
                ? "Change withdrawal account"
                : "Set withdrawal account"}
            </DialogTitle>
            <DialogDescription>
              You can only withdraw to your own verified bank account. The
              account name must match your registered name.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Bank</Label>
              <Select
                value={bankForm.bankCode}
                onValueChange={(v) => {
                  const bank = BANKS.find((b) => b.code === v)
                  setBankForm((f) => ({
                    ...f,
                    bankCode: v,
                    bankName: bank?.name ?? "",
                  }))
                  setVerifiedBankName("")
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent>
                  {BANKS.map((b) => (
                    <SelectItem key={b.code} value={b.code}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Account Number</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="10-digit account number"
                  maxLength={10}
                  value={bankForm.accountNumber}
                  onChange={(e) => {
                    setBankForm((f) => ({
                      ...f,
                      accountNumber: e.target.value,
                    }))
                    setVerifiedBankName("")
                  }}
                />
                <Button
                  variant="outline"
                  onClick={handleVerifyBank}
                  disabled={
                    verifyingBank ||
                    bankForm.accountNumber.length < 10 ||
                    !bankForm.bankCode
                  }
                >
                  {verifyingBank ? (
                    <IconLoader2 className="size-4 animate-spin" />
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>
            </div>
            {verifiedBankName && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm dark:border-emerald-900 dark:bg-emerald-950/30">
                <IconCheck className="size-4 text-emerald-600" />
                <span className="font-medium text-emerald-800 dark:text-emerald-300">
                  {verifiedBankName}
                </span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              This account will be saved for 30 days before you can change it
              again.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBankAccount(false)}
              disabled={savingBank}
            >
              Cancel
            </Button>
            <Button
              onClick={openSaveBankPin}
              disabled={savingBank || !verifiedBankName}
            >
              {savingBank && <IconLoader2 className="size-4 animate-spin" />}
              Save account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw request dialog */}
      <Dialog open={showWithdraw} onOpenChange={setShowWithdraw}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Request withdrawal</DialogTitle>
            <DialogDescription>
              Withdrawals are processed within 24 hours. Available:{" "}
              {fmt(wallet.availableBalance)}
            </DialogDescription>
          </DialogHeader>
          {wallet.withdrawalAccountNumber ? (
            <div className="space-y-4">
              {/* Saved account display */}
              <div className="rounded-lg border bg-muted/30 px-3 py-2.5 text-sm">
                <p className="mb-0.5 text-xs text-muted-foreground">
                  Sending to
                </p>
                <p className="font-medium">{wallet.withdrawalAccountName}</p>
                <p className="text-xs text-muted-foreground">
                  {wallet.withdrawalAccountNumber} · {wallet.withdrawalBankName}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Amount (₦)</Label>
                <CurrencyInput
                  placeholder="Min. ₦1,000"
                  value={withdrawAmount}
                  onChange={setWithdrawAmount}
                  autoFocus
                />
              </div>
              {/* Fee breakdown */}
              {parseFloat(withdrawAmount) >= 1000 && (
                <div className="space-y-1 rounded-lg border bg-muted/20 px-3 py-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Amount requested
                    </span>
                    <span>{fmt(parseFloat(withdrawAmount))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      NIP transfer fee
                    </span>
                    <span className="text-red-500">− {fmt(50)}</span>
                  </div>
                  <div className="mt-1 flex justify-between border-t pt-1 font-semibold">
                    <span>You receive</span>
                    <span className="text-emerald-600">
                      {fmt(parseFloat(withdrawAmount) - 50)}
                    </span>
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                You will receive a notification once your withdrawal is
                processed.
              </p>
            </div>
          ) : (
            <div className="space-y-3 py-4 text-center">
              <p className="text-sm text-muted-foreground">
                You need to set a withdrawal account first.
              </p>
              <Button
                onClick={() => {
                  setShowWithdraw(false)
                  setShowBankAccount(true)
                }}
              >
                Set withdrawal account
              </Button>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdraw(false)}>
              Cancel
            </Button>
            {wallet.withdrawalAccountNumber && (
              <Button
                onClick={handleWithdraw}
                disabled={
                  requestingWithdrawal ||
                  !withdrawAmount ||
                  parseFloat(withdrawAmount) < 1000
                }
              >
                {requestingWithdrawal && (
                  <IconLoader2 className="size-4 animate-spin" />
                )}
                Request withdrawal
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
