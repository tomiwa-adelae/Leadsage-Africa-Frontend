import { Suspense } from "react"
import { LandlordWalletPage } from "@/features/landlord/wallet/LandlordWalletPage"

export default function Page() {
  return (
    <div className="px-4 py-6">
      <Suspense>
        <LandlordWalletPage />
      </Suspense>
    </div>
  )
}
