import { AdminScreeningApplications } from "@/features/admin/screening/AdminScreeningApplications"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Screening Applications · Leadsage Admin" }

export default function AdminScreeningApplicationsPage() {
  return <AdminScreeningApplications />
}
