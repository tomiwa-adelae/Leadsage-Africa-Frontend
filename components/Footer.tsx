import Link from "next/link"
import { Logo } from "@/components/Logo"
import {
  IconBrandX,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandFacebook,
} from "@tabler/icons-react"

const LINKS = {
  Listings: [
    { label: "Long-term Rentals", href: "/listings?type=LONG_TERM" },
    { label: "Shortlets", href: "/listings?type=SHORTLET" },
    { label: "Office Spaces", href: "/listings?type=OFFICE_SPACE" },
    { label: "Hotel Rooms", href: "/listings?type=HOTEL_ROOM" },
  ],
  Savings: [
    { label: "FirstKey", href: "/firstkey" },
    { label: "FirstKey Duo", href: "/firstkey-duo" },
    { label: "Furniture Savings", href: "/furniture-savings" },
    { label: "Wallet", href: "/wallet" },
  ],
  Company: [
    { label: "About us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Refund Policy", href: "/refund" },
  ],
}

const SOCIALS = [
  { icon: IconBrandX, href: "https://x.com/leadsage", label: "X (Twitter)" },
  { icon: IconBrandInstagram, href: "https://instagram.com/leadsage", label: "Instagram" },
  { icon: IconBrandLinkedin, href: "https://linkedin.com/company/leadsage", label: "LinkedIn" },
  { icon: IconBrandFacebook, href: "https://facebook.com/leadsage", label: "Facebook" },
]

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container py-12 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand col */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <Logo color="green" className="w-28 sm:w-32" />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Nigeria's housing platform — search, save, and secure your next home without the
              stress.
            </p>
            <div className="flex items-center gap-3">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav cols */}
          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group} className="flex flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group}
              </p>
              <ul className="space-y-2.5">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Leadsage Africa. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with care in Nigeria
          </p>
        </div>
      </div>
    </footer>
  )
}
