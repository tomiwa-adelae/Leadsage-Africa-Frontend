import { AdminListingDetail } from "@/features/admin/listings/AdminListingDetail"

export default async function AdminListingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <AdminListingDetail slug={slug} />
}
