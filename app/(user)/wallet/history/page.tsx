import { Suspense } from "react"
import { WalletHistory } from "@/features/user/wallet/WalletHistory"

export const metadata = { title: "Transaction History" }

export default function WalletHistoryPage() {
  return (
    <Suspense>
      <WalletHistory />
    </Suspense>
  )
}
