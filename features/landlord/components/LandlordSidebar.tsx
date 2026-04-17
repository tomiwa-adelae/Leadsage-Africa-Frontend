"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconLayoutDashboard,
  IconHome,
  IconList,
  IconBuildingSkyscraper,
  IconFileText,
  IconContract,
  IconCalendarEvent,
  IconCurrencyNaira,
  IconMessage,
  IconBell,
  IconSettings,
  IconChevronRight,
  IconLogout,
  IconUser,
  IconHomeDot,
  IconWallet,
} from "@tabler/icons-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Logo } from "@/components/Logo"
import { cn } from "@/lib/utils"

const listingSubLinks = [
  { label: "All Listings", href: "/landlord/listings" },
  { label: "Shortlets", href: "/landlord/listings/shortlets" },
  { label: "Applications", href: "/landlord/listings/applications" },
  { label: "Leases", href: "/landlord/listings/leases" },
  { label: "Bookings", href: "/landlord/listings/bookings" },
]

const rentalLinks = [
  { label: "Property Tours", href: "/landlord/tours", icon: IconHomeDot },
  { label: "Agreements", href: "/landlord/agreements", icon: IconFileText },
]

const mainLinks = [
  {
    label: "Dashboard",
    href: "/landlord/dashboard",
    icon: IconLayoutDashboard,
  },
]

const bottomLinks = [
  { label: "Wallet", href: "/landlord/wallet", icon: IconWallet },
  { label: "Earnings", href: "/landlord/earnings", icon: IconCurrencyNaira },
  {
    label: "Messages",
    href: "/landlord/messages",
    icon: IconMessage,
    comingSoon: true,
  },
  { label: "Notifications", href: "/landlord/notifications", icon: IconBell },
  { label: "Settings", href: "/landlord/settings", icon: IconSettings },
]

export function LandlordSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  const isListingsOpen = pathname.startsWith("/landlord/listings")

  return (
    <Sidebar collapsible="icon">
      {/* Header */}
      <SidebarHeader className="border-b py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="hover:bg-transparent active:bg-transparent"
            >
              <Link href="/landlord/dashboard">
                <Logo color="green" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainLinks.map(({ label, href, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(href)}
                    tooltip={label}
                  >
                    <Link href={href}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Properties */}
        <SidebarGroup>
          <SidebarGroupLabel>Properties</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible
                defaultOpen={isListingsOpen}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip="Listings"
                      isActive={isListingsOpen}
                    >
                      <IconHome />
                      <span>Listings</span>
                      <IconChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {listingSubLinks.map(({ label, href }) => (
                        <SidebarMenuSubItem key={href}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === href}
                          >
                            <Link href={href}>{label}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Long-term Rentals */}
        <SidebarGroup>
          <SidebarGroupLabel>Long-term Rentals</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {rentalLinks.map(({ label, href, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(href)}
                    tooltip={label}
                  >
                    <Link href={href}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Finance & Communication */}
        <SidebarGroup>
          <SidebarGroupLabel>Finance & Communication</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomLinks.map(({ label, href, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(href)}
                    tooltip={label}
                  >
                    <Link href={href}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer — user info */}
      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent"
                >
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage src="" alt="Landlord" />
                    <AvatarFallback className="rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
                      LD
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Landlord Name</span>
                    <span className="truncate text-xs text-muted-foreground">
                      landlord@email.com
                    </span>
                  </div>
                  <IconChevronRight className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-56 rounded-lg"
              >
                <DropdownMenuItem asChild>
                  <Link href="/landlord/settings">
                    <IconUser className="size-4" />
                    Profile & Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <IconLogout className="size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
