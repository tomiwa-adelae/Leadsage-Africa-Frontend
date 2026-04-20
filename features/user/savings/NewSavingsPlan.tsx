"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  IconArrowLeft,
  IconArrowRight,
  IconLoader2,
  IconCheck,
  IconSchool,
  IconCalendar,
  IconRepeat,
  IconTarget,
  IconWallet,
  IconCreditCard,
  IconBuilding,
  IconCopy,
  IconRefresh,
  IconExternalLink,
  IconLock,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { postData, fetchData } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// ── Types ──────────────────────────────────────────────────────────────────────

type Duration = "SIX_MONTHS" | "ONE_YEAR" | "TWO_YEARS" | "UNTIL_GRADUATION"
type Frequency = "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM"
type PaymentMethod = "WALLET" | "CARD" | "BANK_TRANSFER"

interface FormState {
  schoolName: string
  academicLevel: string
  expectedGradYear: number
  expectedGradMonth: number | undefined
  duration: Duration | ""
  contributionAmount: string
  frequency: Frequency | ""
  preferredDay: number | undefined
  savingsTarget: string
  rentalLocation: string
  useCurrentCity: boolean
  paymentMethod: PaymentMethod | ""
  planName: string
}

const SCHOOLS = [{ value: "covenant_university", label: "Covenant University" }]

const STEPS = [
  "School & Level",
  "Duration",
  "Frequency",
  "Savings Target",
  "Payment Method",
]

const ACADEMIC_LEVELS = [
  { value: "100", label: "100 Level", sub: "Freshman Year" },
  { value: "200", label: "200 Level", sub: "Sophomore Year" },
  { value: "300", label: "300 Level", sub: "Junior Year" },
  { value: "400", label: "400 Level", sub: "Senior Year" },
  { value: "500", label: "500 Level", sub: "Final Professional Year" },
  { value: "PGD", label: "PGD", sub: "Postgraduate Diploma" },
  {
    value: "MSC",
    label: "Masters (MSc / MBA / MA)",
    sub: "Postgraduate Degree",
  },
  { value: "PHD", label: "PhD", sub: "Doctoral Programme" },
]

const DURATIONS: { value: Duration; label: string; desc: string }[] = [
  {
    value: "SIX_MONTHS",
    label: "6 Months",
    desc: "A quick sprint — great for a semester or short-term goal",
  },
  {
    value: "ONE_YEAR",
    label: "1 Year",
    desc: "Build a short-term emergency savings cushion",
  },
  {
    value: "TWO_YEARS",
    label: "2 Years",
    desc: "A medium-term plan with stronger compounding",
  },
  {
    value: "UNTIL_GRADUATION",
    label: "Until Graduation",
    desc: "Lock in savings through your entire academic journey",
  },
]

const FREQUENCIES: {
  value: Frequency
  label: string
  desc: string
  recommended?: boolean
}[] = [
  {
    value: "DAILY",
    label: "Daily",
    desc: "Small daily contributions add up fast",
  },
  {
    value: "WEEKLY",
    label: "Weekly",
    desc: "A consistent weekly rhythm — the most popular choice",
    recommended: true,
  },
  { value: "MONTHLY", label: "Monthly", desc: "Once a month, stress-free" },
  { value: "CUSTOM", label: "Custom", desc: "Set your own schedule" },
]

const PAYMENT_METHODS: {
  value: PaymentMethod
  label: string
  desc: string
  icon: React.ElementType
}[] = [
  {
    value: "WALLET",
    label: "Leadsage Wallet",
    desc: "Auto-deducted from your Leadsage balance",
    icon: IconWallet,
  },
  {
    value: "CARD",
    label: "Debit Card",
    desc: "Charged automatically on your schedule",
    icon: IconCreditCard,
  },
  {
    value: "BANK_TRANSFER",
    label: "Bank Transfer",
    desc: "Transfer directly to your dedicated savings NUBAN",
    icon: IconBuilding,
  },
]

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
]

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const TARGET_PRESETS = [300_000, 500_000, 800_000]

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n)

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"]
  const v = n % 100
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0])
}

// ── Selection Card ─────────────────────────────────────────────────────────────

function SelectCard({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border-2 p-4 text-left transition-all",
        selected
          ? "border-[#1a3d2b] bg-[#1a3d2b]/5 dark:border-green-500 dark:bg-green-950/20"
          : "border-border hover:border-[#1a3d2b]/40",
        className
      )}
    >
      {children}
    </button>
  )
}

