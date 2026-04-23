import Image from "next/image"
import { HeroSearchForm } from "./HeroSearchForm"

const STATS = [
  { value: "200+", label: "Verified listings" },
  { value: "6+", label: "Cities covered" },
  { value: "100+", label: "Trusted landlords" },
  { value: "12%", label: "FirstKey annual yield" },
]

export function Hero() {
  return (
    <section
      className="bg-no-scroll relative min-h-[88vh] overflow-hidden bg-cover bg-center text-white"
      style={{ backgroundImage: "url(/assets/images/hero-bg.jpg)" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-primary/60" />

      {/* Decorative circles — top right */}
      <div className="pointer-events-none absolute -top-32 -right-32 hidden md:block">
        <div className="size-[600px] rounded-full bg-white/5" />
        <div className="absolute inset-[60px] rounded-full bg-white/5" />
        <div className="absolute inset-[120px] rounded-full bg-white/5" />
      </div>

      <div className="relative z-10 container grid grid-cols-1 items-center gap-10 py-16 md:py-24 lg:grid-cols-5 lg:gap-16">
        {/* ── Left col ── */}
        <div className="lg:col-span-3">
          {/* Pill badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur-sm">
            <span className="size-2 animate-pulse rounded-full bg-emerald-400" />
            Nigeria's trusted property platform
          </div>

          <h1 className="text-4xl leading-tight font-bold md:text-5xl md:leading-tight lg:text-6xl lg:leading-tight">
            Find home, <span className="text-emerald-300">not just</span>
            <br />a house.
          </h1>

          <p className="mt-4 max-w-md text-base leading-relaxed text-white/75">
            Search verified long-term rentals, shortlets, and office spaces
            across Nigeria then save toward your first key with{" "}
            <span className="font-medium text-white">12% annual yield.</span>
          </p>

          <HeroSearchForm />

          {/* Stats row */}
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-bold">{value}</p>
                <p className="mt-0.5 text-sm text-white/60">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right col ── */}
        <div className="relative hidden justify-end lg:col-span-2 lg:flex">
          {/* Floating property cards */}
          <div className="absolute top-8 -left-6 z-10 flex max-w-[200px] items-center gap-3 rounded-xl bg-white/95 px-3 py-2.5 text-foreground shadow-xl backdrop-blur">
            <div className="relative size-10 shrink-0 overflow-hidden rounded-lg">
              <Image
                src="/assets/images/listing-2.jpg"
                alt="Featured property"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-xs leading-tight font-semibold">
                Lekki Phase 1
              </p>
              <p className="text-xs text-muted-foreground">₦450,000/yr</p>
              <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                Available
              </span>
            </div>
          </div>

          <div className="absolute bottom-12 -left-4 z-10 flex max-w-[200px] items-center gap-3 rounded-xl bg-white/95 px-3 py-2.5 text-foreground shadow-xl backdrop-blur">
            <div className="relative size-10 shrink-0 overflow-hidden rounded-lg">
              <Image
                src="/assets/images/listing-3.jpg"
                alt="Featured shortlet"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-xs leading-tight font-semibold">Ikeja GRA</p>
              <p className="text-xs text-muted-foreground">₦25,000/night</p>
              <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                Shortlet
              </span>
            </div>
          </div>

          <Image
            src="/assets/images/showcase-display-img.png"
            alt="Property showcase"
            width={480}
            height={520}
            className="h-auto max-h-[480px] w-auto object-contain drop-shadow-2xl"
            priority
          />
        </div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-16 bg-gradient-to-t from-background/20 to-transparent" />
    </section>
  )
}
