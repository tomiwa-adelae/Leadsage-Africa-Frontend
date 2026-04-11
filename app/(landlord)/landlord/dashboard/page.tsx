import { Metadata } from "next"
import { StatsCards } from "@/features/landlord/dashboard/components/StatsCards"
import { RevenueChart } from "@/features/landlord/dashboard/components/RevenueChart"
import { RecentApplications } from "@/features/landlord/dashboard/components/RecentApplications"
import { PageHeader } from "@/components/PageHeader"

export const metadata: Metadata = {
  title: "Dashboard · Leadsage Landlord",
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      {/* Page header */}
      <PageHeader
        title={"Dashboard"}
        description={`Welcome back. Here's what's happening with your properties.`}
      />

      {/* Stats */}
      <StatsCards />

      {/* Charts + Recent applications */}
      <div className="grid gap-4 lg:grid-cols-3">
        <RevenueChart />
        <RecentApplications />
      </div>
    </div>
  )
}