// ── Step Components ────────────────────────────────────────────────────────────

function StepAcademicLevel({
  form,
  onChange,
}: {
  form: FormState
  onChange: (k: keyof FormState, v: any) => void
}) {
  const currentYear = new Date().getFullYear()

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">What level are you?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This determines your maximum savings duration
        </p>
      </div>

      <div className="space-y-1">
        <Label>Your school</Label>
        <Select
          value={form.schoolName}
          onValueChange={(v) => onChange("schoolName", v)}
        >
          <SelectTrigger className="max-w-sm">
            <SelectValue placeholder="Select your university" />
          </SelectTrigger>
          <SelectContent>
            {SCHOOLS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {ACADEMIC_LEVELS.map((level) => (
          <SelectCard
            key={level.value}
            selected={form.academicLevel === level.value}
            onClick={() => onChange("academicLevel", level.value)}
          >
            <div className="flex items-center gap-3">
              <IconSchool className="size-5 text-[#1a3d2b] dark:text-green-400" />
              <div>
                <p className="font-semibold">{level.label}</p>
                <p className="text-xs text-muted-foreground">{level.sub}</p>
              </div>
            </div>
          </SelectCard>
        ))}
      </div>

      <div className="space-y-1">
        <Label>Expected graduation year</Label>
        <Select
          value={form.expectedGradYear ? String(form.expectedGradYear) : ""}
          onValueChange={(v) => onChange("expectedGradYear", parseInt(v))}
        >
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 9 }, (_, i) => currentYear + i).map(
              (year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      {/* <div className="space-y-1">
        <Label>Plan name (optional)</Label>
        <Input
          value={form.planName}
          onChange={(e) => onChange("planName", e.target.value)}
          placeholder="e.g. My rent fund 🏠"
          className="max-w-sm"
        />
      </div> */}
    </div>
  )
}

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
]

