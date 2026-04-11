import { Suspense } from "react"
import { PaymentCallback } from "@/features/bookings/PaymentCallback"

export const metadata = {
  title: "Payment | Leadsage Africa",
}

export default function PaymentCallbackPage() {
  return (
    <Suspense>
      <PaymentCallback />
    </Suspense>
  )
}
