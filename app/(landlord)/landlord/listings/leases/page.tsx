import { PageHeader } from "@/components/PageHeader"
import { Metadata } from "next"
export const metadata: Metadata = { title: "Leases · Leadsage Landlord" }
export default function LeasesPage() {
  return (
    <div>
      <PageHeader
        back
        title={"Leases"}
        description={"Active and past lease agreements will appear here."}
      />
    </div>
  )
}
