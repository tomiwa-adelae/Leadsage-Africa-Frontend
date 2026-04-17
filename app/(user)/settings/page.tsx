import { Metadata } from "next"
import { SettingsPage } from "@/features/settings/SettingsPage"

export const metadata: Metadata = { title: "Settings · Leadsage" }

export default function UserSettingsPage() {
  return <SettingsPage />
}
