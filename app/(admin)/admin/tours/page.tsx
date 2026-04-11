import { AdminTours } from "@/features/admin/tours/AdminTours"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Tours · Leadsage Admin" }

export default function AdminToursPage() {
  return <AdminTours />
}
