import { IconCheck } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

const steps = [
  { label: "Type" },
  { label: "Info" },
  { label: "Location" },
  { label: "Details" },
  { label: "Pricing" },
  { label: "Amenities" },
  { label: "Photos" },
  { label: "Review" },
]

type Props = {
  current: number // 0-indexed
}

export function StepIndicator({ current }: Props) {
  return (
    <div className="flex items-center justify-center gap-1 overflow-x-auto pb-1">
      {steps.map((step, i) => {
        const completed = i < current
        const active = i === current

        return (
          <div
            key={step.label}
            className="flex flex-shrink-0 items-center gap-1"
          >
            {/* Step circle */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all",
                  completed &&
                    "border-primary bg-primary text-primary-foreground",
                  active && "border-primary bg-primary/10 text-primary",
                  !completed &&
                    !active &&
                    "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {completed ? (
                  <IconCheck className="size-3.5" strokeWidth={3} />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "mb-4 h-0.5 w-6 rounded-full transition-all",
                  i < current ? "bg-primary" : "bg-muted-foreground/20"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
