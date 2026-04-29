import { Geist, Geist_Mono, Outfit } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { Metadata, Viewport } from "next"
import { env } from "@/lib/env"

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: {
    default: "Leadsage | Find Your Dream Home in Nigeria",
    template: "%s | Leadsage",
  },
  description:
    "Discover verified rental properties and homes for sale in Nigeria. With Leadsage, searching, booking, and managing your next home is simple, fast, and secure.",
  openGraph: {
    title: "Leadsage | Find Your Dream Home in Nigeria",
    description:
      "Discover verified rental properties and homes for sale in Nigeria. With Leadsage, searching, booking, and managing your next home is simple, fast, and secure.",
    images: [{ url: "/assets/images/opengraph.png", width: 1200, height: 630 }],
    siteName: "Leadsage",
    type: "website",
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "Leadsage | Find Your Dream Home in Nigeria",
    description:
      "Discover verified rental properties and homes for sale in Nigeria.",
    images: "/assets/images/opengraph.png",
  },
  metadataBase: new URL(env.NEXT_PUBLIC_FRONTEND_URL),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        outfit.variable
      )}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>
            {children}
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
