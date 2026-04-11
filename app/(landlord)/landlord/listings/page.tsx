import { Metadata } from "next"
import { ListingsTable } from "@/features/landlord/listings/components/ListingsTable"

export const metadata: Metadata = {
  title: "Listings · Leadsage Landlord",
}

export default function ListingsPage() {
  return (
    <div>
      <ListingsTable />
    </div>
  )
}
