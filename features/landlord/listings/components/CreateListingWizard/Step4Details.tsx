import { UseFormReturn } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreateListingValues } from "../../schemas/createListing"

type Props = { form: UseFormReturn<CreateListingValues> }

const propertyCategories = [
  { value: "apartment", label: "Apartment" },
  { value: "duplex", label: "Duplex" },
  { value: "bungalow", label: "Bungalow" },
  { value: "terraced", label: "Terraced House" },
  { value: "semi-detached", label: "Semi-Detached" },
  { value: "detached", label: "Detached House" },
  { value: "mansion", label: "Mansion" },
  { value: "studio", label: "Studio" },
  { value: "penthouse", label: "Penthouse" },
  { value: "office", label: "Office" },
  { value: "hotel-room", label: "Hotel Room" },
]

const furnishingOptions = [
  { value: "furnished", label: "Fully Furnished" },
  { value: "semi-furnished", label: "Semi-Furnished" },
  { value: "unfurnished", label: "Unfurnished" },
]

function NumberField({
  form,
  name,
  label,
  placeholder,
  min = 0,
}: {
  form: UseFormReturn<CreateListingValues>
  name: keyof CreateListingValues
  label: string
  placeholder: string
  min?: number
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={placeholder}
              min={min}
              {...field}
              value={field.value as number ?? ""}
              onChange={(e) => field.onChange(e.target.valueAsNumber)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function Step4Details({ form }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Property details</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Specific information about the property&apos;s size and layout.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Property category */}
        <FormField
          control={form.control}
          name="propertyCategory"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Property category</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {propertyCategories.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <NumberField form={form} name="bedrooms" label="Bedrooms" placeholder="e.g. 3" min={0} />
        <NumberField form={form} name="bathrooms" label="Bathrooms" placeholder="e.g. 2" min={1} />
        <NumberField form={form} name="toilets" label="Toilets" placeholder="e.g. 3" min={1} />
        <NumberField form={form} name="sizeInSqm" label="Size (sqm) — optional" placeholder="e.g. 120" min={1} />

        {/* Furnishing */}
        <FormField
          control={form.control}
          name="furnished"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Furnishing status</FormLabel>
              <div className="grid grid-cols-3 gap-3">
                {furnishingOptions.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => field.onChange(value)}
                    className={`rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all ${
                      field.value === value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
