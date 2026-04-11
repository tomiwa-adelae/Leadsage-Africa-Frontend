import { Logo } from "@/components/Logo"

const stats = [
  { value: "5,000+", label: "Student savers" },
  { value: "₦0", label: "Setup fees" },
  { value: "12%", label: "Annual yield" },
  { value: "100%", label: "Verified listings" },
]

export function BrandPanel() {
  return (
    <div className="relative hidden h-full flex-col justify-between bg-primary p-10 lg:flex">
      {/* Subtle grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Top — Logo */}
      <div className="relative">
        <Logo />
      </div>

      {/* Middle — Tagline */}
      <div className="relative space-y-4">
        <h2 className="text-4xl font-bold leading-tight text-white">
          Africa&apos;s most trusted housing platform
        </h2>
        <p className="text-base text-white/70 max-w-xs leading-relaxed">
          Find verified properties, save toward your rent, and manage every step
          of your housing journey — all in one place.
        </p>
      </div>

      {/* Bottom — Stats */}
      <div className="relative grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-white/10 p-4 backdrop-blur-sm"
          >
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-white/60 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
