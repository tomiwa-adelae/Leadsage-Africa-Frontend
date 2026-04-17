import { Metadata } from "next"
import { LandlordLeases } from "@/features/landlord/listings/LandlordLeases"

export const metadata: Metadata = { title: "Leases · Leadsage Landlord" }

export default function LeasesPage() {
  return <LandlordLeases />
}
