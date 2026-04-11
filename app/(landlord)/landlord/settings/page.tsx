import { Metadata } from "next"
export const metadata: Metadata = { title: "Settings · Leadsage Landlord" }
export default function SettingsPage() {
  return <div className="p-6"><h1 className="text-2xl font-bold tracking-tight">Settings</h1><p className="text-sm text-muted-foreground mt-1">Profile, account, and notification preferences will appear here.</p></div>
}
