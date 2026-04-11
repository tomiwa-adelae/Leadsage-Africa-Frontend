import { UseFormReturn } from "react-hook-form"
import { IconCheck } from "@tabler/icons-react"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { AMENITIES } from "@/constants/amenities"
import { CreateListingValues } from "../../schemas/createListing"
import { cn } from "@/lib/utils"

type Props = { form: UseFormReturn<CreateListingValues> }

export function Step6Amenities({ form }: Props) {
  const selected = form.watch("amenities") ?? []

  function toggle(id: string) {
    const current = form.getValues("amenities") ?? []
    form.setValue(
      "amenities",
      current.includes(id) ? current.filter((a) => a !== id) : [...current, id],
      { shouldValidate: true }
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Amenities & rules</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select all amenities available. Be accurate — tenants filter by these.
        </p>
      </div>

      {/* Amenity categories */}
      <FormField
        control={form.control}
        name="amenities"
        render={() => (
          <FormItem className="space-y-4">
            {AMENITIES.map((category) => (
              <div key={category.category}>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  {category.category}
                </p>
                <div className="flex flex-wrap gap-2">
                  {category.items.map(({ id, label }) => {
                    const isSelected = selected.includes(id)
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggle(id)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {isSelected && <IconCheck className="size-3" strokeWidth={3} />}
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Rules */}
      <div className="rounded-lg border p-4 space-y-4">
        <p className="text-sm font-medium">House rules</p>
        <FormField
          control={form.control}
          name="petFriendly"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <div>
                <FormLabel className="text-sm">Pets allowed</FormLabel>
                <p className="text-xs text-muted-foreground">Tenants can bring pets</p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="smokingAllowed"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <div>
                <FormLabel className="text-sm">Smoking allowed</FormLabel>
                <p className="text-xs text-muted-foreground">Smoking permitted on the premises</p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {/* Available from */}
      <FormField
        control={form.control}
        name="availableFrom"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Available from</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
