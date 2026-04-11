"use client"

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
import { RichTextEditor } from "@/components/text-editor/Editor"
import { extractTiptapText } from "@/components/text-editor/RenderDescription"
import { CreateListingValues } from "../../schemas/createListing"

type Props = { form: UseFormReturn<CreateListingValues> }

export function Step2BasicInfo({ form }: Props) {
  const rawDescription = form.watch("description") ?? ""

  const charCount = (() => {
    try {
      return extractTiptapText(rawDescription).trim().length
    } catch {
      return rawDescription.length
    }
  })()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Basic information</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Give your listing a clear title and a detailed description.
        </p>
      </div>

      <div className="space-y-4">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Listing title</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Modern 3-Bedroom Apartment in Lekki Phase 1"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Be specific — include bedrooms, type, and location.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Short summary */}
        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => {
            const count = field.value?.length ?? 0
            return (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>
                    Short summary{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </FormLabel>
                  <span
                    className={
                      count > 160
                        ? "text-xs text-destructive"
                        : count >= 120
                          ? "text-xs text-yellow-500"
                          : "text-xs text-muted-foreground"
                    }
                  >
                    {count}/160
                  </span>
                </div>
                <FormControl>
                  <Input
                    placeholder="e.g. Spacious 3-bed apartment in the heart of Lekki with 24hr light and parking."
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>
                  Recommended — appears in search results and listing previews. Keep it under 160 characters.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )
          }}
        />

        {/* Description — rich text */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <RichTextEditor field={field} />
              </FormControl>
              <div className="flex items-center justify-between">
                <FormDescription>
                  Describe the layout, key features, nearby landmarks, and what makes it special.
                </FormDescription>
                <span
                  className={
                    charCount < 50
                      ? "text-xs text-muted-foreground"
                      : charCount > 2000
                        ? "text-xs text-destructive"
                        : "text-xs text-green-600"
                  }
                >
                  {charCount}/2000
                </span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
