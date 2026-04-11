import { UseFormReturn } from "react-hook-form"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CreateListingValues } from "../../schemas/createListing"

type Props = { form: UseFormReturn<CreateListingValues> }

function NairaInput({
  form,
  name,
  label,
  description,
}: {
  form: UseFormReturn<CreateListingValues>
  name: keyof CreateListingValues
  label: string
  description?: string
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                ₦
              </span>
              <Input
                type="number"
                placeholder="0"
                min={0}
                className="pl-7"
                {...field}
                value={(field.value as number) ?? ""}
                onChange={(e) => field.onChange(e.target.valueAsNumber)}
              />
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function Step5Pricing({ form }: Props) {
  const listingType = form.watch("listingType")
  const isLongTerm = listingType === "long-term"
  const isShortletOrHotel =
    listingType === "shortlet" || listingType === "hotel-room"
  const isOffice = listingType === "office-space"

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Pricing</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Set competitive prices. You can update these at any time.
        </p>
      </div>

      <div className="grid gap-4">
        {/* Long-term pricing */}
        {(isLongTerm || isOffice) && (
          <>
            <NairaInput
              form={form}
              name="pricePerYear"
              label="Annual rent (₦/year)"
              description="Total rent per year — this is the standard in Nigeria"
            />
            <FormField
              control={form.control}
              name="paymentFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment frequency</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">
                        Quarterly (every 3 months)
                      </SelectItem>
                      <SelectItem value="bi-annually">
                        Bi-annually (every 6 months)
                      </SelectItem>
                      <SelectItem value="annually">
                        Annually (1 year upfront)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <NairaInput
              form={form}
              name="cautionFee"
              label="Caution / Security deposit (optional)"
              description="Usually 1–3 months rent"
            />
            <NairaInput
              form={form}
              name="serviceCharge"
              label="Service charge (optional)"
              description="Annual estate / facility management fee"
            />
          </>
        )}

        {/* Shortlet / Hotel pricing */}
        {isShortletOrHotel && (
          <>
            <NairaInput
              form={form}
              name="pricePerNight"
              label="Price per night (₦/night)"
            />
            <FormField
              control={form.control}
              name="minimumNights"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum nights</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 1"
                      min={1}
                      {...field}
                      value={(field.value as number) ?? ""}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormDescription>
                    Guests must book for at least this many nights
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <NairaInput
              form={form}
              name="cautionFee"
              label="Caution / Security deposit (optional)"
            />

            {/* Instant Book toggle */}
            <FormField
              control={form.control}
              name="instantBook"
              render={({ field }) => (
                <FormItem className="flex items-start justify-between gap-4 rounded-xl border p-4">
                  <div className="space-y-1">
                    <FormLabel className="text-base">
                      Enable Instant Book
                    </FormLabel>
                    <FormDescription className="text-sm">
                      Guests can book immediately without waiting for your
                      approval — as soon as payment is made, the booking is
                      confirmed automatically. You can turn this off at any time
                      from your listings page.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </>
        )}
      </div>
    </div>
  )
}
