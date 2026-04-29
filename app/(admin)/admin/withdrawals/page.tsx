import { Metadata } from "next"
import { AdminWithdrawals } from "@/features/admin/withdrawals/AdminWithdrawals"

export const metadata: Metadata = { title: "Withdrawal Requests · Leadsage Admin" }

export default function AdminWithdrawalsPage() {
  return <AdminWithdrawals />
}
