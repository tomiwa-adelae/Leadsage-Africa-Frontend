import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { LandlordSidebar } from "@/features/landlord/components/LandlordSidebar"
import { Separator } from "@/components/ui/separator"

export default function LandlordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <LandlordSidebar />
      <SidebarInset>
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
        </header>
        <div className="@container/main container flex flex-1 flex-col gap-4 py-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
