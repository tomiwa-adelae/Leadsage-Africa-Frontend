"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { toast } from "sonner"
import {
  IconLoader2,
  IconArrowLeft,
  IconArrowRight,
  IconCircleCheckFilled,
  IconClockHour4,
  IconStar,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { StepIndicator } from "./StepIndicator"
import { Step1PropertyType } from "./Step1PropertyType"
import { Step2BasicInfo } from "./Step2BasicInfo"
import { Step3Location } from "./Step3Location"
import { Step4Details } from "./Step4Details"
import { Step5Pricing } from "./Step5Pricing"
import { Step6Amenities } from "./Step6Amenities"
import { Step7Photos } from "./Step7Photos"
import { Step8Review } from "./Step8Review"
import {
  createListingSchema,
  CreateListingValues,
  STEP_FIELDS,
} from "../../schemas/createListing"
import { PageHeader } from "@/components/PageHeader"
import { uploadFile } from "@/lib/api"

const TOTAL_STEPS = 8

function SubmissionSuccess({ onAddAnother }: { onAddAnother: () => void }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      {/* Icon */}
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-green-100">
        <IconCircleCheckFilled className="size-10 text-green-600" />
      </div>

      <h1 className="text-2xl font-bold">Submitted for review!</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Your listing has been sent to our moderation team. You&apos;ll receive
        an email once it&apos;s approved or if changes are required.
      </p>

      {/* Timeline */}
      <div className="mt-10 w-full max-w-sm rounded-xl border bg-card p-6 text-left">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          What happens next
        </p>
        <ol className="space-y-4">
          <li className="flex items-start gap-3">
            <div className="mt-0.5 flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
              <IconCircleCheckFilled className="size-3.5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Listing submitted</p>
              <p className="text-xs text-muted-foreground">Done — your listing is in the queue</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-0.5 flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100">
              <IconClockHour4 className="size-3.5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Admin review</p>
              <p className="text-xs text-muted-foreground">
                Our team reviews listings within 24–48 hours
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-0.5 flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-muted">
              <IconStar className="size-3.5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Published</p>
              <p className="text-xs text-muted-foreground">
                Once approved, renters can discover your property
              </p>
            </div>
          </li>
        </ol>
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-3">
        <Button variant="outline" onClick={onAddAnother}>
          Add another listing
        </Button>
        <Button asChild>
          <Link href="/landlord/listings">View my listings</Link>
        </Button>
      </div>
    </div>
  )
}

export function CreateListingWizard() {
  const [step, setStep] = useState(0) // 0-indexed
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<CreateListingValues>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      amenities: [],
      petFriendly: false,
      smokingAllowed: false,
      instantBook: false,
      photos: [],
    },
    mode: "onTouched",
  })

  const { isSubmitting } = form.formState

  async function goNext() {
    const fields = STEP_FIELDS[step]
    const valid = await form.trigger(fields as any)
    if (!valid) return
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function onSubmit(values: CreateListingValues) {
    try {
      const fd = new FormData()

      // ── Scalar fields ──────────────────────────────────────────────────────
      fd.append("listingType", values.listingType)
      fd.append("title", values.title)
      if (values.summary) fd.append("summary", values.summary)
      fd.append("description", values.description)
      fd.append("state", values.state)
      fd.append("lga", values.lga)
      fd.append("area", values.area)
      fd.append("address", values.address)
      fd.append("propertyCategory", values.propertyCategory)
      fd.append("bedrooms", String(values.bedrooms))
      fd.append("bathrooms", String(values.bathrooms))
      fd.append("toilets", String(values.toilets))
      if (values.sizeInSqm != null) fd.append("sizeInSqm", String(values.sizeInSqm))
      fd.append("furnished", values.furnished)

      // ── Pricing ────────────────────────────────────────────────────────────
      if (values.pricePerYear != null) fd.append("pricePerYear", String(values.pricePerYear))
      if (values.paymentFrequency) fd.append("paymentFrequency", values.paymentFrequency)
      if (values.cautionFee != null) fd.append("cautionFee", String(values.cautionFee))
      if (values.serviceCharge != null) fd.append("serviceCharge", String(values.serviceCharge))
      if (values.pricePerNight != null) fd.append("pricePerNight", String(values.pricePerNight))
      if (values.minimumNights != null) fd.append("minimumNights", String(values.minimumNights))
      fd.append("instantBook", String(values.instantBook ?? false))

      // ── Amenities & rules ──────────────────────────────────────────────────
      fd.append("amenities", JSON.stringify(values.amenities))
      fd.append("petFriendly", String(values.petFriendly))
      fd.append("smokingAllowed", String(values.smokingAllowed))
      fd.append("availableFrom", values.availableFrom)

      // ── Photos ─────────────────────────────────────────────────────────────
      for (const photo of values.photos) {
        fd.append("photos", photo)
      }

      await uploadFile("/listings", fd)

      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch {
      toast.error("Failed to submit listing. Please try again.")
    }
  }

  function resetWizard() {
    form.reset({
      amenities: [],
      petFriendly: false,
      smokingAllowed: false,
      instantBook: false,
      photos: [],
    })
    setStep(0)
    setSubmitted(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (submitted) return <SubmissionSuccess onAddAnother={resetWizard} />

  const stepComponents = [
    <Step1PropertyType key={0} form={form} />,
    <Step2BasicInfo key={1} form={form} />,
    <Step3Location key={2} form={form} />,
    <Step4Details key={3} form={form} />,
    <Step5Pricing key={4} form={form} />,
    <Step6Amenities key={5} form={form} />,
    <Step7Photos key={6} form={form} />,
    <Step8Review key={7} form={form} />,
  ]

  const isLastStep = step === TOTAL_STEPS - 1

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <PageHeader
          back
          title={"Add a new listing"}
          description={`Step ${step + 1} of ${TOTAL_STEPS}`}
        />
      </div>

      {/* Step indicator */}
      <div className="mb-8">
        <StepIndicator current={step} />
      </div>

      {/* Form */}
      <Form {...form}>
        {/* No onSubmit — we call handleSubmit programmatically to avoid the
            mousedown→type-change→mouseup browser auto-submit race condition */}
        <form onSubmit={(e) => e.preventDefault()}>
          {/* Step content */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            {stepComponents[step]}
          </div>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={step === 0 || isSubmitting}
            >
              <IconArrowLeft className="size-4" />
              Back
            </Button>

            <Button
              type="button"
              disabled={isSubmitting}
              onClick={isLastStep ? form.handleSubmit(onSubmit) : goNext}
            >
              {isLastStep ? (
                isSubmitting ? (
                  <>
                    <IconLoader2 className="size-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit for review"
                )
              ) : (
                <>
                  Continue
                  <IconArrowRight className="size-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
