import { Metadata } from "next"
import { CreateListingWizard } from "@/features/landlord/listings/components/CreateListingWizard"

export const metadata: Metadata = {
  title: "Add Listing · Leadsage Landlord",
}

export default function NewListingPage() {
  return (
    <div>
      <CreateListingWizard />
    </div>
  )
}
