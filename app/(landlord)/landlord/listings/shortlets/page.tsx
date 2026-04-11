import { PageHeader } from "@/components/PageHeader"
import { Metadata } from "next"
export const metadata: Metadata = { title: "Shortlets · Leadsage Landlord" }
export default function ShortletsPage() {
  return (
    <div>
      <PageHeader
        back
        title={"Shortlets"}
        description={"Your shortlet listings will appear here"}
      />
    </div>
  )
}
