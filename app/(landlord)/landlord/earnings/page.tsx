import { LandlordEarnings } from "@/features/landlord/earnings/LandlordEarnings"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Earnings · Leadsage Landlord" }

export default function EarningsPage() {
  return (
    <div>
      <LandlordEarnings />
    </div>
  )
}
