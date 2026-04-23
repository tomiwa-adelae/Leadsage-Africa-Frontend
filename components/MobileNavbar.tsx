"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { IconChevronDown, IconMenu2, IconLogout } from "@tabler/icons-react"
import { Logo } from "@/components/Logo"
import {
  listingsLinks,
  resourcesLinks,
  savingsLinks,
  type NavLink,
} from "@/constants/nav"
import { useAuth } from "@/store/useAuth"
import { useSignout } from "@/hooks/use-signout"
import { DEFAULT_PROFILE_IMAGE } from "@/constants"
import { cn } from "@/lib/utils"

function CollapsibleNavSection({
  label,
  links,
  onClose,
}: {
  label: string
  links: NavLink[]
  onClose: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between font-medium">
          {label}
          <IconChevronDown
            className={cn(
              "size-4 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-1 mb-1 ml-3 space-y-1 border-l pl-3">
          {links.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              size="sm"
              asChild
              className="w-full justify-start font-normal text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function MobileNavbar() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const { user, _hasHydrated } = useAuth()
  const handleSignout = useSignout()
  const isLoggedIn = _hasHydrated && !!user

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : ""

  const dashboardHref =
    user?.role === "ADMIN"
      ? "/admin/dashboard"
      : user?.role === "LANDLORD"
        ? "/landlord/dashboard"
        : "/dashboard"

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white lg:hidden">
          <IconMenu2 className="size-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="flex w-72 flex-col p-0">
        <SheetHeader className="border-b p-4">
          <Logo className="w-36" color="green" />
        </SheetHeader>

        <ScrollArea className="flex-1">
          {/* Logged-in user info */}
          {isLoggedIn && user && (
            <>
              <div className="flex items-center gap-3 px-4 pt-1 pb-4">
                <Avatar className="size-10">
                  <AvatarFallback className="text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="space-y-1 p-3">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="w-full justify-start"
                  onClick={close}
                >
                  <Link href={dashboardHref}>My Dashboard</Link>
                </Button>
                {user.role === "CLIENT" && (
                  <>
                    <Button
                      size="sm"
                      asChild
                      className="w-full justify-start"
                      onClick={close}
                    >
                      <Link href="/saved">Saved Listings</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="w-full justify-start"
                      onClick={close}
                    >
                      <Link href="/applications">My Applications</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="w-full justify-start"
                      onClick={close}
                    >
                      <Link href="/bookings">My Bookings</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="w-full justify-start"
                      onClick={close}
                    >
                      <Link href="/notifications">Notifications</Link>
                    </Button>
                  </>
                )}
                {user.role === "LANDLORD" && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="w-full justify-start"
                      onClick={close}
                    >
                      <Link href="/landlord/listings">My Listings</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="w-full justify-start"
                      onClick={close}
                    >
                      <Link href="/landlord/notifications">Notifications</Link>
                    </Button>
                  </>
                )}
              </div>
              <Separator />
            </>
          )}

          {/* Main nav */}
          <div className="space-y-1 p-3">
            <CollapsibleNavSection
              label="Savings"
              links={savingsLinks}
              onClose={close}
            />
            <CollapsibleNavSection
              label="Listings"
              links={listingsLinks}
              onClose={close}
            />
            <CollapsibleNavSection
              label="Resources"
              links={resourcesLinks}
              onClose={close}
            />
          </div>

          <Separator />

          {/* Auth actions */}
          <div className="flex flex-col gap-2 p-4">
            {isLoggedIn ? (
              <Button
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => {
                  close()
                  handleSignout()
                }}
              >
                <IconLogout className="size-4" />
                Logout
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild onClick={close}>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild onClick={close}>
                  <Link href="/register">Join Now</Link>
                </Button>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
