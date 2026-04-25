"use client"

import { useCallback, useEffect, useRef, useState } from "react"
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
} from "@tabler/icons-react"
import { toast } from "sonner"

import { fetchData, postData } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { SetPinModal } from "@/components/SetPinModal"
import { PinModal } from "@/components/PinModal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  const [wallet, setWallet] = useState<WalletAccount | null>(null)
  const [txs, setTxs] = useState<WalletTx[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  // KYC dialog
  const [showKyc, setShowKyc] = useState(false)
  const [kycForm, setKycForm] = useState({
    bvn: "",
    dateOfBirth: "",
    gender: "",
  })
  const [submittingKyc, setSubmittingKyc] = useState(false)

  // Withdraw dialog
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [withdrawForm, setWithdrawForm] = useState({
    amount: "",
    bankCode: "",
    accountNumber: "",
    accountName: "",
  })
  const [verifyingBank, setVerifyingBank] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)

  // KYC auto-sync
  const [syncing, setSyncing] = useState(false)
  const syncAttempts = useRef(0)
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // PIN modals
  const [showSetPin, setShowSetPin] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [pendingWithdrawData, setPendingWithdrawData] = useState<{
    amount: number
    bankAccountNumber: string
    bankCode: string
    bankAccountName: string
  } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [w, t] = await Promise.all([
        fetchData<WalletAccount>("/wallet"),
        fetchData<WalletTx[]>("/wallet/transactions"),
      ])
      setWallet(w)
      setTxs(t)
      if (!w.transactionPinSet) setShowSetPin(true)
      if (w.kycStatus === "SUBMITTED" || w.kycStatus === "FAILED") {
        syncAttempts.current = 0
        startAutoSync()
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
      const result = await postData<{ status: string }>("/wallet/kyc/sync")
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
    }
  }, [load])

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
      setWallet((w) => w ? { ...w, kycStatus: "SUBMITTED" } : w)
      startAutoSync()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "KYC submission failed")
    } finally {
      setSubmittingKyc(false)
    }
  }

  async function handleVerifyBank() {
    if (!withdrawForm.accountNumber || !withdrawForm.bankCode) return
    setVerifyingBank(true)
    try {
      const { accountName } = await postData<{ accountName: string }>(
        "/wallet/verify-bank",
        {
          accountNumber: withdrawForm.accountNumber,
          bankCode: withdrawForm.bankCode,
        }
      )
      setWithdrawForm((f) => ({ ...f, accountName }))
      toast.success(`Account verified: ${accountName}`)
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Could not verify account")
      setWithdrawForm((f) => ({ ...f, accountName: "" }))
    } finally {
      setVerifyingBank(false)
    }
  }

  function handleWithdraw() {
    const amount = parseFloat(withdrawForm.amount)
    if (
      !amount ||
      !withdrawForm.bankCode ||
      !withdrawForm.accountNumber ||
      !withdrawForm.accountName
    ) {
      toast.error("Please complete all fields and verify your account")
      return
    }
    setPendingWithdrawData({
      amount,
      bankAccountNumber: withdrawForm.accountNumber,
      bankCode: withdrawForm.bankCode,
      bankAccountName: withdrawForm.accountName,
    })
    setShowWithdraw(false)
    setShowPinModal(true)
  }

  async function executeWithdraw(pin: string) {
    if (!pendingWithdrawData) return
    setShowPinModal(false)
    setWithdrawing(true)
    try {
      const res = await postData<{ message: string }>("/wallet/withdraw", {
        ...pendingWithdrawData,
        pin,
      })
      toast.success(res.message)
      setWithdrawForm({ amount: "", bankCode: "", accountNumber: "", accountName: "" })
      setPendingWithdrawData(null)
      load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Withdrawal failed")
    } finally {
      setWithdrawing(false)
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
            <Button
              size="sm"
              variant="outline"
              disabled={!isActive || wallet.availableBalance <= 0}
              onClick={() => setShowWithdraw(true)}
            >
              <IconArrowUp className="size-3.5" />
              Withdraw
            </Button>
          </div>

          {/* Fund account info */}
          {isActive && wallet.virtualAccountNo ? (
            <div className="mt-4 rounded-lg border bg-muted/40 p-3">
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Fund your wallet — bank transfer to:
              </p>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-lg font-bold tracking-wider">
                    {wallet.virtualAccountNo}
                  </p>
                  <p className="text-xs text-muted-foreground">{bankName}</p>
                  {wallet.virtualAccountName && (
                    <p className="text-xs text-muted-foreground">
                      Account name: {wallet.virtualAccountName}
                    </p>
                  )}
                </div>
                <Button size="icon" variant="ghost" onClick={copyAccountNumber}>
                  {copied ? (
                    <IconCheck className="size-4 text-emerald-600" />
                  ) : (
                    <IconCopy className="size-4" />
                  )}
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Transfers reflect instantly. Use this account number from any
                bank app.
              </p>
            </div>
          ) : isActive ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Your virtual account number is being set up. Check back shortly.
            </p>
          ) : null}
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <IconWallet className="size-4" />
            Transaction History
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

      {/* Set PIN — blocking on first load */}
      <SetPinModal
        open={showSetPin}
        onSuccess={() => {
          setShowSetPin(false)
          setWallet((w) => w ? { ...w, transactionPinSet: true } : w)
        }}
      />

      {/* PIN confirmation before withdrawal */}
      <PinModal
        open={showPinModal}
        description="Enter your PIN to confirm this withdrawal."
        onConfirm={executeWithdraw}
        onCancel={() => {
          setShowPinModal(false)
          setPendingWithdrawData(null)
        }}
      />

      {/* Withdraw Dialog */}
      <Dialog open={showWithdraw} onOpenChange={setShowWithdraw}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Withdraw funds</DialogTitle>
            <DialogDescription>
              Transfer to any Nigerian bank account. Available:{" "}
              {fmt(wallet.availableBalance)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Amount (₦)</Label>
              <Input
                type="number"
                placeholder="e.g. 50000"
                value={withdrawForm.amount}
                onChange={(e) =>
                  setWithdrawForm((f) => ({ ...f, amount: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Bank</Label>
              <Select
                value={withdrawForm.bankCode}
                onValueChange={(v) => {
                  setWithdrawForm((f) => ({
                    ...f,
                    bankCode: v,
                    accountName: "",
                  }))
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
                  value={withdrawForm.accountNumber}
                  onChange={(e) =>
                    setWithdrawForm((f) => ({
                      ...f,
                      accountNumber: e.target.value,
                      accountName: "",
                    }))
                  }
                />
                <Button
                  // size="sm"
                  variant="outline"
                  onClick={handleVerifyBank}
                  disabled={
                    verifyingBank ||
                    withdrawForm.accountNumber.length < 10 ||
                    !withdrawForm.bankCode
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
            {withdrawForm.accountName && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm dark:border-emerald-900 dark:bg-emerald-950/30">
                <IconCheck className="size-4 text-emerald-600" />
                <span className="font-medium text-emerald-800 dark:text-emerald-300">
                  {withdrawForm.accountName}
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowWithdraw(false)}
              disabled={withdrawing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={
                withdrawing || !withdrawForm.accountName || !withdrawForm.amount
              }
            >
              {withdrawing && <IconLoader2 className="size-4 animate-spin" />}
              Withdraw
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
