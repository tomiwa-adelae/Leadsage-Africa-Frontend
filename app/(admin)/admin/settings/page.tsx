import { Metadata } from "next"
import { SettingsPage } from "@/features/settings/SettingsPage"

export const metadata: Metadata = { title: "Settings · Leadsage Admin" }

export default function AdminSettingsPage() {
  return <SettingsPage />
}
