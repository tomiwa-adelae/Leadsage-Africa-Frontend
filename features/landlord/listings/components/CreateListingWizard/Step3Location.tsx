"use client"

import { UseFormReturn } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { NIGERIAN_STATES, getLGAsForState } from "@/constants/nigeria"
import { CreateListingValues } from "../../schemas/createListing"

type Props = { form: UseFormReturn<CreateListingValues> }

export function Step3Location({ form }: Props) {
  const selectedState = form.watch("state")
  const lgas = getLGAsForState(selectedState)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Property location</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tell tenants exactly where your property is.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* State */}
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <Select
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val)
                  form.setValue("lga", "") // reset LGA when state changes
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60">
                  {NIGERIAN_STATES.map((s) => (
                    <SelectItem key={s.name} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* LGA */}
        <FormField
          control={form.control}
          name="lga"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Local Government Area (LGA)</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!selectedState}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={selectedState ? "Select LGA" : "Select state first"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60">
                  {lgas.map((lga) => (
                    <SelectItem key={lga} value={lga}>
                      {lga}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Area */}
        <FormField
          control={form.control}
          name="area"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Area / Neighbourhood</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Lekki Phase 1, Ikeja GRA" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full address</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 12 Admiralty Way, Lekki" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
