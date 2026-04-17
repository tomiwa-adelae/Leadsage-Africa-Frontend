import { Metadata } from "next"
import { AdminSavingsDetail } from "@/features/admin/savings/AdminSavingsDetail"

export const metadata: Metadata = { title: "Savings Plan · Leadsage Admin" }

export default async function AdminSavingsPlanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <AdminSavingsDetail id={id} />
}
