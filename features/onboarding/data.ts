export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
]

export const RENTER_PROPERTY_TYPES = [
  "Apartment", "Flat", "Mini Flat", "Self-contain",
  "Room & Parlour", "Studio", "Duplex", "Bungalow",
  "Terraced House", "Semi-detached",
]

export const LANDLORD_PROPERTY_TYPES = [
  "Apartment", "Flat", "Mini Flat", "Self-contain",
  "Room & Parlour", "Studio", "Duplex", "Bungalow",
  "Terraced House", "Semi-detached", "Detached House",
  "Office Space", "Warehouse", "Shop",
]

export interface BudgetBand {
  label: string
  min: number
  max: number | null
}

export const BUDGET_BANDS: BudgetBand[] = [
  { label: "Under ₦500k / yr",   min: 0,         max: 500_000 },
  { label: "₦500k – ₦1M / yr",   min: 500_000,   max: 1_000_000 },
  { label: "₦1M – ₦2M / yr",     min: 1_000_000, max: 2_000_000 },
  { label: "₦2M – ₦5M / yr",     min: 2_000_000, max: 5_000_000 },
  { label: "Above ₦5M / yr",     min: 5_000_000, max: null },
]

export const MOVE_IN_TIMELINES = [
  "Immediately",
  "Within 1 month",
  "1 – 3 months",
  "3 – 6 months",
  "6 – 12 months",
  "Just exploring",
]

export const PROPERTY_COUNTS = ["1", "2 – 5", "6 – 10", "10+"]

export const GENDERS = ["Male", "Female", "Prefer not to say"]
