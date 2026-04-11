"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  IconLoader2,
  IconUser,
  IconBriefcase,
  IconUsers,
  IconHome,
  IconChevronRight,
  IconChevronLeft,
  IconCircleCheck,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { postData, publicFetch } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ── Types ──────────────────────────────────────────────────────────────────────

interface ListingPreview {
  id: string
  title: string
  area: string
  state: string
  pricePerYear: number | null
  photos: string[]
}

// ── Step config ────────────────────────────────────────────────────────────────

const STEPS = [
  { id: "tenancy", label: "Tenancy Intent", icon: IconHome },
  { id: "identity", label: "Identity (NIN)", icon: IconUser },
  { id: "employment", label: "Employment", icon: IconBriefcase },
  { id: "references", label: "References", icon: IconUsers },
  { id: "review", label: "Review & Submit", icon: IconCircleCheck },
]

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n)

// ── Main Component ─────────────────────────────────────────────────────────────

export function ScreeningForm() {
  const router = useRouter()
  const params = useSearchParams()
  const listingId = params.get("listingId") ?? ""
  const tourId = params.get("tourId") ?? ""

  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [listing, setListing] = useState<ListingPreview | null>(null)
  const [listingLoading, setListingLoading] = useState(true)

  // ── Form state ───────────────────────────────────────────────────────────────

  const [moveInDate, setMoveInDate] = useState("")
  const [tenancyMonths, setTenancyMonths] = useState("")
  const [reasonForMoving, setReasonForMoving] = useState("")
  const [message, setMessage] = useState("")

  const [nin, setNin] = useState("")

  const [employmentStatus, setEmploymentStatus] = useState("")
  const [employer, setEmployer] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [monthlyIncome, setMonthlyIncome] = useState("")
  const [employmentDocUrl, setEmploymentDocUrl] = useState("")

  const [ref1Name, setRef1Name] = useState("")
  const [ref1Phone, setRef1Phone] = useState("")
  const [ref1Relation, setRef1Relation] = useState("")
  const [ref2Name, setRef2Name] = useState("")
  const [ref2Phone, setRef2Phone] = useState("")
  const [ref2Relation, setRef2Relation] = useState("")

  useEffect(() => {
    if (!listingId) return
    publicFetch<ListingPreview>(`/listings/public/${listingId}`)
      .then((d) => setListing(d))
      .catch(() => {})
      .finally(() => setListingLoading(false))
  }, [listingId])

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const app = await postData("/user/applications/screening", {
        listingId,
        tourRequestId: tourId || undefined,
        moveInDate: moveInDate || undefined,
        tenancyMonths: tenancyMonths ? Number(tenancyMonths) : undefined,
        reasonForMoving: reasonForMoving || undefined,
        message: message || undefined,
        nin: nin || undefined,
        employmentStatus: employmentStatus || undefined,
        employer: employer || undefined,
        jobTitle: jobTitle || undefined,
        monthlyIncome: monthlyIncome ? Number(monthlyIncome) : undefined,
        employmentDocUrl: employmentDocUrl || undefined,
        ref1Name: ref1Name || undefined,
        ref1Phone: ref1Phone || undefined,
        ref1Relation: ref1Relation || undefined,
        ref2Name: ref2Name || undefined,
        ref2Phone: ref2Phone || undefined,
        ref2Relation: ref2Relation || undefined,
      })
      toast.success(
        "Application submitted! You'll be notified of the review outcome."
      )
      router.push(`/applications/${(app as any).id}`)
    } catch (err: any) {
      const msg = err?.response?.data?.message
      toast.error(
        typeof msg === "string" ? msg : "Failed to submit application"
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (!listingId) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">No listing specified.</p>
        <Button variant="outline" onClick={() => router.push("/listings")}>
          Browse listings
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        back
        title="Rental Application"
        description="Complete your screening application for this property"
      />

      {/* Listing preview */}
      {listing && (
        <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
          {listing.photos[0] && (
            <div className="relative size-12 flex-shrink-0 overflow-hidden rounded-lg">
              <img
                src={listing.photos[0]}
                alt={listing.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{listing.title}</p>
            <p className="text-xs text-muted-foreground">
              {listing.area}, {listing.state}
              {listing.pricePerYear && ` · ${fmt(listing.pricePerYear)}/yr`}
            </p>
          </div>
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const done = i < step
          const active = i === step
          return (
            <div key={s.id} className="flex items-center gap-1">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : done
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="size-3.5" />
                {s.label}
              </button>
              {i < STEPS.length - 1 && (
                <IconChevronRight className="size-4 shrink-0 text-muted-foreground" />
              )}
            </div>
          )
        })}
      </div>

      {/* Step content */}
      <Card>
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-base">{STEPS[step].label}</CardTitle>
        </CardHeader>
        <CardContent className="">
          {step === 0 && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Preferred move-in date</Label>
                  <Input
                    type="date"
                    value={moveInDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setMoveInDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Tenancy duration (months)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 12"
                    min={1}
                    value={tenancyMonths}
                    onChange={(e) => setTenancyMonths(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Reason for moving</Label>
                <Textarea
                  placeholder="Why are you looking for a new place?"
                  rows={3}
                  value={reasonForMoving}
                  onChange={(e) => setReasonForMoving(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Message to landlord (optional)</Label>
                <Textarea
                  placeholder="Introduce yourself — who you are, household size, lifestyle…"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your NIN will be verified with NIMC to confirm your identity. It
                will be kept securely and used only for this application.
              </p>
              <div className="space-y-1.5">
                <Label>National Identification Number (NIN)</Label>
                <Input
                  placeholder="Enter your 11-digit NIN"
                  maxLength={11}
                  value={nin}
                  onChange={(e) => setNin(e.target.value.replace(/\D/g, ""))}
                />
                <p className="text-xs text-muted-foreground">
                  Your NIN will be verified by the admin during the review
                  process.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Employment status</Label>
                <Select
                  value={employmentStatus}
                  onValueChange={setEmploymentStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employed">Employed</SelectItem>
                    <SelectItem value="self-employed">Self-employed</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="unemployed">Unemployed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {["employed", "self-employed"].includes(employmentStatus) && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Employer / Company name</Label>
                      <Input
                        placeholder="e.g. Dangote Group"
                        value={employer}
                        onChange={(e) => setEmployer(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Job title</Label>
                      <Input
                        placeholder="e.g. Software Engineer"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Monthly income (₦)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 500000"
                      min={0}
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Employment letter / payslip URL (optional)</Label>
                    <Input
                      placeholder="https://..."
                      value={employmentDocUrl}
                      onChange={(e) => setEmploymentDocUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload to Google Drive or Dropbox and paste the shareable
                      link.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Provide two references who can vouch for your character and
                reliability as a tenant.
              </p>

              {/* Reference 1 */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Reference 1</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label>Full name</Label>
                    <Input
                      placeholder="John Doe"
                      value={ref1Name}
                      onChange={(e) => setRef1Name(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone number</Label>
                    <Input
                      placeholder="0801 234 5678"
                      value={ref1Phone}
                      onChange={(e) => setRef1Phone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Relationship</Label>
                    <Input
                      placeholder="e.g. Colleague, Landlord"
                      value={ref1Relation}
                      onChange={(e) => setRef1Relation(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Reference 2 */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Reference 2</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label>Full name</Label>
                    <Input
                      placeholder="Jane Smith"
                      value={ref2Name}
                      onChange={(e) => setRef2Name(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone number</Label>
                    <Input
                      placeholder="0812 345 6789"
                      value={ref2Phone}
                      onChange={(e) => setRef2Phone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Relationship</Label>
                    <Input
                      placeholder="e.g. Family friend"
                      value={ref2Relation}
                      onChange={(e) => setRef2Relation(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-sm">
              <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                <ReviewRow label="Move-in date" value={moveInDate || "—"} />
                <ReviewRow
                  label="Tenancy duration"
                  value={tenancyMonths ? `${tenancyMonths} months` : "—"}
                />
                <ReviewRow
                  label="NIN"
                  value={nin ? `${nin.slice(0, 3)}••••••••` : "—"}
                />
                <ReviewRow label="Employment" value={employmentStatus || "—"} />
                {employer && <ReviewRow label="Employer" value={employer} />}
                {monthlyIncome && (
                  <ReviewRow
                    label="Monthly income"
                    value={fmt(Number(monthlyIncome))}
                  />
                )}
                {ref1Name && (
                  <ReviewRow
                    label="Reference 1"
                    value={`${ref1Name} (${ref1Relation || "—"})`}
                  />
                )}
                {ref2Name && (
                  <ReviewRow
                    label="Reference 2"
                    value={`${ref2Name} (${ref2Relation || "—"})`}
                  />
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                By submitting, you confirm that all information provided is
                accurate. Your NIN will be verified and your application
                reviewed by the landlord and Leadsage.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
        >
          <IconChevronLeft className="size-4" />
          Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)}>
            Next
            <IconChevronRight className="size-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting || !listingId}>
            {submitting && <IconLoader2 className="size-4 animate-spin" />}
            Submit Application
          </Button>
        )}
      </div>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}
