"use client"

import { useCallback, useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { IconX, IconUpload, IconPhoto } from "@tabler/icons-react"
import { FormField, FormItem, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { EditListingValues } from "../../schemas/editListing"

interface Props {
  form: UseFormReturn<EditListingValues>
  existingPhotos: string[]
  onRemoveExisting: (url: string) => void
}

export function Step7PhotosEdit({ form, existingPhotos, onRemoveExisting }: Props) {
  const [newPreviews, setNewPreviews] = useState<{ file: File; url: string }[]>([])

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      addFiles(Array.from(e.dataTransfer.files))
    },
    [newPreviews, existingPhotos]
  )

  function addFiles(files: File[]) {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"))
    const totalExisting = existingPhotos.length + newPreviews.length
    const maxNew = Math.max(0, 12 - totalExisting)
    const toAdd = imageFiles.slice(0, maxNew)

    const current = form.getValues("newPhotos") ?? []
    form.setValue("newPhotos", [...current, ...toAdd], { shouldValidate: true })

    const previews = toAdd.map((f) => ({ file: f, url: URL.createObjectURL(f) }))
    setNewPreviews((prev) => [...prev, ...previews])
  }

  function removeNew(index: number) {
    const current = form.getValues("newPhotos") ?? []
    form.setValue("newPhotos", current.filter((_, i) => i !== index), { shouldValidate: true })
    setNewPreviews((prev) => {
      URL.revokeObjectURL(prev[index].url)
      return prev.filter((_, i) => i !== index)
    })
  }

  const totalCount = existingPhotos.length + newPreviews.length
  const atMax = totalCount >= 12
  const atMin = totalCount >= 3

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Property photos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Minimum 3 photos total. First photo is the cover. Max 12.
        </p>
      </div>

      {/* Existing photos */}
      {existingPhotos.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Current photos ({existingPhotos.length})
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {existingPhotos.map((url, i) => (
              <div
                key={url}
                className={cn(
                  "group relative aspect-square overflow-hidden rounded-lg border bg-muted",
                  i === 0 && newPreviews.length === 0 && "col-span-2 row-span-2"
                )}
              >
                <img src={url} alt={`Existing photo ${i + 1}`} className="size-full object-cover" />
                {i === 0 && existingPhotos.length > 0 && newPreviews.length === 0 && (
                  <span className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onRemoveExisting(url)}
                  className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <IconX className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New photos */}
      <FormField
        control={form.control}
        name="newPhotos"
        render={() => (
          <FormItem>
            {!atMax && (
              <div
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
                className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 transition-colors hover:bg-muted/50"
                onClick={() => document.getElementById("photo-upload-edit")?.click()}
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <IconUpload className="size-5 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">
                    {existingPhotos.length === 0
                      ? "Drag & drop or click to upload"
                      : "Add more photos"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    JPG, PNG, WebP — up to 10MB each
                  </p>
                </div>
                <input
                  id="photo-upload-edit"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
                />
              </div>
            )}

            {newPreviews.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  New photos ({newPreviews.length})
                </p>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {newPreviews.map((p, i) => (
                    <div
                      key={p.url}
                      className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                    >
                      <img src={p.url} alt={`New photo ${i + 1}`} className="size-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNew(i)}
                        className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <IconX className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className={cn("text-xs", atMin ? "text-green-600" : "text-muted-foreground")}>
                {totalCount} / 12 photos {!atMin && `(need ${3 - totalCount} more)`}
              </p>
              {atMax && <p className="text-xs text-muted-foreground">Maximum reached</p>}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
