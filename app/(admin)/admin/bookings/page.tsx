import { AdminBookings } from "@/features/admin/bookings/AdminBookings"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Bookings · Leadsage Admin" }

export default function AdminBookingsPage() {
  return <AdminBookings />
}