function StepDuration({
  form,
  onChange,
}: {
  form: FormState
  onChange: (k: keyof FormState, v: any) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">How long do you want to save?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Longer durations earn more through compounding
        </p>
      </div>

      <div className="space-y-2">
        {DURATIONS.map((d) => (
          <SelectCard
            key={d.value}
            selected={form.duration === d.value}
            onClick={() => onChange("duration", d.value)}
          >
            <div className="flex items-center gap-3">
              <IconCalendar className="size-5 text-[#1a3d2b] dark:text-green-400" />
              <div>
                <p className="font-semibold">{d.label}</p>
                <p className="text-xs text-muted-foreground">{d.desc}</p>
              </div>
              {form.duration === d.value && (
                <IconCheck className="ml-auto size-5 text-[#1a3d2b] dark:text-green-400" />
              )}
            </div>
          </SelectCard>
        ))}
      </div>

      {form.duration === "UNTIL_GRADUATION" && (
        <div className="space-y-1">
          <Label>Expected graduation month</Label>
          <p className="text-xs text-muted-foreground">
            Which month in {form.expectedGradYear} do you graduate?
          </p>
          <Select
            value={form.expectedGradMonth ? String(form.expectedGradMonth) : ""}
            onValueChange={(v) => onChange("expectedGradMonth", parseInt(v))}
          >
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={String(m.value)}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}

function StepFrequency({
  form,
  onChange,
}: {
  form: FormState
  onChange: (k: keyof FormState, v: any) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">How often will you save?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We'll automatically move funds at your chosen frequency
        </p>
      </div>

      <div className="space-y-2">
        {FREQUENCIES.map((f) => (
          <SelectCard
            key={f.value}
            selected={form.frequency === f.value}
            onClick={() => onChange("frequency", f.value)}
            className={f.recommended ? "relative" : ""}
          >
            {f.recommended && (
              <span className="absolute top-3 right-3 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-600">
                RECOMMENDED
              </span>
            )}
            <div className="flex items-center gap-3">
              <IconRepeat className="size-5 text-[#1a3d2b] dark:text-green-400" />
              <div>
                <p className="font-semibold">{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
              {form.frequency === f.value && (
                <IconCheck className="ml-auto size-5 text-[#1a3d2b] dark:text-green-400" />
              )}
            </div>
          </SelectCard>
        ))}
      </div>

      {/* Weekly day picker */}
      {form.frequency === "WEEKLY" && (
        <div className="space-y-2">
          <Label>Preferred day</Label>
          <div className="flex gap-2">
            {WEEKDAYS.map((day, i) => (
              <button
                key={day}
                type="button"
                onClick={() => onChange("preferredDay", i + 1)}
                className={cn(
                  "flex-1 rounded-lg border py-2 text-xs font-medium transition-colors",
                  form.preferredDay === i + 1
                    ? "border-[#1a3d2b] bg-[#1a3d2b] text-white dark:border-green-500 dark:bg-green-800"
                    : "hover:border-[#1a3d2b]/40"
                )}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Monthly day picker */}
      {form.frequency === "MONTHLY" && (
        <div className="space-y-1">
          <Label>Preferred day of month</Label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex h-11 items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors hover:border-[#1a3d2b]/40",
                  form.preferredDay
                    ? "border-[#1a3d2b] text-foreground"
                    : "border-border text-muted-foreground"
                )}
              >
                <IconCalendar className="size-4 text-[#1a3d2b] dark:text-green-400" />
                {form.preferredDay
                  ? `${ordinal(form.preferredDay)} of every month`
                  : "Pick a day"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Select the day contributions are taken
              </p>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => onChange("preferredDay", day)}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-md text-xs font-medium transition-colors",
                      form.preferredDay === day
                        ? "bg-[#1a3d2b] text-white dark:bg-green-700"
                        : "hover:bg-muted"
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">
                Days 29–31 are skipped in shorter months
              </p>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Contribution amount */}
      <div className="space-y-1">
        <Label>
          Amount per {form.frequency?.toLowerCase() ?? "contribution"} (₦)
        </Label>
        <Input
          type="number"
          min={100}
          value={form.contributionAmount}
          onChange={(e) => onChange("contributionAmount", e.target.value)}
          placeholder="e.g. 5000"
          className="max-w-xs"
        />
        {form.frequency === "WEEKLY" && form.contributionAmount && (
          <p className="text-xs text-muted-foreground">
            ≈ {fmt(parseFloat(form.contributionAmount) * 52)} / year
          </p>
        )}
        {form.frequency === "MONTHLY" && form.contributionAmount && (
          <p className="text-xs text-muted-foreground">
            ≈ {fmt(parseFloat(form.contributionAmount) * 12)} / year
          </p>
        )}
      </div>
    </div>
  )
}

function StepTarget({
  form,
  onChange,
}: {
  form: FormState
  onChange: (k: keyof FormState, v: any) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Set your savings target</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Optional — helps you track progress. Skip if unsure.
        </p>
      </div>

      <div className="space-y-1">
        <Label>Target amount (₦)</Label>
        <Input
          type="number"
          min={0}
          value={form.savingsTarget}
          onChange={(e) => onChange("savingsTarget", e.target.value)}
          placeholder="0"
          className="max-w-xs"
        />
        <div className="flex gap-2 pt-1">
          {TARGET_PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onChange("savingsTarget", String(p))}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                form.savingsTarget === String(p)
                  ? "border-[#1a3d2b] bg-[#1a3d2b] text-white"
                  : "hover:border-[#1a3d2b]/40"
              )}
            >
              {fmt(p)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Rental location</Label>
        <div className="flex gap-2">
          <SelectCard
            selected={form.useCurrentCity}
            onClick={() => onChange("useCurrentCity", true)}
            className="max-w-[160px]"
          >
            <p className="text-sm font-medium">Current city</p>
          </SelectCard>
          <SelectCard
            selected={!form.useCurrentCity}
            onClick={() => onChange("useCurrentCity", false)}
            className="max-w-[160px]"
          >
            <p className="text-sm font-medium">Different city</p>
          </SelectCard>
        </div>
        {!form.useCurrentCity && (
          <Select
            value={form.rentalLocation}
            onValueChange={(v) => onChange("rentalLocation", v)}
          >
            <SelectTrigger className="max-w-sm">
              <SelectValue placeholder="Select a state" />
            </SelectTrigger>
            <SelectContent>
              {NIGERIAN_STATES.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}

function StepPaymentMethod({
  form,
  onChange,
}: {
  form: FormState
  onChange: (k: keyof FormState, v: any) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">
          How will you fund your savings?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your chosen method will be used for auto-contributions
        </p>
      </div>

      <div className="space-y-2">
        {PAYMENT_METHODS.map((m) => {
          const MethodIcon = m.icon
          return (
            <SelectCard
              key={m.value}
              selected={form.paymentMethod === m.value}
              onClick={() => onChange("paymentMethod", m.value)}
            >
              <div className="flex items-center gap-3">
                <MethodIcon className="size-5 text-[#1a3d2b] dark:text-green-400" />
                <div>
                  <p className="font-semibold">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                </div>
                {form.paymentMethod === m.value && (
                  <IconCheck className="ml-auto size-5 text-[#1a3d2b] dark:text-green-400" />
                )}
              </div>
            </SelectCard>
          )
        })}
      </div>

      {form.paymentMethod === "BANK_TRANSFER" && (
        <p className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
          After creating your plan, a dedicated bank account number (NUBAN) will
          be generated for you. Transfer funds to that account anytime and your
          balance will update instantly.
        </p>
      )}
    </div>
  )
}

// ── Commitment Modal ───────────────────────────────────────────────────────────

interface WalletInfo {
  availableBalance: number
  virtualAccountNo?: string
  virtualBankName?: string
  virtualAccountName?: string
}

function buildPayload(form: FormState) {
  return {
    schoolName: form.schoolName,
    academicLevel: form.academicLevel,
    expectedGradYear: form.expectedGradYear,
    expectedGradMonth: form.expectedGradMonth,
    duration: form.duration,
    contributionAmount: parseFloat(form.contributionAmount),
    frequency: form.frequency,
    preferredDay: form.preferredDay,
    savingsTarget: form.savingsTarget ? parseFloat(form.savingsTarget) : undefined,
    rentalLocation: form.useCurrentCity ? undefined : form.rentalLocation || undefined,
    paymentMethod: form.paymentMethod,
    planName: form.planName || undefined,
  }
}

function CommitmentModal({
  open,
  onClose,
  form,
  onDone,
}: {
  open: boolean
  onClose: () => void
  form: FormState
  onDone: (planId: string) => void
}) {
  const amount = parseFloat(form.contributionAmount) || 0
  const [tab, setTab] = useState<"wallet" | "card" | "transfer">("wallet")
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [fetchingWallet, setFetchingWallet] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cardState, setCardState] = useState<{
    planId: string
    reference: string
  } | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const loadWallet = useCallback(async () => {
    setFetchingWallet(true)
    try {
      const data = await fetchData<WalletInfo>("/wallet")
      setWallet(data)
    } catch {
      toast.error("Could not load wallet")
    } finally {
      setFetchingWallet(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      setTab("wallet")
      setCardState(null)
      loadWallet()
    }
  }, [open, loadWallet])

  const sufficient = (wallet?.availableBalance ?? 0) >= amount
  const shortfall = Math.max(0, amount - (wallet?.availableBalance ?? 0))

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  // Wallet tab: create plan + deduct first contribution
  const activateWithWallet = async () => {
    setLoading(true)
    try {
      const plan = await postData<{ id: string }>("/savings", buildPayload(form))
      await postData(`/savings/${plan.id}/deposit`, { amount })
      toast.success("Your FirstKey plan is live! First contribution deposited.")
      onDone(plan.id)
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to activate plan")
    } finally {
      setLoading(false)
    }
  }

  // Card tab: create plan → init Paystack → open in new tab
  const initiateCardPayment = async () => {
    setLoading(true)
    try {
      const plan = await postData<{ id: string }>("/savings", buildPayload(form))
      const { paymentUrl, reference } = await postData<{
        paymentUrl: string
        reference: string
      }>(`/savings/${plan.id}/deposit/card`, { amount })
      setCardState({ planId: plan.id, reference })
      window.open(paymentUrl, "_blank")
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to initialise payment")
    } finally {
      setLoading(false)
    }
  }

  const verifyCardPayment = async () => {
    if (!cardState) return
    setLoading(true)
    try {
      await postData(`/savings/${cardState.planId}/deposit/card/verify`, {
        reference: cardState.reference,
      })
      toast.success("Payment confirmed! Your FirstKey plan is live.")
      onDone(cardState.planId)
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Could not verify payment")
    } finally {
      setLoading(false)
    }
  }

  // Transfer tab: refresh balance → create plan + wallet deposit when sufficient
  const activateAfterTransfer = async () => {
    setLoading(true)
    try {
      const fresh = await fetchData<WalletInfo>("/wallet")
      setWallet(fresh)
      if (fresh.availableBalance < amount) {
        toast.error(
          `Balance still low — ₦${fmt(fresh.availableBalance)} available, ₦${fmt(amount)} needed`
        )
        return
      }
      const plan = await postData<{ id: string }>("/savings", buildPayload(form))
      await postData(`/savings/${plan.id}/deposit`, { amount })
      toast.success("Your FirstKey plan is live! First contribution deposited.")
      onDone(plan.id)
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to activate plan")
    } finally {
      setLoading(false)
    }
  }

  const TABS = [
    { key: "wallet" as const, label: "Wallet", icon: IconWallet },
    { key: "card" as const, label: "Card", icon: IconCreditCard },
    { key: "transfer" as const, label: "Bank Transfer", icon: IconBuilding },
  ]

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-[#1a3d2b]/10">
              <IconLock className="size-4 text-[#1a3d2b] dark:text-green-400" />
            </span>
            <DialogTitle>Activate your FirstKey plan</DialogTitle>
          </div>
          <DialogDescription>
            Make your first contribution of{" "}
            <span className="font-semibold text-foreground">{fmt(amount)}</span>{" "}
            to get started — it goes straight into your savings.
          </DialogDescription>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="flex gap-1 rounded-xl bg-muted p-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => { setTab(key); setCardState(null) }}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-colors",
                tab === key
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Wallet tab ── */}
        {tab === "wallet" && (
          <div className="space-y-4">
            <div className="rounded-xl border bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground">Wallet balance</p>
              {fetchingWallet ? (
                <div className="mt-1 h-7 w-28 animate-pulse rounded bg-muted" />
              ) : (
                <p className="mt-0.5 text-2xl font-bold tabular-nums">
                  {fmt(wallet?.availableBalance ?? 0)}
                </p>
              )}
            </div>

            {sufficient ? (
              <div className="space-y-2">
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  You have sufficient balance. Click below to activate.
                </p>
                <Button
                  className="w-full bg-[#1a3d2b] hover:bg-[#1a3d2b]/90"
                  onClick={activateWithWallet}
                  disabled={loading}
                >
                  {loading ? (
                    <IconLoader2 className="size-4 animate-spin" />
                  ) : (
                    <IconCheck className="size-4" />
                  )}
                  Activate — deduct {fmt(amount)}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                  You need{" "}
                  <span className="font-semibold">{fmt(shortfall)}</span> more.
                  Top up your wallet using card or bank transfer.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setTab("card")}
                  >
                    Pay by card
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setTab("transfer")}
                  >
                    Bank transfer
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Card tab ── */}
        {tab === "card" && (
          <div className="space-y-4">
            {!cardState ? (
              <>
                <div className="rounded-xl border bg-muted/40 p-4">
                  <p className="text-xs text-muted-foreground">Amount to pay</p>
                  <p className="mt-0.5 text-2xl font-bold tabular-nums">
                    {fmt(amount)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Charged once via Paystack — your plan activates immediately after.
                  </p>
                </div>
                <Button
                  className="w-full bg-[#1a3d2b] hover:bg-[#1a3d2b]/90"
                  onClick={initiateCardPayment}
                  disabled={loading}
                >
                  {loading ? (
                    <IconLoader2 className="size-4 animate-spin" />
                  ) : (
                    <IconExternalLink className="size-4" />
                  )}
                  Pay {fmt(amount)} with card
                </Button>
              </>
            ) : (
              <>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    Complete payment in the new tab
                  </p>
                  <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                    Once you've paid, click below to confirm and activate your plan.
                  </p>
                </div>
                <Button
                  className="w-full bg-[#1a3d2b] hover:bg-[#1a3d2b]/90"
                  onClick={verifyCardPayment}
                  disabled={loading}
                >
                  {loading ? (
                    <IconLoader2 className="size-4 animate-spin" />
                  ) : (
                    <IconCheck className="size-4" />
                  )}
                  I've paid — activate my plan
                </Button>
                <button
                  type="button"
                  onClick={initiateCardPayment}
                  className="w-full text-center text-xs text-muted-foreground underline-offset-2 hover:underline"
                >
                  Reopen payment page
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Transfer tab ── */}
        {tab === "transfer" && (
          <div className="space-y-4">
            <div className="rounded-xl border bg-muted/40 p-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                Transfer exactly this amount to your Leadsage wallet:
              </p>
              <div className="flex items-center justify-between">
                <p className="text-xl font-bold tabular-nums">{fmt(amount)}</p>
                <button
                  type="button"
                  onClick={() => copy(String(amount), "amount")}
                  className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-muted"
                >
                  {copied === "amount" ? (
                    <IconCheck className="size-3 text-emerald-500" />
                  ) : (
                    <IconCopy className="size-3" />
                  )}
                  Copy
                </button>
              </div>

              {wallet?.virtualAccountNo ? (
                <div className="space-y-1.5 pt-1 border-t">
                  <p className="text-xs text-muted-foreground">Account details</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold tabular-nums tracking-wide">
                        {wallet.virtualAccountNo}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {wallet.virtualBankName} · {wallet.virtualAccountName}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copy(wallet.virtualAccountNo!, "nuban")}
                      className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-muted"
                    >
                      {copied === "nuban" ? (
                        <IconCheck className="size-3 text-emerald-500" />
                      ) : (
                        <IconCopy className="size-3" />
                      )}
                      Copy
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground pt-1 border-t">
                  Complete wallet KYC to get your account number.
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadWallet}
                disabled={fetchingWallet || loading}
                className="gap-1.5"
              >
                <IconRefresh
                  className={cn("size-3.5", fetchingWallet && "animate-spin")}
                />
                Refresh balance
              </Button>
              {wallet && (
                <p className="self-center text-xs text-muted-foreground">
                  {fmt(wallet.availableBalance)} available
                </p>
              )}
            </div>

            <Button
              className="w-full bg-[#1a3d2b] hover:bg-[#1a3d2b]/90"
              onClick={activateAfterTransfer}
              disabled={loading || (wallet?.availableBalance ?? 0) < amount}
            >
              {loading ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : (
                <IconCheck className="size-4" />
              )}
              I've transferred — activate my plan
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function NewSavingsPlan() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [showCommitModal, setShowCommitModal] = useState(false)
  const [form, setForm] = useState<FormState>({
    schoolName: "",
    academicLevel: "",
    expectedGradYear: new Date().getFullYear() + 2,
    expectedGradMonth: undefined,
    duration: "",
    contributionAmount: "",
    frequency: "",
    preferredDay: undefined,
    savingsTarget: "",
    rentalLocation: "",
    useCurrentCity: true,
    paymentMethod: "",
    planName: "",
  })

  const onChange = (k: keyof FormState, v: any) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  const canProceed = (): boolean => {
    if (step === 0)
      return (
        !!form.schoolName &&
        !!form.academicLevel &&
        form.expectedGradYear > 2020
      )
    if (step === 1)
      return (
        !!form.duration &&
        (form.duration !== "UNTIL_GRADUATION" || !!form.expectedGradMonth)
      )
    if (step === 2)
      return (
        !!form.frequency &&
        !!form.contributionAmount &&
        parseFloat(form.contributionAmount) >= 100
      )
    if (step === 3) return true // target is optional
    if (step === 4) return !!form.paymentMethod
    return false
  }

  const handleDone = (planId: string) => {
    setShowCommitModal(false)
    router.push(`/firstkey/${planId}`)
  }

  const steps = [
    <StepAcademicLevel key="level" form={form} onChange={onChange} />,
    <StepDuration key="duration" form={form} onChange={onChange} />,
    <StepFrequency key="freq" form={form} onChange={onChange} />,
    <StepTarget key="target" form={form} onChange={onChange} />,
    <StepPaymentMethod key="payment" form={form} onChange={onChange} />,
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        {step > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setStep((s) => s - 1)}
          >
            <IconArrowLeft className="size-5" />
          </Button>
        )}
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Step {step + 1} of {STEPS.length} · {STEPS[step]}
          </p>
          <h1 className="text-lg font-bold">Create FirstKey Plan</h1>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i <= step ? "bg-[#1a3d2b] dark:bg-green-500" : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Step content */}
      <div>{steps[step]}</div>

      {/* Navigation */}
      <div className="flex justify-end">
        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
          >
            Continue
            <IconArrowRight className="size-4" />
          </Button>
        ) : (
          <Button onClick={() => setShowCommitModal(true)} disabled={!canProceed()}>
            <IconLock className="size-4" />
            Activate Plan
          </Button>
        )}
      </div>

      <CommitmentModal
        open={showCommitModal}
        onClose={() => setShowCommitModal(false)}
        form={form}
        onDone={handleDone}
      />
    </div>
  )
}
