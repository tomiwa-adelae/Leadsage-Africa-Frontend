import { z } from "zod"
import { extractTiptapText } from "@/components/text-editor/RenderDescription"

// Same shape as createListingSchema but photos are optional new files
// (existing photos are tracked separately and sent as keepPhotos)
export const editListingSchema = z
  .object({
    listingType: z.enum(["long-term", "shortlet", "office-space", "hotel-room"]),

    title: z
      .string()
      .min(10, "Title must be at least 10 characters")
      .max(100, "Title must be under 100 characters"),
    summary: z.string().max(160, "Summary must be 160 characters or fewer").optional(),
    description: z
      .string()
      .min(1, "Description is required")
      .refine(
        (val) => {
          try {
            return extractTiptapText(val).trim().length >= 50
          } catch {
            return val.trim().length >= 50
          }
        },
        { message: "Description must be at least 50 characters" }
      )
      .refine(
        (val) => {
          try {
            return extractTiptapText(val).trim().length <= 2000
          } catch {
            return val.trim().length <= 2000
          }
        },
        { message: "Description must be under 2000 characters" }
      ),

    state: z.string().min(1, "State is required"),
    lga: z.string().min(1, "LGA is required"),
    area: z.string().min(1, "Area / Neighbourhood is required"),
    address: z.string().min(5, "Full address is required"),

    propertyCategory: z.enum([
      "apartment", "duplex", "bungalow", "terraced", "semi-detached",
      "detached", "mansion", "studio", "penthouse", "office", "hotel-room",
    ], { required_error: "Please select a property category" }),
    bedrooms: z.number({ invalid_type_error: "Required" }).min(0).max(20),
    bathrooms: z.number({ invalid_type_error: "Required" }).min(1).max(20),
    toilets: z.number({ invalid_type_error: "Required" }).min(1).max(20),
    sizeInSqm: z.number().min(1).optional(),
    furnished: z.enum(["furnished", "semi-furnished", "unfurnished"], {
      required_error: "Please select a furnishing status",
    }),

    pricePerYear: z.number().min(1).optional(),
    paymentFrequency: z.enum(["monthly", "quarterly", "bi-annually", "annually"]).optional(),
    cautionFee: z.number().min(0).optional(),
    serviceCharge: z.number().min(0).optional(),
    pricePerNight: z.number().min(1).optional(),
    minimumNights: z.number().min(1).optional(),
    instantBook: z.boolean(),
    pricePerYear_office: z.number().min(1).optional(),

    amenities: z.array(z.string()).min(1, "Select at least one amenity"),
    petFriendly: z.boolean(),
    smokingAllowed: z.boolean(),
    availableFrom: z.string().min(1, "Available from date is required"),

    // New photo files — optional in edit mode (existing photos can satisfy requirement)
    newPhotos: z.array(z.instanceof(File)).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.listingType === "long-term" && !data.pricePerYear) {
      ctx.addIssue({ code: "custom", path: ["pricePerYear"], message: "Annual price is required" })
    }
    if (data.listingType === "long-term" && !data.paymentFrequency) {
      ctx.addIssue({ code: "custom", path: ["paymentFrequency"], message: "Payment frequency is required" })
    }
    if (["shortlet", "hotel-room"].includes(data.listingType) && !data.pricePerNight) {
      ctx.addIssue({ code: "custom", path: ["pricePerNight"], message: "Nightly price is required" })
    }
    if (["shortlet", "hotel-room"].includes(data.listingType) && !data.minimumNights) {
      ctx.addIssue({ code: "custom", path: ["minimumNights"], message: "Minimum nights is required" })
    }
  })

export type EditListingValues = z.infer<typeof editListingSchema>

export const EDIT_STEP_FIELDS: (keyof EditListingValues)[][] = [
  ["listingType"],
  ["title", "summary", "description"],
  ["state", "lga", "area", "address"],
  ["propertyCategory", "bedrooms", "bathrooms", "toilets", "furnished"],
  ["pricePerYear", "paymentFrequency", "pricePerNight", "minimumNights"],
  ["amenities", "availableFrom"],
  ["newPhotos"],
]
