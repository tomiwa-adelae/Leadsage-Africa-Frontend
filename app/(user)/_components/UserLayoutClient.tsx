"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Loader } from "@/components/Loader"
import { useAuth } from "@/store/useAuth"
import { AppSidebar } from "@/components/app-sidebar"

export default function UserLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, _hasHydrated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!_hasHydrated) return
    if (!user) {
      router.replace("/login")
      return
    }
    if (user.role === "ADMIN") {
      router.replace("/admin/dashboard")
      return
    }
    if (user.role === "LANDLORD") {
      router.replace("/landlord/dashboard")
      return
    }
  }, [user, _hasHydrated, router])

  const isReady = _hasHydrated && !!user && user.role === "CLIENT"

  if (!isReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader text="Loading..." />
      </div>
    )
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "18rem",
          "--header-height": "4rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main container flex flex-1 flex-col gap-4 py-8">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
