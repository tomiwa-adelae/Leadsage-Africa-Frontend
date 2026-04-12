"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  IconLoader2,
  IconCheck,
  IconDeviceFloppy,
  IconRepeat,
  IconBuilding,
  IconWallet,
  IconCreditCard,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { fetchData, updateData } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { SavingsPlan } from "./FirstKeyPage"

// ── Types ──────────────────────────────────────────────────────────────────────

type Frequency = "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM"
type PaymentMethod = "WALLET" | "CARD" | "BANK_TRANSFER"

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n)

const ACADEMIC_LEVELS = ["100", "200", "300", "400", "500"]
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "CUSTOM", label: "Custom" },
]

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: React.ElementType }[] = [
  { value: "WALLET", label: "Leadsage Wallet", icon: IconWallet },
  { value: "CARD", label: "Debit Card", icon: IconCreditCard },
  { value: "BANK_TRANSFER", label: "Bank Transfer", icon: IconBuilding },
]

function SelectChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        selected
          ? "border-[#1a3d2b] bg-[#1a3d2b] text-white dark:border-green-500 dark:bg-green-800"
          : "hover:border-[#1a3d2b]/40",
      )}
    >
      {children}
    </button>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function SavingsPlanSettings({ id }: { id: string }) {
  const router = useRouter()
  const [plan, setPlan] = useState<SavingsPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Editable fields
  const [planName, setPlanName] = useState("")
  const [academicLevel, setAcademicLevel] = useState("")
  const [expectedGradYear, setExpectedGradYear] = useState(0)
  const [contributionAmount, setContributionAmount] = useState("")
  const [frequency, setFrequency] = useState<Frequency>("WEEKLY")
  const [preferredDay, setPreferredDay] = useState<number | undefined>()
  const [savingsTarget, setSavingsTarget] = useState("")
  const [rentalLocation, setRentalLocation] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("WALLET")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchData<SavingsPlan>(`/savings/${id}`)
      setPlan(data)
      setPlanName(data.planName ?? "")
      setAcademicLevel(data.academicLevel)
      setExpectedGradYear(data.expectedGradYear)
      setContributionAmount(String(data.contributionAmount))
      setFrequency(data.frequency)
      setPreferredDay(undefined) // not returned in list shape — set below
      setSavingsTarget(data.savingsTarget ? String(data.savingsTarget) : "")
      setRentalLocation(data.rentalLocation ?? "")
      setPaymentMethod(data.paymentMethod)
    } catch {
      toast.error("Failed to load plan settings")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateData(`/savings/${id}`, {
        planName: planName || undefined,
        academicLevel,
        expectedGradYear,
        contributionAmount: parseFloat(contributionAmount),
        frequency,
        preferredDay,
        savingsTarget: savingsTarget ? parseFloat(savingsTarget) : undefined,
        rentalLocation: rentalLocation || undefined,
        paymentMethod,
      })
      toast.success("Settings saved")
      router.push(`/firstkey/${id}`)
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
        <IconLoader2 className="size-5 animate-spin" />
        Loading settings…
      </div>
    )
  }

  if (!plan) return null

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <PageHeader
        back
        title="Plan Settings"
        description={plan.planName ?? "FirstKey Savings"}
      />

      {/* Plan name */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Plan Name</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="e.g. My rent fund 🏠"
          />
        </CardContent>
      </Card>

      {/* Academic info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Academic Level</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {ACADEMIC_LEVELS.map((l) => (
              <SelectChip
                key={l}
                selected={academicLevel === l}
                onClick={() => setAcademicLevel(l)}
              >
                {l} Level
              </SelectChip>
            ))}
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Expected graduation year</Label>
            <Input
              type="number"
              min={new Date().getFullYear()}
              max={new Date().getFullYear() + 8}
              value={expectedGradYear || ""}
              onChange={(e) => setExpectedGradYear(parseInt(e.target.value))}
              className="max-w-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contribution frequency */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <IconRepeat className="size-4" />
            Contribution Frequency
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {FREQUENCIES.map((f) => (
              <SelectChip
                key={f.value}
                selected={frequency === f.value}
                onClick={() => setFrequency(f.value)}
              >
                {f.label}
              </SelectChip>
            ))}
          </div>

          {frequency === "WEEKLY" && (
            <div className="space-y-1">
              <Label className="text-xs">Preferred day</Label>
              <div className="flex gap-1.5">
                {WEEKDAYS.map((day, i) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setPreferredDay(i + 1)}
                    className={cn(
                      "flex-1 rounded-lg border py-1.5 text-xs font-medium transition-colors",
                      preferredDay === i + 1
                        ? "border-[#1a3d2b] bg-[#1a3d2b] text-white"
                        : "hover:border-[#1a3d2b]/40",
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {frequency === "MONTHLY" && (
            <div className="space-y-1">
              <Label className="text-xs">Preferred day of month</Label>
              <Input
                type="number"
                min={1}
                max={28}
                value={preferredDay ?? ""}
                onChange={(e) => setPreferredDay(parseInt(e.target.value))}
                placeholder="e.g. 1"
                className="max-w-xs"
              />
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-xs">Amount per {frequency.toLowerCase()} (₦)</Label>
            <Input
              type="number"
              min={100}
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
              className="max-w-xs"
            />
            {frequency === "WEEKLY" && contributionAmount && (
              <p className="text-xs text-muted-foreground">
                ≈ {fmt(parseFloat(contributionAmount) * 52)} / year
              </p>
            )}
            {frequency === "MONTHLY" && contributionAmount && (
              <p className="text-xs text-muted-foreground">
                ≈ {fmt(parseFloat(contributionAmount) * 12)} / year
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Savings target */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Savings Target</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Target amount (₦, optional)</Label>
            <Input
              type="number"
              min={0}
              value={savingsTarget}
              onChange={(e) => setSavingsTarget(e.target.value)}
              placeholder="e.g. 500000"
              className="max-w-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Rental location</Label>
            <Input
              value={rentalLocation}
              onChange={(e) => setRentalLocation(e.target.value)}
              placeholder="e.g. Lagos Island"
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment method */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {PAYMENT_METHODS.map((m) => {
            const Icon = m.icon
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => setPaymentMethod(m.value)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all",
                  paymentMethod === m.value
                    ? "border-[#1a3d2b] bg-[#1a3d2b]/5 dark:border-green-500"
                    : "border-border hover:border-[#1a3d2b]/40",
                )}
              >
                <Icon className="size-4 text-[#1a3d2b] dark:text-green-400" />
                <span className="text-sm font-medium">{m.label}</span>
                {paymentMethod === m.value && (
                  <IconCheck className="ml-auto size-4 text-[#1a3d2b] dark:text-green-400" />
                )}
              </button>
            )
          })}
        </CardContent>
      </Card>

      <Button className="w-full" onClick={handleSave} disabled={saving}>
        {saving ? (
          <IconLoader2 className="size-4 animate-spin" />
        ) : (
          <IconDeviceFloppy className="size-4" />
        )}
        {saving ? "Saving…" : "Save Changes"}
      </Button>
    </div>
  )
}
