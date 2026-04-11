import { RentalPayments } from "@/features/user/payments/RentalPayments"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Rental Payments · Leadsage" }

export default function RentalPaymentsPage() {
  return <RentalPayments />
}
