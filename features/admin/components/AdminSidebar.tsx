"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  IconLayoutDashboard,
  IconClipboardCheck,
  IconHome,
  IconUsers,
  IconShield,
  IconChevronRight,
  IconLogout,
  IconBadge,
  IconCalendarEvent,
  IconHomeDot,
  IconFileText,
  IconUserCheck,
} from "@tabler/icons-react"
import { toast } from "sonner"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Logo } from "@/components/Logo"
import { useAuth } from "@/store/useAuth"
import api from "@/lib/api"

const mainLinks = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: IconLayoutDashboard,
  },
  {
    label: "Moderation Queue",
    href: "/admin/moderation",
    icon: IconClipboardCheck,
  },
  {
    label: "All Listings",
    href: "/admin/listings",
    icon: IconHome,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: IconUsers,
  },
  {
    label: "Bookings",
    href: "/admin/bookings",
    icon: IconCalendarEvent,
  },
]

const rentalLinks = [
  { label: "Property Tours", href: "/admin/tours", icon: IconHomeDot },
  { label: "Screening Applications", href: "/admin/screening-applications", icon: IconUserCheck },
  { label: "Agreements", href: "/admin/agreements", icon: IconFileText },
]

const adminLinks = [
  {
    label: "Admin Team",
    href: "/admin/team",
    icon: IconShield,
    superAdminOnly: true,
  },
]

export function AdminSidebar({ pendingCount = 0 }: { pendingCount?: number }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, clearUser } = useAuth()

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  const initials =
    user
      ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
      : "AD"

  async function handleSignOut() {
    try {
      await api.post("/auth/logout")
    } catch {
      // ignore
    }
    clearUser()
    router.push("/admin/login")
    toast.success("Signed out")
  }

  const isSuperAdmin = user?.adminPosition === "SUPER_ADMIN"

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
              <Link href="/admin/dashboard">
                <Logo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main nav */}
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
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
                  {href === "/admin/moderation" && pendingCount > 0 && (
                    <SidebarMenuBadge className="bg-yellow-500 text-white">
                      {pendingCount}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
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

        {isSuperAdmin && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Administration</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminLinks.map(({ label, href, icon: Icon }) => (
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
          </>
        )}
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
                    <AvatarImage src={user?.image ?? ""} alt={user?.firstName ?? ""} />
                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.adminPosition?.replace("_", " ")}
                    </span>
                  </div>
                  <IconChevronRight className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56 rounded-lg">
                <div className="px-3 py-2">
                  <p className="text-xs font-medium">{user?.email}</p>
                  <div className="mt-1 flex items-center gap-1">
                    <IconBadge className="size-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      {user?.adminPosition?.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={handleSignOut}
                >
                  <IconLogout className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
