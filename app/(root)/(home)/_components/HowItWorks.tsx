import { IconSearch, IconFileText, IconKey, IconPigMoney } from "@tabler/icons-react"

const STEPS = [
  {
    icon: IconSearch,
    step: "01",
    title: "Find your property",
    description:
      "Search verified listings by location, type, and budget. Filter by bedrooms, furnishing, and availability.",
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    icon: IconFileText,
    step: "02",
    title: "Apply or book",
    description:
      "Submit a rental application for long-term stays or book instantly for shortlets and hotel rooms.",
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    icon: IconKey,
    step: "03",
    title: "Sign & move in",
    description:
      "Sign your tenancy agreement digitally, make a secure payment, and collect your keys — all on Leadsage.",
    color: "text-violet-600",
    bg: "bg-violet-50 dark:bg-violet-950/30",
  },
  {
    icon: IconPigMoney,
    step: "04",
    title: "Save with FirstKey",
    description:
      "Not ready yet? Start saving toward your rent with our 12% annual yield savings plan — built for Nigerians.",
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
]

export function HowItWorks() {
  return (
    <section className="container py-14">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold md:text-3xl">How Leadsage works</h2>
        <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
          From searching to signing — your entire housing journey in one platform.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map(({ icon: Icon, step, title, description, color, bg }) => (
          <div key={step} className="relative flex flex-col gap-4 rounded-2xl border bg-card p-6">
            {/* Step number */}
            <span className="absolute top-5 right-5 text-xs font-bold text-muted-foreground/40 tabular-nums">
              {step}
            </span>

            <div className={`inline-flex size-11 items-center justify-center rounded-xl ${bg} ${color}`}>
              <Icon className="size-5" />
            </div>

            <div>
              <p className="font-semibold">{title}</p>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
