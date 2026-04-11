import { UseFormReturn } from "react-hook-form"
import { IconHome, IconBuildingSkyscraper, IconSofa, IconBed } from "@tabler/icons-react"
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { CreateListingValues } from "../../schemas/createListing"

const types = [
  {
    value: "long-term" as const,
    label: "Long-Term Rental",
    description: "Apartments, duplexes, and houses rented monthly or annually",
    icon: IconHome,
  },
  {
    value: "shortlet" as const,
    label: "Shortlet",
    description: "Furnished apartments available for short stays, priced per night",
    icon: IconSofa,
  },
  {
    value: "office-space" as const,
    label: "Office Space",
    description: "Commercial spaces for businesses — shared or private offices",
    icon: IconBuildingSkyscraper,
  },
  {
    value: "hotel-room" as const,
    label: "Hotel Room",
    description: "Hotel-standard rooms with hospitality services",
    icon: IconBed,
  },
]

type Props = { form: UseFormReturn<CreateListingValues> }

export function Step1PropertyType({ form }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">What type of property are you listing?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          This determines the fields and pricing options available.
        </p>
      </div>

      <FormField
        control={form.control}
        name="listingType"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div className="grid gap-3 sm:grid-cols-2">
                {types.map(({ value, label, description, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => field.onChange(value)}
                    className={cn(
                      "flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all hover:bg-muted/50",
                      field.value === value
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-10 flex-shrink-0 items-center justify-center rounded-lg",
                        field.value === value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className={cn("font-medium", field.value === value && "text-primary")}>
                        {label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
