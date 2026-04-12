export type BackendListingStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "PUBLISHED"
  | "REJECTED"
  | "ARCHIVED"
  | "OCCUPIED"

export type BackendListingType =
  | "LONG_TERM"
  | "SHORTLET"
  | "OFFICE_SPACE"
  | "HOTEL_ROOM"

export interface LandlordListing {
  id: string
  landlordId: string
  listingType: BackendListingType
  title: string
  summary: string | null
  description: string
  state: string
  lga: string
  area: string
  address: string
  propertyCategory: string
  bedrooms: number
  bathrooms: number
  toilets: number
  sizeInSqm: number | null
  furnished: string
  pricePerYear: number | null
  paymentFrequency: string | null
  cautionFee: number | null
  serviceCharge: number | null
  pricePerNight: number | null
  minimumNights: number | null
  amenities: string[]
  petFriendly: boolean
  smokingAllowed: boolean
  availableFrom: string
  photos: string[]
  instantBook: boolean
  status: BackendListingStatus
  rejectionReason: string | null
  views: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}
