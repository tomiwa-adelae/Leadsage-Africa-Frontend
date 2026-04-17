import { Metadata } from "next"
import { LandlordListingDetail } from "@/features/landlord/listings/LandlordListingDetail"

export const metadata: Metadata = {
  title: "Listing Detail · Leadsage Landlord",
}

export default async function LandlordListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <LandlordListingDetail id={id} />
}
