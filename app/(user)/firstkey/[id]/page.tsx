import { SavingsPlanDetail } from "@/features/user/savings/SavingsPlanDetail"

export const metadata = { title: "Savings Plan" }

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <SavingsPlanDetail id={id} />
}
