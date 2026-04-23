import Image from "next/image"
import Link from "next/link"
import {
  IconSettings,
  IconPigMoney,
  IconFileText,
  IconKey,
  IconTarget,
  IconSofa,
  IconUsers,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

const FIRSTKEY_STEPS = [
  { icon: IconSettings, label: "Setup" },
  { icon: IconPigMoney, label: "Saving" },
  { icon: IconFileText, label: "Lease" },
  { icon: IconKey, label: "Key" },
]

export function SavingsShowcase() {
  return (
    <section className="container py-14">
      <div className="mb-10">
        <h2 className="text-2xl font-bold md:text-3xl">
          Leadsage Savings{" "}
          <span className="text-primary">purpose-built for ownership</span>
        </h2>
        <p className="mt-2 text-muted-foreground">
          Four ways we make saving for a home feel like a breeze.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ── Large: FirstKey ── */}
        <div className="relative flex flex-col gap-6 overflow-hidden rounded-2xl border bg-card p-7">
          {/* Faint watermark icon */}
          <div className="pointer-events-none absolute -right-6 -bottom-6 size-40 text-primary/5">
            <IconPigMoney className="size-full" />
          </div>

          <div className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <IconKey className="size-5 text-primary" />
          </div>

          <div>
            <h3 className="text-lg leading-snug font-semibold">
              Save for your first key before graduation
            </h3>
            <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              FirstKey is Leadsage's automated housing savings plan built
              specifically for Nigerian undergraduates. Set a rent target, pick
              a schedule, and let the platform do the rest.
            </p>
          </div>

          {/* Steps */}
          <div className="flex items-center gap-3">
            {FIRSTKEY_STEPS.map(({ icon: Icon, label }, i) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`flex size-10 items-center justify-center rounded-full border-2 ${
                      i === 0
                        ? "border-primary bg-primary text-white"
                        : i === 1
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="size-4" />
                  </div>
                  <span
                    className={`text-[10px] font-semibold tracking-wide uppercase ${
                      i <= 1 ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < FIRSTKEY_STEPS.length - 1 && (
                  <div
                    className={`mb-4 h-px w-6 shrink-0 ${i === 0 ? "bg-primary" : "bg-border"}`}
                  />
                )}
              </div>
            ))}
          </div>

          <Button asChild size="sm" className="w-fit">
            <Link href="/firstkey">Start saving free</Link>
          </Button>
        </div>

        {/* ── Rent Target ── */}
        <div className="flex flex-col justify-between gap-6 rounded-2xl bg-primary p-7">
          <div className="inline-flex size-10 items-center justify-center rounded-xl bg-white/15">
            <IconTarget className="size-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Rent Target</h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/70">
              Create the perfect roadmap to a stress-free annual rent cycle. Set
              your target amount, timeline, and let FirstKey handle the
              milestones.
            </p>
          </div>
          <Button variant="white" size="sm" className="w-fit" asChild>
            <Link href="/firstkey">Set my rent target</Link>
          </Button>
        </div>

        {/* ── Furniture Emergency Fund ── */}
        <div className="flex flex-col gap-5 rounded-2xl border bg-card p-7">
          <div className="inline-flex size-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/30">
            <IconSofa className="size-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold">Furniture Emergency Fund</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Protect your living space. Dedicated reserves for home maintenance
              and essential furnishing so you're never caught off guard.
            </p>
          </div>
          <Button variant="outline" size="sm" className="w-fit" asChild>
            <Link href="/furniture-savings">Learn more</Link>
          </Button>
        </div>

        {/* ── Joint Savings ── */}
        <div className="flex flex-col overflow-hidden rounded-2xl border bg-card sm:flex-row">
          {/* Text */}
          <div className="flex flex-1 flex-col justify-center gap-4 p-7">
            <div className="inline-flex size-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/30">
              <IconUsers className="size-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="font-semibold">Joint Savings</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Plan a future together. Open a joint saving target and track
                your progress as a unit towards your savings goal.
              </p>
            </div>
            <Button variant="outline" size="sm" className="w-fit" asChild>
              <Link href="/firstkey-duo">Create Joint Savings</Link>
            </Button>
          </div>

          {/* Image */}
          <div className="relative h-48 shrink-0 overflow-hidden sm:h-auto sm:w-44">
            <Image
              src="/assets/images/showcase-display-img.png"
              alt="Couple saving together"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-card via-transparent to-transparent sm:bg-gradient-to-l" />
          </div>
        </div>
      </div>
    </section>
  )
}
