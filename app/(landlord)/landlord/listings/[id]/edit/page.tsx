import { Metadata } from "next"
import { EditListingWizard } from "@/features/landlord/listings/components/EditListingWizard"

export const metadata: Metadata = {
  title: "Edit Listing · Leadsage Landlord",
}

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <EditListingWizard id={id} />
}
