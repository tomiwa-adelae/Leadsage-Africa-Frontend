"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { toast } from "sonner"
import {
  IconLoader2,
  IconArrowLeft,
  IconArrowRight,
  IconCircleCheckFilled,
} from "@tabler/icons-react"

import { fetchData, uploadFilePatch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { PageHeader } from "@/components/PageHeader"
import { StepIndicator } from "../CreateListingWizard/StepIndicator"
import { Step2BasicInfo } from "../CreateListingWizard/Step2BasicInfo"
import { Step3Location } from "../CreateListingWizard/Step3Location"
import { Step4Details } from "../CreateListingWizard/Step4Details"
import { Step5Pricing } from "../CreateListingWizard/Step5Pricing"
import { Step6Amenities } from "../CreateListingWizard/Step6Amenities"
import { Step7PhotosEdit } from "./Step7PhotosEdit"
import { editListingSchema, EditListingValues, EDIT_STEP_FIELDS } from "../../schemas/editListing"
import { LandlordListing } from "../../types/listing"

// ── Enum converters ────────────────────────────────────────────────────────────
// Backend stores SCREAMING_SNAKE_CASE, form expects kebab-case

function toKebab(val: string): string {
  return val.toLowerCase().replace(/_/g, "-")
}

function mapListing(l: LandlordListing): Partial<EditListingValues> {
  return {
    listingType: toKebab(l.listingType) as EditListingValues["listingType"],
    title: l.title,
    summary: l.summary ?? undefined,
    description: l.description,
    state: l.state,
    lga: l.lga,
    area: l.area,
    address: l.address,
    propertyCategory: toKebab(l.propertyCategory) as EditListingValues["propertyCategory"],
    bedrooms: l.bedrooms,
    bathrooms: l.bathrooms,
    toilets: l.toilets,
    sizeInSqm: l.sizeInSqm ?? undefined,
    furnished: toKebab(l.furnished) as EditListingValues["furnished"],
    pricePerYear: l.pricePerYear ?? undefined,
    paymentFrequency: l.paymentFrequency
      ? (toKebab(l.paymentFrequency) as EditListingValues["paymentFrequency"])
      : undefined,
    cautionFee: l.cautionFee ?? undefined,
    serviceCharge: l.serviceCharge ?? undefined,
    pricePerNight: l.pricePerNight ?? undefined,
    minimumNights: l.minimumNights ?? undefined,
    instantBook: l.instantBook,
    amenities: l.amenities,
    petFriendly: l.petFriendly,
    smokingAllowed: l.smokingAllowed,
    availableFrom: l.availableFrom
      ? new Date(l.availableFrom).toISOString().slice(0, 10)
      : "",
    newPhotos: [],
  }
}

// ── Step 0 — read-only property type display ───────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  "long-term": "Long-Term Rental",
  shortlet: "Shortlet",
  "office-space": "Office Space",
  "hotel-room": "Hotel Room",
}

function Step0TypeReadOnly({ listingType }: { listingType: string }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Property type</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The property type cannot be changed after a listing is created.
        </p>
      </div>
      <div className="rounded-xl border bg-muted/40 px-5 py-4">
        <p className="text-sm font-medium text-muted-foreground">Current type</p>
        <p className="mt-1 text-base font-semibold">
          {TYPE_LABELS[listingType] ?? listingType}
        </p>
      </div>
    </div>
  )
}

// ── Success screen ─────────────────────────────────────────────────────────────

