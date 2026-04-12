import { SavingsPlanSettings } from "@/features/user/savings/SavingsPlanSettings"

export const metadata = { title: "Plan Settings" }

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <SavingsPlanSettings id={id} />
}
