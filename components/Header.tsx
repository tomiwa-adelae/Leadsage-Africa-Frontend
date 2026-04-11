"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Logo } from "@/components/Logo"
import { MobileNavbar } from "@/components/MobileNavbar"
import { UserDropdown } from "@/components/UserDropdown"
import { listingsLinks, savingsLinks, type NavLink } from "@/constants/nav"
import { useAuth } from "@/store/useAuth"
import { cn } from "@/lib/utils"

function DropdownItem({ label, href, description }: NavLink) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className={cn(
            "flex flex-col items-start rounded-md p-3 leading-none no-underline transition-colors outline-none select-none",
            "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          )}
        >
          <div className="mb-1 text-sm leading-none font-medium">{label}</div>
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}

export function Header() {
  const { user, _hasHydrated } = useAuth()
  const isLoggedIn = _hasHydrated && !!user

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary backdrop-blur">
      <div className="container flex h-20 items-center justify-between">
        {/* Logo */}
        <Logo />

        {/* Desktop Navigation */}
        <NavigationMenu viewport={false} className="hidden lg:flex">
          <NavigationMenuList className="gap-1">
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-sm font-medium text-white hover:text-primary bg-transparent hover:bg-white/10 data-active:bg-white/10">
                Savings
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-120 grid-cols-2 gap-1 p-3">
                  {savingsLinks.map((link) => (
                    <DropdownItem key={link.href} {...link} />
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-sm font-medium text-white hover:text-primary bg-transparent hover:bg-white/10 data-active:bg-white/10">
                Listings
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-120 grid-cols-2 gap-1 p-3">
                  {listingsLinks.map((link) => (
                    <DropdownItem key={link.href} {...link} />
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <UserDropdown />
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hidden text-white hover:bg-white/10 hover:text-white lg:inline-flex"
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button
                variant="white"
                size="sm"
                asChild
                className="hidden lg:inline-flex"
              >
                <Link href="/register">Join Now</Link>
              </Button>
            </>
          )}
          <MobileNavbar />
        </div>
      </div>
    </header>
  )
}
