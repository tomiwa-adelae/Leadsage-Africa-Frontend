"use client"

import { useMemo } from "react"
import { IconCheck, IconX } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

type Requirement = {
  met: boolean
  text: string
}

function checkStrength(pass: string): Requirement[] {
  const requirements = [
    { regex: /.{8,}/, text: "At least 8 characters" },
    { regex: /[0-9]/, text: "At least 1 number" },
    { regex: /[a-z]/, text: "At least 1 lowercase letter" },
    { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
    { regex: /[!@#$%^&*(),.?":{}|<>]/, text: "At least 1 special character" },
  ]

  return requirements.map((req) => ({
    met: req.regex.test(pass),
    text: req.text,
  }))
}

function getStrengthColor(score: number) {
  if (score === 0) return "bg-border"
  if (score <= 2) return "bg-red-500"
  if (score === 3) return "bg-orange-400"
  if (score === 4) return "bg-yellow-400"
  return "bg-green-500"
}

function getStrengthText(score: number) {
  if (score === 0) return ""
  if (score <= 2) return "Weak"
  if (score === 3) return "Medium"
  if (score === 4) return "Good"
  return "Strong"
}

function getStrengthTextColor(score: number) {
  if (score <= 2) return "text-red-500"
  if (score === 3) return "text-orange-400"
  if (score === 4) return "text-yellow-500"
  return "text-green-500"
}

type Props = {
  password: string
}

export function PasswordStrength({ password }: Props) {
  const strength = checkStrength(password)

  const score = useMemo(
    () => strength.filter((r) => r.met).length,
    [strength]
  )

  if (!password) return null

  return (
    <div className="space-y-3 mt-2">
      {/* Segmented strength bar */}
      <div className="space-y-1.5">
        <div className="flex gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-300",
                i < score ? getStrengthColor(score) : "bg-border"
              )}
            />
          ))}
        </div>
        {score > 0 && (
          <p className={cn("text-xs font-medium", getStrengthTextColor(score))}>
            {getStrengthText(score)} password
          </p>
        )}
      </div>

      {/* Requirements checklist */}
      <ul className="space-y-1.5">
        {strength.map((req) => (
          <li key={req.text} className="flex items-center gap-2">
            <span
              className={cn(
                "flex size-4 flex-shrink-0 items-center justify-center rounded-full transition-colors",
                req.met
                  ? "bg-green-500/15 text-green-600"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {req.met ? (
                <IconCheck className="size-2.5" strokeWidth={3} />
              ) : (
                <IconX className="size-2.5" strokeWidth={3} />
              )}
            </span>
            <span
              className={cn(
                "text-xs transition-colors",
                req.met ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {req.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
