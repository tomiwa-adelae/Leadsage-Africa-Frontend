"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import axios from "axios"
import {
  IconUser,
  IconMapPin,
  IconHome,
  IconShieldCheck,
  IconCheck,
  IconChevronRight,
  IconChevronLeft,
  IconLoader2,
  IconUpload,
  IconX,
  IconBadge,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import api, { uploadFile } from "@/lib/api"
import { useAuth } from "@/store/useAuth"
import { Logo } from "@/components/Logo"
import {
  NIGERIAN_STATES,
  RENTER_PROPERTY_TYPES,
  LANDLORD_PROPERTY_TYPES,
  BUDGET_BANDS,
  MOVE_IN_TIMELINES,
  PROPERTY_COUNTS,
  GENDERS,
  type BudgetBand,
} from "./data"

// ── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  // Step 1 — Personal info
  gender: string
  dob: string
  imageUrl: string
  // Step 2 — Location
  country: string
  state: string
  city: string
  address: string
  // Step 3a — CLIENT preferences
  preferredPropertyTypes: string[]
  budgetMin: number | null
  budgetMax: number | null
  preferredAreas: string[]
  moveInTimeline: string
  // Step 3b — LANDLORD property details
  hasExistingProperty: boolean | null
  propertyCount: string
  managedPropertyTypes: string[]
  operatingAreas: string[]
  // Step 4 — LANDLORD NIN
  nin: string
  ninVerified: boolean
}

const INITIAL: FormData = {
  gender: "",
  dob: "",
  imageUrl: "",
  country: "Nigeria",
  state: "",
  city: "",
  address: "",
  preferredPropertyTypes: [],
  budgetMin: null,
  budgetMax: null,
  preferredAreas: [],
  moveInTimeline: "",
  hasExistingProperty: null,
  propertyCount: "",
  managedPropertyTypes: [],
  operatingAreas: [],
  nin: "",
  ninVerified: false,
}

// ── Step config ───────────────────────────────────────────────────────────────

const CLIENT_STEPS = [
  { label: "Personal info", icon: IconUser },
  { label: "Location", icon: IconMapPin },
  { label: "Preferences", icon: IconHome },
]

const LANDLORD_STEPS = [
  { label: "Personal info", icon: IconUser },
  { label: "Location", icon: IconMapPin },
  { label: "Your properties", icon: IconHome },
  { label: "Verification", icon: IconShieldCheck },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

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
        "flex items-center gap-2 rounded-lg border-2 px-3 py-2.5 text-left text-sm transition-all",
        selected
          ? "border-primary bg-primary/5 font-medium text-primary"
          : "border-border text-foreground hover:border-primary/40 hover:bg-muted/50",
        className
      )}
    >
      {children}
    </button>
  )
}

function TagInput({
  tags,
  onChange,
  placeholder,
  max = 6,
}: {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  max?: number
}) {
  const [input, setInput] = useState("")

  function add() {
    const val = input.trim()
    if (!val || tags.includes(val) || tags.length >= max) return
    onChange([...tags, val])
    setInput("")
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault()
              add()
            }
          }}
          placeholder={placeholder ?? "Type and press Enter"}
          className="flex-1"
          disabled={tags.length >= max}
        />
        <Button
          type="button"
          variant="outline"
          onClick={add}
          disabled={tags.length >= max}
        >
          Add
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(tags.filter((t) => t !== tag))}
                className="ml-0.5 text-primary/70 hover:text-primary"
              >
                <IconX className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        {tags.length}/{max} areas added
      </p>
    </div>
  )
}

// ── Step 1: Personal Info ─────────────────────────────────────────────────────

