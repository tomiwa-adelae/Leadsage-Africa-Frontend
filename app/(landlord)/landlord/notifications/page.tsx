import { PageHeader } from "@/components/PageHeader"
import { Metadata } from "next"
export const metadata: Metadata = { title: "Notifications · Leadsage Landlord" }
export default function NotificationsPage() {
  return (
    <div>
      <PageHeader
        back
        title="Notifications"
        description={
          "All your alerts and activity notifications will appear here"
        }
      />
    </div>
  )
}
