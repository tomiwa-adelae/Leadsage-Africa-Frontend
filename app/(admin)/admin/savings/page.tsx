import { Metadata } from "next"
import { AdminSavings } from "@/features/admin/savings/AdminSavings"

export const metadata: Metadata = { title: "FirstKey Savings · Leadsage Admin" }

export default function AdminSavingsPage() {
  return <AdminSavings />
}
