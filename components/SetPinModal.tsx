"use client"

import { useState } from "react"
import { IconLoader2, IconLock } from "@tabler/icons-react"
import { toast } from "sonner"

import { postData } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

interface Props {
  open: boolean
  onSuccess: () => void
}

export function SetPinModal({ open, onSuccess }: Props) {
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [step, setStep] = useState<"set" | "confirm">("set")
  const [loading, setLoading] = useState(false)

  function handlePinChange(value: string) {
    setPin(value)
    if (value.length === 4) setStep("confirm")
  }

  function handleBack() {
    setStep("set")
    setPin("")
    setConfirmPin("")
  }

  async function handleConfirm(value: string) {
    setConfirmPin(value)
    if (value.length < 4) return

    if (value !== pin) {
      toast.error("PINs do not match. Please try again.")
      setStep("set")
      setPin("")
      setConfirmPin("")
      return
    }

    setLoading(true)
    try {
      await postData("/wallet/set-pin", { pin, confirmPin: value })
      toast.success("Transaction PIN set successfully!")
      onSuccess()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to set PIN")
      setStep("set")
      setPin("")
      setConfirmPin("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-sm"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <IconLock className="size-6 text-primary" />
          </div>
          <DialogTitle className="text-center">
            {step === "set" ? "Create a transaction PIN" : "Confirm your PIN"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === "set"
              ? "Set a 4-digit PIN to authorise all wallet transactions."
              : "Re-enter your PIN to confirm."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-2">
          {step === "set" ? (
            <InputOTP
              maxLength={4}
              value={pin}
              onChange={handlePinChange}
              inputMode="numeric"
              autoFocus
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          ) : (
            <>
              <InputOTP
                maxLength={4}
                value={confirmPin}
                onChange={handleConfirm}
                inputMode="numeric"
                autoFocus
                disabled={loading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
              {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IconLoader2 className="size-4 animate-spin" />
                  Saving…
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                disabled={loading}
              >
                Change PIN
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
