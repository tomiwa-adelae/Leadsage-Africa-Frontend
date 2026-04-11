import { AdminBookingDetail } from "@/features/admin/bookings/AdminBookingDetail"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Booking Detail · Leadsage Admin" }

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <AdminBookingDetail bookingId={id} />
}
