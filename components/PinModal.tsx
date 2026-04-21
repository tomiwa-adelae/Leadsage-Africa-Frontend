"use client"

import { useEffect, useState } from "react"
import { IconLock } from "@tabler/icons-react"

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
import { Button } from "@/components/ui/button"

interface Props {
  open: boolean
  title?: string
  description?: string
  onConfirm: (pin: string) => void
  onCancel: () => void
}

export function PinModal({
  open,
  title = "Enter transaction PIN",
  description = "Enter your 4-digit PIN to authorise this transaction.",
  onConfirm,
  onCancel,
}: Props) {
  const [pin, setPin] = useState("")

  useEffect(() => {
    if (!open) setPin("")
  }, [open])

  function handleChange(value: string) {
    setPin(value)
    if (value.length === 4) onConfirm(value)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <IconLock className="size-6 text-primary" />
          </div>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          <InputOTP
            maxLength={4}
            value={pin}
            onChange={handleChange}
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

          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
