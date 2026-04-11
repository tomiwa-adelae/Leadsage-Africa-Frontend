import { LandlordBookingDetail } from "@/features/landlord/bookings/LandlordBookingDetail"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Booking Detail · Landlord" }

export default async function LandlordBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div>
      <LandlordBookingDetail bookingId={id} />
    </div>
  )
}
