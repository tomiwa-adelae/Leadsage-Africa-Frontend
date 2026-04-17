import { Metadata } from "next"
import { LandlordShortlets } from "@/features/landlord/listings/LandlordShortlets"

export const metadata: Metadata = { title: "Shortlets · Leadsage Landlord" }

export default function ShortletsPage() {
  return <LandlordShortlets />
}
