import { Metadata } from "next"
import { LandlordDashboard } from "@/features/landlord/dashboard/LandlordDashboard"

export const metadata: Metadata = {
  title: "Dashboard · Leadsage Landlord",
}

export default function DashboardPage() {
  return <LandlordDashboard />
}