function PersonalInfoStep({
  data,
  onChange,
  userId,
}: {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
  userId: string
}) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await uploadFile<{ imageUrl: string }>(
        `/upload/profile/${userId}`,
        form
      )
      onChange({ imageUrl: res.imageUrl })
      toast.success("Photo uploaded!")
    } catch {
      toast.error("Failed to upload photo. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const initials =
    useAuth.getState().user?.firstName?.charAt(0).toUpperCase() ?? "U"

  return (
    <div className="space-y-6">
      {/* Photo upload */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative size-20 overflow-hidden rounded-full border-2 border-dashed border-border bg-muted transition-colors hover:border-primary/50"
          disabled={uploading}
        >
          {data.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.imageUrl}
              alt="Profile"
              className="size-full object-cover"
            />
          ) : (
            <span className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground">
              {uploading ? (
                <IconLoader2 className="size-5 animate-spin" />
              ) : (
                <>
                  {
                    <span className="text-xl font-bold text-foreground">
                      {initials}
                    </span>
                  }
                  <IconUpload className="size-3" />
                </>
              )}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-xs text-primary hover:underline"
          disabled={uploading}
        >
          {uploading
            ? "Uploading…"
            : data.imageUrl
              ? "Change photo"
              : "Upload photo (optional)"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <Label>Gender</Label>
        <div className="grid grid-cols-3 gap-2">
          {GENDERS.map((g) => (
            <SelectCard
              key={g}
              selected={data.gender === g}
              onClick={() => onChange({ gender: g })}
            >
              {data.gender === g && <IconCheck className="size-3.5 shrink-0" />}
              <span className="text-xs">{g}</span>
            </SelectCard>
          ))}
        </div>
      </div>

      {/* Date of birth */}
      <div className="space-y-2">
        <Label htmlFor="dob">Date of birth</Label>
        <Input
          id="dob"
          type="date"
          value={data.dob}
          onChange={(e) => onChange({ dob: e.target.value })}
          max={
            new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0]
          }
        />
        <p className="text-xs text-muted-foreground">
          You must be at least 18 years old
        </p>
      </div>
    </div>
  )
}

// ── Step 2: Location ──────────────────────────────────────────────────────────

function LocationStep({
  data,
  onChange,
}: {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
}) {
  return (
    <div className="space-y-4">
      {/* Country */}
      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Input
          id="country"
          value={data.country}
          onChange={(e) => onChange({ country: e.target.value })}
          placeholder="Nigeria"
        />
      </div>

      {/* State */}
      <div className="space-y-2">
        <Label htmlFor="state">State</Label>
        <select
          id="state"
          value={data.state}
          onChange={(e) => onChange({ state: e.target.value })}
          className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
        >
          <option value="">Select a state</option>
          {NIGERIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* City */}
      <div className="space-y-2">
        <Label htmlFor="city">City / LGA</Label>
        <Input
          id="city"
          value={data.city}
          onChange={(e) => onChange({ city: e.target.value })}
          placeholder="e.g. Victoria Island, Yaba"
        />
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">
          Street address{" "}
          <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="address"
          value={data.address}
          onChange={(e) => onChange({ address: e.target.value })}
          placeholder="e.g. 14 Adeola Odeku Street"
        />
      </div>
    </div>
  )
}

// ── Step 3a: CLIENT Preferences ───────────────────────────────────────────────

function PreferencesStep({
  data,
  onChange,
}: {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
}) {
  function togglePropertyType(t: string) {
    const types = data.preferredPropertyTypes.includes(t)
      ? data.preferredPropertyTypes.filter((x) => x !== t)
      : [...data.preferredPropertyTypes, t]
    onChange({ preferredPropertyTypes: types })
  }

  function selectBudget(band: BudgetBand) {
    onChange({ budgetMin: band.min, budgetMax: band.max })
  }

  const activeBand = BUDGET_BANDS.find(
    (b) => b.min === data.budgetMin && b.max === data.budgetMax
  )

  return (
    <div className="space-y-6">
      {/* Property types */}
      <div className="space-y-2">
        <Label>Property types you&apos;re interested in</Label>
        <p className="text-xs text-muted-foreground">Select all that apply</p>
        <div className="grid grid-cols-2 gap-2">
          {RENTER_PROPERTY_TYPES.map((t) => (
            <SelectCard
              key={t}
              selected={data.preferredPropertyTypes.includes(t)}
              onClick={() => togglePropertyType(t)}
            >
              {data.preferredPropertyTypes.includes(t) && (
                <IconCheck className="size-3.5 shrink-0" />
              )}
              <span className="text-xs">{t}</span>
            </SelectCard>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="space-y-2">
        <Label>Annual rent budget</Label>
        <div className="grid grid-cols-1 gap-2">
          {BUDGET_BANDS.map((band) => (
            <SelectCard
              key={band.label}
              selected={activeBand?.label === band.label}
              onClick={() => selectBudget(band)}
            >
              {activeBand?.label === band.label && (
                <IconCheck className="size-3.5 shrink-0" />
              )}
              <span className="text-xs">{band.label}</span>
            </SelectCard>
          ))}
        </div>
      </div>

      {/* Preferred areas */}
      <div className="space-y-2">
        <Label>Preferred areas / neighbourhoods</Label>
        <p className="text-xs text-muted-foreground">
          Add up to 6 locations (e.g. Lekki, VI, Surulere)
        </p>
        <TagInput
          tags={data.preferredAreas}
          onChange={(tags) => onChange({ preferredAreas: tags })}
          placeholder="Type a location and press Enter"
        />
      </div>

      {/* Move-in timeline */}
      <div className="space-y-2">
        <Label>When do you want to move in?</Label>
        <div className="grid grid-cols-2 gap-2">
          {MOVE_IN_TIMELINES.map((t) => (
            <SelectCard
              key={t}
              selected={data.moveInTimeline === t}
              onClick={() => onChange({ moveInTimeline: t })}
            >
              {data.moveInTimeline === t && (
                <IconCheck className="size-3.5 shrink-0" />
              )}
              <span className="text-xs">{t}</span>
            </SelectCard>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Step 3b: LANDLORD Property Details ───────────────────────────────────────

function PropertyDetailsStep({
  data,
  onChange,
}: {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
}) {
  function toggleType(t: string) {
    const types = data.managedPropertyTypes.includes(t)
      ? data.managedPropertyTypes.filter((x) => x !== t)
      : [...data.managedPropertyTypes, t]
    onChange({ managedPropertyTypes: types })
  }

  return (
    <div className="space-y-6">
      {/* Has existing property */}
      <div className="space-y-2">
        <Label>Do you have an existing property to list?</Label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Yes, I have one", value: true },
            { label: "Not yet", value: false },
          ].map(({ label, value }) => (
            <SelectCard
              key={label}
              selected={data.hasExistingProperty === value}
              onClick={() => onChange({ hasExistingProperty: value })}
            >
              {data.hasExistingProperty === value && (
                <IconCheck className="size-3.5 shrink-0" />
              )}
              <span className="text-xs">{label}</span>
            </SelectCard>
          ))}
        </div>
      </div>

      {/* Property count — show only if they have properties */}
      {data.hasExistingProperty && (
        <div className="space-y-2">
          <Label>How many properties do you manage?</Label>
          <div className="grid grid-cols-4 gap-2">
            {PROPERTY_COUNTS.map((c) => (
              <SelectCard
                key={c}
                selected={data.propertyCount === c}
                onClick={() => onChange({ propertyCount: c })}
              >
                <span className="w-full text-center text-xs">{c}</span>
              </SelectCard>
            ))}
          </div>
        </div>
      )}

      {/* Property types managed */}
      <div className="space-y-2">
        <Label>Property types you manage</Label>
        <p className="text-xs text-muted-foreground">Select all that apply</p>
        <div className="grid grid-cols-2 gap-2">
          {LANDLORD_PROPERTY_TYPES.map((t) => (
            <SelectCard
              key={t}
              selected={data.managedPropertyTypes.includes(t)}
              onClick={() => toggleType(t)}
            >
              {data.managedPropertyTypes.includes(t) && (
                <IconCheck className="size-3.5 shrink-0" />
              )}
              <span className="text-xs">{t}</span>
            </SelectCard>
          ))}
        </div>
      </div>

      {/* Operating areas */}
      <div className="space-y-2">
        <Label>Areas you operate in</Label>
        <p className="text-xs text-muted-foreground">
          Add up to 6 locations (e.g. Lekki, Ajah, Ikeja)
        </p>
        <TagInput
          tags={data.operatingAreas}
          onChange={(tags) => onChange({ operatingAreas: tags })}
          placeholder="Type a location and press Enter"
        />
      </div>
    </div>
  )
}

// ── Step 4: NIN Verification ──────────────────────────────────────────────────

function NinVerificationStep({
  data,
  onChange,
}: {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
}) {
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState("")

  const isComplete = data.nin.length === 11

  async function handleVerify() {
    if (!isComplete) return
    setVerifying(true)
    setError("")
    try {
      const res = await api.post<{ verified: boolean; message: string }>(
        "/auth/verify-nin",
        { nin: data.nin }
      )
      if (res.data.verified) {
        onChange({ ninVerified: true })
        toast.success("NIN verified successfully!")
      } else {
        setError(
          res.data.message ??
            "NIN could not be verified. Check the number and try again."
        )
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ??
            "Verification failed. Please try again."
        )
      } else {
        setError("Something went wrong. Please try again.")
      }
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-medium">Why we need your NIN</p>
        <p className="mt-1 text-amber-700">
          Your National Identification Number helps us verify your identity and
          gives renters confidence that you&apos;re a legitimate landlord. This
          earns you a <strong>Verified</strong> badge on your listings.
        </p>
      </div>

      <div className="space-y-3">
        <Label htmlFor="nin">National Identification Number (NIN)</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="nin"
              value={data.nin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 11)
                onChange({ nin: val, ninVerified: false })
                setError("")
              }}
              placeholder="Enter your 11-digit NIN"
              maxLength={11}
              className={cn(
                "pr-16",
                data.ninVerified &&
                  "border-green-500 focus-visible:ring-green-500"
              )}
              disabled={data.ninVerified}
            />
            <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">
              {data.nin.length}/11
            </span>
          </div>
          {data.ninVerified ? (
            <div className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 text-sm font-medium text-green-700">
              <IconBadge className="size-4" />
              Verified
            </div>
          ) : (
            <Button
              type="button"
              onClick={handleVerify}
              disabled={!isComplete || verifying}
              variant="outline"
            >
              {verifying ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : (
                "Verify"
              )}
            </Button>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <p className="text-xs text-muted-foreground">
          Your NIN is encrypted and stored securely. We never share it with
          third parties.
        </p>
      </div>
    </div>
  )
}

// ── Done Screen ───────────────────────────────────────────────────────────────

function DoneStep({ role }: { role: string }) {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
        <IconCheck className="size-10 text-primary" strokeWidth={2.5} />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          You&apos;re all set!
        </h2>
        <p className="mx-auto max-w-xs text-muted-foreground">
          {role === "LANDLORD"
            ? "Your account is ready. Start listing your properties and connect with verified renters."
            : "Your account is ready. Start browsing thousands of verified properties across Nigeria."}
        </p>
      </div>

      <Button
        className="w-full max-w-xs"
        onClick={() =>
          router.push(
            role === "LANDLORD" ? "/landlord/dashboard" : "/dashboard"
          )
        }
      >
        {role === "LANDLORD" ? "Go to landlord dashboard" : "Browse listings"}
        <IconChevronRight className="ml-1 size-4" />
      </Button>
    </div>
  )
}

// ── Wizard Orchestrator ───────────────────────────────────────────────────────

export function OnboardingWizard() {
  const user = useAuth((s) => s.user)
  const setUser = useAuth((s) => s.setUser)
  const role = user?.role ?? "CLIENT"

  const steps = role === "LANDLORD" ? LANDLORD_STEPS : CLIENT_STEPS
  const totalContentSteps = steps.length // excludes done screen

  const [step, setStep] = useState(0) // 0-indexed content steps; totalContentSteps = done
  const [formData, setFormData] = useState<FormData>(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [direction, setDirection] = useState<"forward" | "back">("forward")

  const isDone = step === totalContentSteps

  function patch(p: Partial<FormData>) {
    setFormData((prev) => ({ ...prev, ...p }))
  }

  function goBack() {
    setDirection("back")
    setStep((s) => Math.max(0, s - 1))
  }

  function goForward() {
    setDirection("forward")
    setStep((s) => s + 1)
  }

  async function submit(data: FormData) {
    setSubmitting(true)
    try {
      const payload = {
        gender: data.gender || undefined,
        dob: data.dob || undefined,
        country: data.country || undefined,
        state: data.state || undefined,
        city: data.city || undefined,
        address: data.address || undefined,
        ...(role === "CLIENT"
          ? {
              preferredPropertyTypes: data.preferredPropertyTypes,
              budgetMin: data.budgetMin ?? undefined,
              budgetMax: data.budgetMax ?? undefined,
              preferredAreas: data.preferredAreas,
              moveInTimeline: data.moveInTimeline || undefined,
            }
          : {
              hasExistingProperty: data.hasExistingProperty ?? undefined,
              propertyCount: data.propertyCount || undefined,
              managedPropertyTypes: data.managedPropertyTypes,
              operatingAreas: data.operatingAreas,
              nin: data.nin || undefined,
              ninVerified: data.ninVerified,
            }),
      }

      const { data: updatedUser } = await api.patch("/auth/onboarding", payload)
      setUser({ ...user!, ...updatedUser, onboardingCompleted: true })
      goForward() // → done screen
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(
          err.response?.data?.message ??
            "Something went wrong. Please try again."
        )
      } else {
        toast.error("Something went wrong. Please try again.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function skipAll() {
    await submit({ ...INITIAL })
  }

  function handleContinue() {
    // Last content step → submit, then show done
    if (step === totalContentSteps - 1) {
      submit(formData)
    } else {
      goForward()
    }
  }

  const progress = isDone ? 100 : Math.round((step / totalContentSteps) * 100)

  // ── Render ────────────────────────────────────────────────────────────────

  const stepLabel = isDone ? "Complete" : (steps[step]?.label ?? "")
  const stepNum = isDone ? totalContentSteps : step + 1

  return (
    <div className="container flex min-h-screen flex-col bg-background">
      {/* ── Header ── */}
      {!isDone && (
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between py-4">
            <Logo color="green" />
            <span className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{stepLabel}</span>
              {" · "}Step {stepNum} of {totalContentSteps}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1 w-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>
      )}

      {/* ── Body ── */}
      <main className="container w-full flex-1 py-10">
        {isDone ? (
          <DoneStep role={role} />
        ) : (
          <div
            key={`${step}-${direction}`}
            className={cn(
              "animate-in duration-300 fade-in-0",
              direction === "forward"
                ? "slide-in-from-right-4"
                : "slide-in-from-left-4"
            )}
          >
            {/* Step heading */}
            <div className="mb-8 space-y-1">
              <h1 className="text-2xl font-bold text-foreground">
                {step === 0 && "Tell us about yourself"}
                {step === 1 && "Where are you based?"}
                {step === 2 && role === "CLIENT" && "What are you looking for?"}
                {step === 2 && role === "LANDLORD" && "About your properties"}
                {step === 3 && role === "LANDLORD" && "Verify your identity"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {step === 0 &&
                  "Help us personalise your experience. All fields are optional."}
                {step === 1 &&
                  "We use this to show you relevant listings and landlords."}
                {step === 2 &&
                  role === "CLIENT" &&
                  "We'll use this to match you with properties you'll love."}
                {step === 2 &&
                  role === "LANDLORD" &&
                  "Tell us about the properties you manage or plan to list."}
                {step === 3 &&
                  role === "LANDLORD" &&
                  "Verified landlords get a trust badge and higher visibility."}
              </p>
            </div>

            {/* Step content */}
            {step === 0 && (
              <PersonalInfoStep
                data={formData}
                onChange={patch}
                userId={user?.id ?? ""}
              />
            )}
            {step === 1 && <LocationStep data={formData} onChange={patch} />}
            {step === 2 && role === "CLIENT" && (
              <PreferencesStep data={formData} onChange={patch} />
            )}
            {step === 2 && role === "LANDLORD" && (
              <PropertyDetailsStep data={formData} onChange={patch} />
            )}
            {step === 3 && role === "LANDLORD" && (
              <NinVerificationStep data={formData} onChange={patch} />
            )}

            {/* ── Footer actions ── */}
            <div className="mt-10 space-y-4">
              <div className="flex gap-3">
                {step > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goBack}
                    disabled={submitting}
                    className="flex-1"
                  >
                    <IconChevronLeft className="mr-1 size-4" />
                    Back
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleContinue}
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <IconLoader2 className="mr-2 size-4 animate-spin" />
                      Saving…
                    </>
                  ) : step === totalContentSteps - 1 ? (
                    "Complete setup"
                  ) : (
                    <>
                      Continue
                      <IconChevronRight className="ml-1 size-4" />
                    </>
                  )}
                </Button>
              </div>

              {/* Skip options */}
              {step === 0 ? (
                <button
                  type="button"
                  onClick={skipAll}
                  disabled={submitting}
                  className="w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Skip all and go to dashboard →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={submitting}
                  className="w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {step === totalContentSteps - 1
                    ? "Skip and complete setup"
                    : "Skip this step →"}
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
