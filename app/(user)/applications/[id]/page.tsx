import { ApplicationDetail } from "@/features/user/applications/ApplicationDetail"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Application · Leadsage" }

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ApplicationDetail id={id} />
}
