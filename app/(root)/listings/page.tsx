import { Suspense } from "react"
import { ListingsBrowse } from "@/features/listings/ListingsBrowse"

export const metadata = {
  title: "Browse Listings | Leadsage Africa",
  description: "Find long-term rentals, shortlets, office spaces and hotel rooms across Nigeria.",
}

export default function ListingsPage({
  searchParams,
}: {
  searchParams: { type?: string }
}) {
  return (
    <Suspense>
      <ListingsBrowse initialType={searchParams.type} />
    </Suspense>
  )
}
