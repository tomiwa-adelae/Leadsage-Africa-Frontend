"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { IconLoader2, IconArrowLeft } from "@tabler/icons-react"
import { toast } from "sonner"
import axios from "axios"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import api from "@/lib/api"

const RESEND_COOLDOWN = 10 * 60 // 10 minutes

const schema = z.object({
  otp: z
    .string()
    .length(6, { message: "Code must be exactly 6 digits." })
    .regex(/^\d+$/, { message: "Code must contain only digits." }),
})

type Values = z.infer<typeof schema>

export function VerifyCodeForm() {
  const router = useRouter()
  const params = useSearchParams()
  const email = params.get("email") ?? ""

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN)

  // Guard: redirect back if no email param
  useEffect(() => {
    if (!email) router.replace("/forgot-password")
  }, [email, router])

  // Countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(id)
  }, [secondsLeft])

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { otp: "" },
  })

  async function onSubmit(values: Values) {
    setIsSubmitting(true)
    try {
      await api.post("/auth/verify-code", { email, otp: values.otp })
      toast.success("Code verified. Set your new password.")
      router.push(
        `/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(values.otp)}`
      )
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message ?? "Invalid or expired code.")
      } else {
        toast.error("Something went wrong. Please try again.")
      }
      form.reset()
    } finally {
      setIsSubmitting(false)
    }
  }

  async function onResend() {
    setIsResending(true)
    try {
      await api.post("/auth/forgot-password", { email })
      toast.success("A new code has been sent to your email.")
      setSecondsLeft(RESEND_COOLDOWN)
      form.reset()
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message ?? "Failed to resend code.")
      } else {
        toast.error("Something went wrong. Please try again.")
      }
    } finally {
      setIsResending(false)
    }
  }

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const countdownLabel = `${minutes}:${String(seconds).padStart(2, "0")}`

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Check your email
        </h1>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">{email}</span>. Enter it
          below to continue.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verification code</FormLabel>
                <FormControl>
                  <InputOTP
                    maxLength={6}
                    value={field.value}
                    onChange={field.onChange}
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    disabled={isSubmitting}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <IconLoader2 className="size-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify code"
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm text-muted-foreground">
        {secondsLeft > 0 ? (
          <span>
            Resend code in{" "}
            <span className="font-medium text-foreground tabular-nums">
              {countdownLabel}
            </span>
          </span>
        ) : (
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-sm"
            disabled={isResending}
            onClick={onResend}
          >
            {isResending ? (
              <>
                <IconLoader2 className="size-3 animate-spin" />
                Resending...
              </>
            ) : (
              "Resend code"
            )}
          </Button>
        )}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Wrong email?{" "}
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline underline-offset-4"
        >
          <IconArrowLeft className="size-3" />
          Go back
        </Link>
      </p>
    </div>
  )
}
