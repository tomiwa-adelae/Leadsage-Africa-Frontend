import { AdminAgreements } from "@/features/admin/agreements/AdminAgreements"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Agreements · Leadsage Admin" }

export default function AdminAgreementsPage() {
  return <AdminAgreements />
}
