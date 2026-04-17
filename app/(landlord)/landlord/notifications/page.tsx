import { Metadata } from "next"
import { LandlordNotifications } from "@/features/landlord/notifications/LandlordNotifications"

export const metadata: Metadata = { title: "Notifications · Leadsage Landlord" }

export default function NotificationsPage() {
  return <LandlordNotifications />
}
