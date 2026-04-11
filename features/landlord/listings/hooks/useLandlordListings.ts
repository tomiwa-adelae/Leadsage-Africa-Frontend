import { useEffect, useState } from "react"
import { fetchData } from "@/lib/api"
import { LandlordListing } from "../types/listing"

export function useLandlordListings() {
  const [listings, setListings] = useState<LandlordListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchData<LandlordListing[]>("/listings")
      .then((data) => {
        if (!cancelled) {
          setListings(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load listings.")
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { listings, setListings, loading, error }
}
