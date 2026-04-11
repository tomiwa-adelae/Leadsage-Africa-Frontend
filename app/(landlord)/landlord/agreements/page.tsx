import { LandlordAgreements } from "@/features/landlord/agreements/LandlordAgreements"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Agreements · Leadsage Landlord" }

export default function LandlordAgreementsPage() {
  return <LandlordAgreements />
}
