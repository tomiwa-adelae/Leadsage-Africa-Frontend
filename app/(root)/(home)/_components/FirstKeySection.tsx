import Link from "next/link"
import {
  IconPigMoney,
  IconChartLine,
  IconShieldCheck,
  IconUsers,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

const PERKS = [
  {
    icon: IconChartLine,
    title: "12% annual yield",
    description:
      "Your savings grow at 12% per year well above what most banks offer.",
  },
  {
    icon: IconShieldCheck,
    title: "Locked until you need it",
    description:
      "Funds are reserved for housing. No temptation, no withdrawal without purpose.",
  },
  {
    icon: IconPigMoney,
    title: "Start with any amount",
    description:
      "Save daily, weekly, or monthly. There's no minimum barrier to get started.",
  },
  {
    icon: IconUsers,
    title: "FirstKey Duo",
    description:
      "Saving with a partner or spouse? Split contributions and hit your goal faster.",
  },
]

export function FirstKeySection() {
  return (
    <section className="container py-14">
      <div className="overflow-hidden rounded-3xl bg-primary">
        <div className="grid gap-0 lg:grid-cols-2">
          {/* Left: copy */}
          <div className="flex flex-col justify-center p-8 md:p-12 lg:p-14">
            <span className="mb-5 inline-flex w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
              FirstKey Savings Plan
            </span>
            <h2 className="text-2xl leading-tight font-bold text-white md:text-3xl lg:text-4xl">
              Your rent is closer than you think
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/75">
              Thousands of Nigerians are already saving toward their next home
              with FirstKey our automated housing savings plan that earns 12%
              annually.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="white" size="sm" asChild>
                <Link href="/firstkey">Start saving</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/firstkey#how-it-works">See how it works</Link>
              </Button>
            </div>
          </div>

          {/* Right: perks grid */}
          <div className="grid grid-cols-2 gap-px border-t border-white/10 bg-white/10 lg:border-t-0 lg:border-l">
            {PERKS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex flex-col gap-3 bg-primary p-6 md:p-7"
              >
                <div className="inline-flex size-10 items-center justify-center rounded-xl bg-white/15">
                  <Icon className="size-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/65">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
