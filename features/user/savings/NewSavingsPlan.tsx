"use client"

import { useState } from "react"
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
} from "@tabler/icons-react"
import { toast } from "sonner"

import { postData } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// ── Types ──────────────────────────────────────────────────────────────────────

type Duration = "ONE_YEAR" | "TWO_YEARS" | "UNTIL_GRADUATION"
type Frequency = "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM"
type PaymentMethod = "WALLET" | "CARD" | "BANK_TRANSFER"

interface FormState {
  academicLevel: string
  expectedGradYear: number
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

const STEPS = [
  "Academic Level",
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
]

const DURATIONS: { value: Duration; label: string; desc: string }[] = [
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

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const TARGET_PRESETS = [300_000, 500_000, 800_000]

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n)

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
        <Input
          type="number"
          min={currentYear}
          max={currentYear + 8}
          value={form.expectedGradYear || ""}
          onChange={(e) =>
            onChange("expectedGradYear", parseInt(e.target.value))
          }
          placeholder={String(currentYear + 2)}
          className="max-w-xs"
        />
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
          <Input
            type="number"
            min={1}
            max={28}
            value={form.preferredDay ?? ""}
            onChange={(e) => onChange("preferredDay", parseInt(e.target.value))}
            placeholder="e.g. 1 (first of the month)"
            className="max-w-xs"
          />
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
          <Input
            value={form.rentalLocation}
            onChange={(e) => onChange("rentalLocation", e.target.value)}
            placeholder="e.g. Lagos Island"
            className="max-w-sm"
          />
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

// ── Main Component ─────────────────────────────────────────────────────────────

export function NewSavingsPlan() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<FormState>({
    academicLevel: "",
    expectedGradYear: new Date().getFullYear() + 2,
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
    if (step === 0) return !!form.academicLevel && form.expectedGradYear > 2020
    if (step === 1) return !!form.duration
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

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const payload = {
        academicLevel: form.academicLevel,
        expectedGradYear: form.expectedGradYear,
        duration: form.duration,
        contributionAmount: parseFloat(form.contributionAmount),
        frequency: form.frequency,
        preferredDay: form.preferredDay,
        savingsTarget: form.savingsTarget
          ? parseFloat(form.savingsTarget)
          : undefined,
        rentalLocation: form.useCurrentCity
          ? undefined
          : form.rentalLocation || undefined,
        paymentMethod: form.paymentMethod,
        planName: form.planName || undefined,
      }

      const plan = await postData<{ id: string }>("/savings", payload)
      toast.success("Your FirstKey savings plan is ready!")
      router.push(`/firstkey/${plan.id}`)
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to create plan")
      setSubmitting(false)
    }
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
          <Button onClick={handleSubmit} disabled={!canProceed() || submitting}>
            {submitting ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : (
              <IconCheck className="size-4" />
            )}
            {submitting ? "Creating…" : "Create Plan"}
          </Button>
        )}
      </div>
    </div>
  )
}
