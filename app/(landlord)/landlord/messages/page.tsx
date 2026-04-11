import { PageHeader } from "@/components/PageHeader"
import { Metadata } from "next"
export const metadata: Metadata = { title: "Messages · Leadsage Landlord" }
export default function MessagesPage() {
  return (
    <div>
      <PageHeader
        back
        title="Messages"
        description={
          "Conversations with tenants and applicatants will appear here"
        }
      />
    </div>
  )
}
