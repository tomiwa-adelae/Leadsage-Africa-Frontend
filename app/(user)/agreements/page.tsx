import { Metadata } from "next"
import { MyAgreements } from "@/features/user/agreements/MyAgreements"

export const metadata: Metadata = {
  title: "My Agreements · Leadsage",
}

export default function AgreementsPage() {
  return <MyAgreements />
}
