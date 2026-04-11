import { z } from "zod"
import { extractTiptapText } from "@/components/text-editor/RenderDescription"

export const createListingSchema = z
  .object({
    // Step 1 — Property Type
    listingType: z.enum(
      ["long-term", "shortlet", "office-space", "hotel-room"],
      {
        required_error: "Please select a property type",
      }
    ),

    // Step 2 — Basic Info
    title: z
      .string()
      .min(10, "Title must be at least 10 characters")
      .max(100, "Title must be under 100 characters"),
    summary: z
      .string()
      .max(160, "Summary must be 160 characters or fewer")
      .optional(),
    // Stored as TipTap JSON string — validate against extracted plain text
    description: z
      .string()
      .min(1, "Description is required")
      .refine(
        (val) => {
          try {
            const text = extractTiptapText(val)
            return text.trim().length >= 50
          } catch {
            return val.trim().length >= 50
          }
        },
        { message: "Description must be at least 50 characters" }
      )
      .refine(
        (val) => {
          try {
            const text = extractTiptapText(val)
            return text.trim().length <= 2000
          } catch {
            return val.trim().length <= 2000
          }
        },
        { message: "Description must be under 2000 characters" }
      ),

    // Step 3 — Location
    state: z.string().min(1, "State is required"),
    lga: z.string().min(1, "LGA is required"),
    area: z.string().min(1, "Area / Neighbourhood is required"),
    address: z.string().min(5, "Full address is required"),

    // Step 4 — Property Details
    propertyCategory: z.enum(
      [
        "apartment",
        "duplex",
        "bungalow",
        "terraced",
        "semi-detached",
        "detached",
        "mansion",
        "studio",
        "penthouse",
        "office",
        "hotel-room",
      ],
      { required_error: "Please select a property category" }
    ),
    bedrooms: z.number({ invalid_type_error: "Required" }).min(0).max(20),
    bathrooms: z.number({ invalid_type_error: "Required" }).min(1).max(20),
    toilets: z.number({ invalid_type_error: "Required" }).min(1).max(20),
    sizeInSqm: z.number().min(1).optional(),
    furnished: z.enum(["furnished", "semi-furnished", "unfurnished"], {
      required_error: "Please select a furnishing status",
    }),

    // Step 5 — Pricing
    // Long-term fields
    pricePerYear: z.number().min(1).optional(),
    paymentFrequency: z
      .enum(["monthly", "quarterly", "bi-annually", "annually"])
      .optional(),
    cautionFee: z.number().min(0).optional(),
    serviceCharge: z.number().min(0).optional(),
    // Shortlet / Hotel fields
    pricePerNight: z.number().min(1).optional(),
    minimumNights: z.number().min(1).optional(),
    instantBook: z.boolean(),
    // Office fields
    pricePerYear_office: z.number().min(1).optional(),

    // Step 6 — Amenities & Rules
    amenities: z.array(z.string()).min(1, "Select at least one amenity"),
    petFriendly: z.boolean(),
    smokingAllowed: z.boolean(),
    availableFrom: z.string().min(1, "Available from date is required"),

    // Step 7 — Photos
    photos: z
      .array(z.instanceof(File))
      .min(3, "Upload at least 3 photos")
      .max(12, "Maximum 12 photos allowed"),
  })
  .superRefine((data, ctx) => {
    if (data.listingType === "long-term" && !data.pricePerYear) {
      ctx.addIssue({
        code: "custom",
        path: ["pricePerYear"],
        message: "Annual price is required",
      })
    }
    if (data.listingType === "long-term" && !data.paymentFrequency) {
      ctx.addIssue({
        code: "custom",
        path: ["paymentFrequency"],
        message: "Payment frequency is required",
      })
    }
    if (
      (data.listingType === "shortlet" || data.listingType === "hotel-room") &&
      !data.pricePerNight
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["pricePerNight"],
        message: "Nightly price is required",
      })
    }
    if (
      (data.listingType === "shortlet" || data.listingType === "hotel-room") &&
      !data.minimumNights
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["minimumNights"],
        message: "Minimum nights is required",
      })
    }
  })

export type CreateListingValues = z.infer<typeof createListingSchema>

export type ListingType = CreateListingValues["listingType"]

// Fields validated per step
export const STEP_FIELDS: (keyof CreateListingValues)[][] = [
  ["listingType"],
  ["title", "summary", "description"],
  ["state", "lga", "area", "address"],
  ["propertyCategory", "bedrooms", "bathrooms", "toilets", "furnished"],
  ["pricePerYear", "paymentFrequency", "pricePerNight", "minimumNights"],
  ["amenities", "availableFrom"],
  ["photos"],
]
