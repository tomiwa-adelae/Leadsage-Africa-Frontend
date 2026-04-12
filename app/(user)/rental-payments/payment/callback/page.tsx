import { Suspense } from "react"
import { IconLoader2 } from "@tabler/icons-react"
import { RentalPaymentCallback } from "@/features/user/payments/RentalPaymentCallback"

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <IconLoader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <RentalPaymentCallback />
    </Suspense>
  )
}
