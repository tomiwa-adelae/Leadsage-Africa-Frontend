import { LandlordBookings } from "@/features/landlord/bookings/LandlordBookings"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Bookings · Leadsage Landlord" }

export default function BookingsPage() {
  return <LandlordBookings />
}
