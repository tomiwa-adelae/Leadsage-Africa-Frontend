import { AgreementDetail } from "@/features/user/agreements/AgreementDetail"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Agreement · Leadsage" }

export default async function AgreementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <AgreementDetail id={id} />
}
