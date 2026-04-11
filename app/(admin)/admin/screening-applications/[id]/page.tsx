import { AdminScreeningDetail } from "@/features/admin/screening/AdminScreeningDetail"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Application · Leadsage Admin" }

export default async function AdminScreeningDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <AdminScreeningDetail id={id} />
}
