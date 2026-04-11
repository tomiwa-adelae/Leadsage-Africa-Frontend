import { LandlordApplications } from "@/features/landlord/applications/LandlordApplications"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Applications · Leadsage Landlord" }

export default function ApplicationsPage() {
  return <LandlordApplications />
}