function SaveSuccess({ listingId }: { listingId: string }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-green-100">
        <IconCircleCheckFilled className="size-10 text-green-600" />
      </div>
      <h1 className="text-2xl font-bold">Changes saved!</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Your listing has been updated and re-submitted for review. You'll be notified once it's approved.
      </p>
      <div className="mt-8 flex gap-3">
        <Button variant="outline" asChild>
          <Link href={`/landlord/listings/${listingId}`}>View listing</Link>
        </Button>
        <Button asChild>
          <Link href="/landlord/listings">All listings</Link>
        </Button>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

const TOTAL_STEPS = 7 // type (read-only), info, location, details, pricing, amenities, photos

export function EditListingWizard({ id }: { id: string }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saved, setSaved] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [existingPhotos, setExistingPhotos] = useState<string[]>([])
  const [listingType, setListingType] = useState("")

  const form = useForm<EditListingValues>({
    resolver: zodResolver(editListingSchema),
    defaultValues: {
      amenities: [],
      petFriendly: false,
      smokingAllowed: false,
      instantBook: false,
      newPhotos: [],
    },
    mode: "onTouched",
  })

  // Fetch and pre-populate
  useEffect(() => {
    fetchData<LandlordListing>(`/listings/${id}`)
      .then((listing) => {
        setExistingPhotos(listing.photos)
        setListingType(toKebab(listing.listingType))
        form.reset(mapListing(listing))
      })
      .catch(() => {
        toast.error("Failed to load listing")
        router.push("/landlord/listings")
      })
      .finally(() => setFetching(false))
  }, [id])

  const { isSubmitting } = form.formState

  async function goNext() {
    if (step === 0) {
      setStep(1)
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    const fields = EDIT_STEP_FIELDS[step]
    const valid = await form.trigger(fields as any)
    if (!valid) return
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function onSubmit(values: EditListingValues) {
    // Validate photo total
    const total = existingPhotos.length + (values.newPhotos?.length ?? 0)
    if (total < 3) {
      toast.error("Please keep or add at least 3 photos")
      return
    }

    try {
      const fd = new FormData()

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

      if (values.pricePerYear != null) fd.append("pricePerYear", String(values.pricePerYear))
      if (values.paymentFrequency) fd.append("paymentFrequency", values.paymentFrequency)
      if (values.cautionFee != null) fd.append("cautionFee", String(values.cautionFee))
      if (values.serviceCharge != null) fd.append("serviceCharge", String(values.serviceCharge))
      if (values.pricePerNight != null) fd.append("pricePerNight", String(values.pricePerNight))
      if (values.minimumNights != null) fd.append("minimumNights", String(values.minimumNights))
      fd.append("instantBook", String(values.instantBook ?? false))

      fd.append("amenities", JSON.stringify(values.amenities))
      fd.append("petFriendly", String(values.petFriendly))
      fd.append("smokingAllowed", String(values.smokingAllowed))
      fd.append("availableFrom", values.availableFrom)

      // Tell backend which existing photos to keep
      fd.append("keepPhotos", JSON.stringify(existingPhotos))

      // New photo files
      for (const photo of values.newPhotos ?? []) {
        fd.append("photos", photo)
      }

      await uploadFilePatch(`/listings/${id}`, fd)
      setSaved(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch {
      toast.error("Failed to save changes. Please try again.")
    }
  }

  if (fetching) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
        <IconLoader2 className="size-5 animate-spin" />
        Loading listing…
      </div>
    )
  }

  if (saved) return <SaveSuccess listingId={id} />

  const currentListingType = form.getValues("listingType") || listingType

  // Step 0 is type display (no form validation), steps 1-6 use existing step components
  // We cast form to `any` for reused steps since EditListingValues is structurally
  // identical to CreateListingValues for all fields those steps access.
  const stepComponents = [
    <Step0TypeReadOnly key={0} listingType={currentListingType} />,
    <Step2BasicInfo key={1} form={form as any} />,
    <Step3Location key={2} form={form as any} />,
    <Step4Details key={3} form={form as any} />,
    <Step5Pricing key={4} form={form as any} />,
    <Step6Amenities key={5} form={form as any} />,
    <Step7PhotosEdit
      key={6}
      form={form}
      existingPhotos={existingPhotos}
      onRemoveExisting={(url) =>
        setExistingPhotos((prev) => prev.filter((p) => p !== url))
      }
    />,
  ]

  const isLastStep = step === TOTAL_STEPS - 1

  return (
    <div>
      <div className="mb-6">
        <PageHeader
          back
          title="Edit listing"
          description={`Step ${step + 1} of ${TOTAL_STEPS}`}
        />
      </div>

      <div className="mb-8">
        <StepIndicator current={step} />
      </div>

      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            {stepComponents[step]}
          </div>

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
                    Saving…
                  </>
                ) : (
                  "Save changes"
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
