"use client"

import { useCallback, useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { IconPhoto, IconX, IconUpload } from "@tabler/icons-react"
import { FormField, FormItem, FormMessage } from "@/components/ui/form"
import { CreateListingValues } from "../../schemas/createListing"
import { cn } from "@/lib/utils"

type Props = { form: UseFormReturn<CreateListingValues> }

export function Step7Photos({ form }: Props) {
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([])

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      addFiles(Array.from(e.dataTransfer.files))
    },
    [previews]
  )

  function addFiles(files: File[]) {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"))
    const current = form.getValues("photos") ?? []
    const combined = [...current, ...imageFiles].slice(0, 12)
    form.setValue("photos", combined, { shouldValidate: true })
    const newPreviews = imageFiles.slice(0, 12 - current.length).map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
    }))
    setPreviews((prev) => [...prev, ...newPreviews].slice(0, 12))
  }

  function removePhoto(index: number) {
    const current = form.getValues("photos") ?? []
    const updated = current.filter((_, i) => i !== index)
    form.setValue("photos", updated, { shouldValidate: true })
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].url)
      return prev.filter((_, i) => i !== index)
    })
  }

  const count = previews.length
  const atMin = count >= 3
  const atMax = count >= 12

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Property photos</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload at least 3 high-quality photos. Max 12. First photo becomes the cover.
        </p>
      </div>

      <FormField
        control={form.control}
        name="photos"
        render={() => (
          <FormItem>
            {/* Drop zone */}
            {!atMax && (
              <div
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
                className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 transition-colors hover:bg-muted/50 cursor-pointer"
                onClick={() => document.getElementById("photo-upload")?.click()}
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <IconUpload className="size-5 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Drag & drop or click to upload</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, WebP — up to 10MB each
                  </p>
                </div>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
                />
              </div>
            )}

            {/* Preview grid */}
            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {previews.map((p, i) => (
                  <div
                    key={p.url}
                    className={cn(
                      "group relative aspect-square overflow-hidden rounded-lg border bg-muted",
                      i === 0 && "col-span-2 row-span-2 sm:col-span-2 sm:row-span-2"
                    )}
                  >
                    <img
                      src={p.url}
                      alt={`Photo ${i + 1}`}
                      className="size-full object-cover"
                    />
                    {i === 0 && (
                      <span className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <IconX className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className={cn("text-xs", atMin ? "text-green-600" : "text-muted-foreground")}>
                {count} / 12 photos {!atMin && `(need ${3 - count} more)`}
              </p>
              {atMax && (
                <p className="text-xs text-muted-foreground">Maximum reached</p>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
