import { ScreeningForm } from "@/features/user/applications/ScreeningForm"
import { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = { title: "Rental Application · Leadsage" }

export default function ScreeningPage() {
  return (
    <Suspense>
      <ScreeningForm />
    </Suspense>
  )
}
