"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  value: string | number
  onChange: (value: string) => void
}

/**
 * Currency input that formats with commas as the user types.
 * `value` accepts a plain number string ("5000") or number (5000).
 * `onChange` always returns a plain number string without commas ("5000").
 * All existing parseFloat() calls on the stored value continue to work unchanged.
 */
export function CurrencyInput({ value, onChange, className, ...props }: CurrencyInputProps) {
  const plain = String(value ?? "").replace(/[^0-9]/g, "")
  const displayed = plain ? parseInt(plain, 10).toLocaleString("en-NG") : ""

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      className={cn(className)}
      value={displayed}
      onChange={(e) => {
        const raw = e.target.value.replace(/[^0-9]/g, "")
        onChange(raw)
      }}
    />
  )
}
