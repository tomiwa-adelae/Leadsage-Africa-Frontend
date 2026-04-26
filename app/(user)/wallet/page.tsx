import { Suspense } from "react"
import { WalletPage } from "@/features/user/wallet/WalletPage"

export default function Page() {
  return (
    <div>
      <Suspense>
        <WalletPage />
      </Suspense>
    </div>
  )
}
