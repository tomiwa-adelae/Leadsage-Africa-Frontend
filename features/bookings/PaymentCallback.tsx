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

interface BookingDetail {
  id: string
  status: string
  paymentStatus: string
  nights: number
  totalPrice: number
  checkIn: string
  checkOut: string
  listing: {
    title: string
    area: string
    state: string
    instantBook: boolean
  }
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n)

type Stage = "verifying" | "success" | "pending" | "failed"

export function PaymentCallback() {
  const params = useSearchParams()
  const router = useRouter()
  const reference = params.get("reference") ?? params.get("trxref")

  const [stage, setStage] = useState<Stage>("verifying")
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!reference) {
      setError("No payment reference found.")
      setStage("failed")
      return
    }

    const verify = async () => {
      try {
        // Call backend which asks Paystack directly — works without a webhook
        const data = await postData<BookingDetail>(
          `/user/bookings/verify-payment/${reference}`,
          {}
        )
        setBooking(data)

        if (data.paymentStatus === "PAID") {
          setStage(data.status === "CONFIRMED" ? "success" : "pending")
        } else {
          // Paystack says not paid (abandoned / failed)
          setStage("failed")
          setError("Payment was not completed. No charge has been made.")
        }
      } catch {
        setStage("failed")
        setError("Could not verify payment. Contact support if you were charged.")
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
            <Link href="/bookings">My Bookings</Link>
          </Button>
        </div>
      </div>
    )
  }

  // success or pending — both have a booking
  const isConfirmed = stage === "success"

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <IconCircleCheckFilled
        className={`size-16 ${isConfirmed ? "text-emerald-500" : "text-amber-500"}`}
      />

      <div>
        <h1 className="text-2xl font-bold">
          {isConfirmed ? "Booking confirmed!" : "Payment received"}
        </h1>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {isConfirmed
            ? "You're all set. Your booking has been automatically confirmed."
            : "Payment successful. The host will confirm your booking shortly (usually within a few hours)."}
        </p>
      </div>

      {booking && (
        <div className="w-full max-w-sm rounded-xl border bg-card p-5 text-left shadow-sm">
          <p className="font-semibold">{booking.listing.title}</p>
          <p className="mb-4 text-xs text-muted-foreground">
            {booking.listing.area}, {booking.listing.state}
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconCalendar className="size-4 shrink-0" />
              <span>
                {new Date(booking.checkIn).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}{" "}
                →{" "}
                {new Date(booking.checkOut).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconCurrencyNaira className="size-4 shrink-0" />
              <span>
                {fmt(booking.totalPrice)} · {booking.nights} night
                {booking.nights > 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div
            className={`mt-4 rounded-md px-3 py-2 text-xs font-medium ${
              isConfirmed
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
            }`}
          >
            {isConfirmed ? "Confirmed" : "Awaiting host confirmation"}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href="/listings">Browse more</Link>
        </Button>
        <Button asChild>
          <Link href="/bookings">My Bookings</Link>
        </Button>
      </div>
    </div>
  )
}
