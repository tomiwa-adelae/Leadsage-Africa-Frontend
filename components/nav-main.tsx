"use client"

import { IconChevronDown, IconCirclePlusFilled, type Icon } from "@tabler/icons-react"
import { type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import { Badge } from "./ui/badge"
import { cn } from "@/lib/utils"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

type ChildItem = {
  label: string
  slug: string
  icon?: Icon | LucideIcon
}

type NavItem = {
  label: string
  slug?: string
  icon?: Icon | LucideIcon
  comingSoon?: boolean
  children?: ChildItem[]
}

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()

  const handleLinkClick = () => setOpenMobile(false)

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            // ── Group with children (collapsible dropdown) ──
            if (item.children) {
              const isGroupActive = item.children.some(
                (c) => pathname === c.slug || pathname.startsWith(`${c.slug}/`)
              )
              const IconComponent = item.icon

              return (
                <Collapsible
                  key={item.label}
                  defaultOpen={isGroupActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.label}
                        className={cn(
                          isGroupActive &&
                            "bg-primary/10 text-primary font-medium"
                        )}
                      >
                        {IconComponent && <IconComponent className="size-4" />}
                        <span>{item.label}</span>
                        <IconChevronDown className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.children.map((child) => {
                          const isActive =
                            pathname === child.slug ||
                            pathname.startsWith(`${child.slug}/`)
                          const ChildIcon = child.icon

                          return (
                            <SidebarMenuSubItem key={child.slug}>
                              <SidebarMenuSubButton
                                asChild
                                className={cn(
                                  isActive &&
                                    "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                                )}
                              >
                                <Link href={child.slug} onClick={handleLinkClick}>
                                  {ChildIcon && <ChildIcon className="size-3.5" />}
                                  <span>{child.label}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )
            }

            // ── Flat item ──
            const isActive =
              pathname === item.slug ||
              (item.slug !== "/" && pathname.startsWith(`${item.slug}/`))
            const IconComponent = item.icon

            return (
              <SidebarMenuItem key={item.slug ?? item.label}>
                {item.comingSoon ? (
                  <SidebarMenuButton
                    tooltip={item.label}
                    className="cursor-not-allowed opacity-50"
                    disabled
                  >
                    {IconComponent && <IconComponent className="size-4" />}
                    <span>{item.label}</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      Soon
                    </Badge>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton
                    tooltip={item.label}
                    asChild
                    className={cn(
                      isActive &&
                        "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                    )}
                  >
                    <Link href={item.slug!} onClick={handleLinkClick}>
                      {IconComponent && <IconComponent className="size-4" />}
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
