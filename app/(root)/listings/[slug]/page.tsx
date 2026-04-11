import { ListingDetail } from "@/features/listings/ListingDetail"

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <ListingDetail slug={slug} />
}
