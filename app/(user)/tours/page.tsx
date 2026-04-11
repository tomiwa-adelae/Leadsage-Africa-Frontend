import { MyTours } from "@/features/user/tours/MyTours"
import { Metadata } from "next"

export const metadata: Metadata = { title: "My Tours · Leadsage" }

export default function ToursPage() {
  return <MyTours />
}
