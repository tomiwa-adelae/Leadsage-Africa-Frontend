import { UseFormReturn } from "react-hook-form"
import { IconCheck } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CreateListingValues } from "../../schemas/createListing"

type Props = { form: UseFormReturn<CreateListingValues> }

function ReviewRow({ label, value }: { label: string; value?: string | number | boolean }) {
  if (value === undefined || value === null || value === "") return null
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-sm text-muted-foreground flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-right">{String(value)}</span>
    </div>
  )
}

export function Step8Review({ form }: Props) {
  const v = form.getValues()

  const typeLabels: Record<string, string> = {
    "long-term": "Long-Term Rental",
    "shortlet": "Shortlet",
    "office-space": "Office Space",
    "hotel-room": "Hotel Room",
  }

  const priceDisplay = v.listingType === "long-term" || v.listingType === "office-space"
    ? v.pricePerYear ? `₦${v.pricePerYear.toLocaleString()} / year` : "—"
    : v.pricePerNight ? `₦${v.pricePerNight.toLocaleString()} / night` : "—"

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Review your listing</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Double-check everything before submitting for admin review.
        </p>
      </div>

      {/* Admin approval notice */}
      <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <div className="flex size-5 flex-shrink-0 items-center justify-center rounded-full bg-yellow-400 mt-0.5">
          <span className="text-[10px] font-bold text-white">!</span>
        </div>
        <div>
          <p className="text-sm font-medium text-yellow-800">Pending admin review</p>
          <p className="text-xs text-yellow-700 mt-0.5 leading-relaxed">
            Your listing will be reviewed by our team before going live. This usually takes 24–48 hours.
            You&apos;ll receive an email once it&apos;s approved or if changes are needed.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-lg border divide-y">
        <div className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Property</p>
          <ReviewRow label="Type" value={typeLabels[v.listingType]} />
          <ReviewRow label="Title" value={v.title} />
          <ReviewRow label="Category" value={v.propertyCategory} />
        </div>
        <div className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Location</p>
          <ReviewRow label="State" value={v.state} />
          <ReviewRow label="LGA" value={v.lga} />
          <ReviewRow label="Area" value={v.area} />
          <ReviewRow label="Address" value={v.address} />
        </div>
        <div className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Details</p>
          <ReviewRow label="Bedrooms" value={v.bedrooms} />
          <ReviewRow label="Bathrooms" value={v.bathrooms} />
          <ReviewRow label="Toilets" value={v.toilets} />
          <ReviewRow label="Size" value={v.sizeInSqm ? `${v.sizeInSqm} sqm` : undefined} />
          <ReviewRow label="Furnishing" value={v.furnished} />
        </div>
        <div className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Pricing</p>
          <ReviewRow label="Price" value={priceDisplay} />
          {v.paymentFrequency && <ReviewRow label="Payment frequency" value={v.paymentFrequency} />}
          {v.cautionFee && <ReviewRow label="Caution fee" value={`₦${v.cautionFee.toLocaleString()}`} />}
          {v.serviceCharge && <ReviewRow label="Service charge" value={`₦${v.serviceCharge.toLocaleString()}`} />}
          <ReviewRow label="Available from" value={v.availableFrom} />
        </div>
        <div className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Amenities</p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {(v.amenities ?? []).map((a) => (
              <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
            ))}
          </div>
        </div>
        <div className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Photos</p>
          <ReviewRow label="Photos uploaded" value={`${(v.photos ?? []).length} photo(s)`} />
        </div>
      </div>
    </div>
  )
}
