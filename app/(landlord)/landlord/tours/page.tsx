import { LandlordTours } from "@/features/landlord/tours/LandlordTours"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Tours · Leadsage Landlord" }

export default function LandlordToursPage() {
  return <LandlordTours />
}
