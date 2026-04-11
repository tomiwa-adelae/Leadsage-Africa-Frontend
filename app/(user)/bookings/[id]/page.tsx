import { BookingDetail } from "@/features/user/bookings/BookingDetail"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Booking Details · Leadsage" }

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div>
      <BookingDetail bookingId={id} />
    </div>
  )
}
