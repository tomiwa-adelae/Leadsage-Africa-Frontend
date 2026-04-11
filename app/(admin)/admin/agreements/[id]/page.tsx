import { AdminAgreementDetail } from "@/features/admin/agreements/AdminAgreementDetail"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Agreement · Leadsage Admin" }

export default async function AdminAgreementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <AdminAgreementDetail id={id} />
}
