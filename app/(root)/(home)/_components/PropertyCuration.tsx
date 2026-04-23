import Image from "next/image"
import { IconSearch, IconStar, IconHome } from "@tabler/icons-react"

const FEATURES = [
  {
    icon: IconSearch,
    title: "Discover",
    description:
      "Browse our curated portfolio of premium listings, offered by the finest consultants known for quality and expert insights.",
  },
  {
    icon: IconStar,
    title: "Experience",
    description:
      "Schedule viewings effortlessly at a time that suits you. Our consultants provide on-site guidance at every neighbourhood.",
  },
  {
    icon: IconHome,
    title: "Acquire",
    description:
      "From document verification to digital lease signing finalize your rental entirely through our secure digital platform.",
  },
]

const STATS = [
  {
    label: "Total Houses",
    value: "200+",
    top: "top-16",
    left: "-left-4 sm:-left-10",
    avatars: [
      "/assets/images/profile-img.jpg",
      "/assets/images/profile-img.jpg",
      "/assets/images/profile-img.jpg",
    ],
  },
  {
    label: "Listings",
    value: "12+",
    top: "top-1/2 -translate-y-1/2",
    left: "right-0 sm:-right-8",
    avatars: [
      "/assets/images/profile-img.jpg",
      "/assets/images/profile-img.jpg",
    ],
  },
  {
    label: "Happy Customers",
    value: "50+",
    top: "bottom-16",
    left: "-left-4 sm:-left-10",
    avatars: [
      "/assets/images/profile-img.jpg",
      "/assets/images/profile-img.jpg",
      "/assets/images/profile-img.jpg",
    ],
  },
]

function StatBadge({
  label,
  value,
  avatars,
}: {
  label: string
  value: string
  avatars: string[]
}) {
  return (
    <div className="flex w-max items-center gap-2.5 rounded-2xl border bg-white px-3 py-2.5 shadow-lg dark:bg-card">
      {/* Stacked avatars */}
      <div className="flex -space-x-2">
        {avatars.map((src, i) => (
          <div
            key={i}
            className="relative size-7 overflow-hidden rounded-full border-2 border-white dark:border-card"
          >
            <Image src={src} alt="user" fill className="object-cover" />
          </div>
        ))}
      </div>
      <div>
        <p className="text-xs leading-none font-bold text-foreground">
          {value}
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

export function PropertyCuration() {
  return (
    <section className="overflow-hidden bg-muted/40 py-14">
      <div className="container">
        {/* Heading */}
        <div className="mx-auto mb-12 max-w-xl text-center">
          <h2 className="text-2xl font-bold md:text-3xl">
            Seamless property curation
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We re-define the journey of finding your next home. Our three-stage
            approach keeps everything intentional, transparent, and stress-free.
          </p>
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: features */}
          <div className="flex flex-col gap-8">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="size-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: phone mockup + floating badges */}
          <div className="relative flex justify-center">
            {/* Subtle glow behind phone */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="size-72 rounded-full bg-primary/10 blur-3xl" />
            </div>

            {/* Phone image */}
            <div className="relative z-10 w-56 sm:w-64">
              <Image
                src="/assets/images/mobile-home-page.jpg"
                alt="Leadsage mobile app"
                width={400}
                height={800}
                className="w-full rounded-[2.5rem] drop-shadow-2xl"
              />
            </div>

            {/* Floating badge — top left */}
            <div className="absolute top-8 left-0 z-20 animate-none sm:-left-6">
              <StatBadge
                label="Total Houses"
                value="200+"
                avatars={[
                  "/assets/images/profile-img.jpg",
                  "/assets/images/profile-img.jpg",
                  "/assets/images/profile-img.jpg",
                ]}
              />
            </div>

            {/* Floating badge — middle right */}
            <div className="absolute top-1/2 right-0 z-20 -translate-y-1/2 sm:-right-6">
              <StatBadge
                label="Listings"
                value="12+"
                avatars={[
                  "/assets/images/profile-img.jpg",
                  "/assets/images/profile-img.jpg",
                ]}
              />
            </div>

            {/* Floating badge — bottom left */}
            <div className="absolute bottom-8 left-0 z-20 sm:-left-6">
              <StatBadge
                label="Happy Customers"
                value="50+"
                avatars={[
                  "/assets/images/profile-img.jpg",
                  "/assets/images/profile-img.jpg",
                  "/assets/images/profile-img.jpg",
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
