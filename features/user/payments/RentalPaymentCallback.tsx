"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  IconLoader2,
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconCalendar,
  IconCurrencyNaira,
} from "@tabler/icons-react"

import { postData } from "@/lib/api"
import { Button } from "@/components/ui/button"

interface RentalPayment {
  id: string
  amount: number
  status: string
  paidAt: string | null
  installmentNo: number | null
  totalInstallments: number | null
  listing: {
    title: string
    area: string
    state: string
  }
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n)

type Stage = "verifying" | "success" | "failed"

export function RentalPaymentCallback() {
  const params = useSearchParams()
  const router = useRouter()
  const reference = params.get("reference") ?? params.get("trxref")

  const [stage, setStage] = useState<Stage>("verifying")
  const [payment, setPayment] = useState<RentalPayment | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!reference) {
      setError("No payment reference found.")
      setStage("failed")
      return
    }

    const verify = async () => {
      try {
        const data = await postData<RentalPayment>(
          `/user/rental-payments/verify/${reference}`,
          {}
        )
        setPayment(data)
        setStage("success")
      } catch (err: any) {
        setStage("failed")
        setError(
          err?.response?.data?.message ??
            "Could not verify payment. Contact support if you were charged."
        )
      }
    }

    verify()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference])

  if (stage === "verifying") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 px-4 text-center">
        <IconLoader2 className="size-10 animate-spin text-primary" />
        <p className="text-lg font-semibold">Verifying payment…</p>
        <p className="text-sm text-muted-foreground">
          Please wait, this should only take a moment.
        </p>
      </div>
    )
  }

  if (stage === "failed") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 px-4 text-center">
        <IconCircleXFilled className="size-14 text-destructive" />
        <h1 className="text-2xl font-bold">Payment failed</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          {error ?? "Your payment was not completed. No charge has been made."}
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            Go back
          </Button>
          <Button asChild>
            <Link href="/rental-payments">My Payments</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <IconCircleCheckFilled className="size-16 text-emerald-500" />

      <div>
        <h1 className="text-2xl font-bold">Payment successful!</h1>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Your rental payment has been confirmed and recorded.
        </p>
      </div>

      {payment && (
        <div className="w-full max-w-sm rounded-xl border bg-card p-5 text-left shadow-sm">
          <p className="font-semibold">{payment.listing.title}</p>
          <p className="mb-4 text-xs text-muted-foreground">
            {payment.listing.area}, {payment.listing.state}
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconCurrencyNaira className="size-4 shrink-0" />
              <span>
                {fmt(payment.amount)}
                {payment.totalInstallments && payment.installmentNo
                  ? ` · Installment ${payment.installmentNo} of ${payment.totalInstallments}`
                  : ""}
              </span>
            </div>
            {payment.paidAt && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <IconCalendar className="size-4 shrink-0" />
                <span>
                  Paid on{" "}
                  {new Date(payment.paidAt).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            Paid
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href="/agreements">My Agreements</Link>
        </Button>
        <Button asChild>
          <Link href="/rental-payments">All Payments</Link>
        </Button>
      </div>
    </div>
  )
}
