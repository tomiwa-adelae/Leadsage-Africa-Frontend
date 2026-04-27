import { Metadata } from "next"
import { AdminLedger } from "@/features/admin/ledger/AdminLedger"

export const metadata: Metadata = { title: "Financial Ledger · Leadsage Admin" }

export default function AdminLedgerPage() {
  return <AdminLedger />
}
