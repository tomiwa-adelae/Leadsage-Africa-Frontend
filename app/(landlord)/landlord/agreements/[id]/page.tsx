import { LandlordAgreementDetail } from "@/features/landlord/agreements/LandlordAgreementDetail"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div>
      <LandlordAgreementDetail id={id} />
    </div>
  )
}
