import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { IconArrowRight } from "@tabler/icons-react"

type ApplicationStatus = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED"

type Application = {
  id: string
  applicant: { name: string; image?: string }
  listing: string
  date: string
  status: ApplicationStatus
}

const recentApplications: Application[] = [
  {
    id: "1",
    applicant: { name: "Emeka Okafor" },
    listing: "3-Bed Apartment, Lekki Phase 1",
    date: "Today",
    status: "PENDING",
  },
  {
    id: "2",
    applicant: { name: "Aisha Bello" },
    listing: "2-Bed Flat, Ikeja GRA",
    date: "Yesterday",
    status: "UNDER_REVIEW",
  },
  {
    id: "3",
    applicant: { name: "Tunde Adeyemi" },
    listing: "Studio, Victoria Island",
    date: "2 days ago",
    status: "APPROVED",
  },
  {
    id: "4",
    applicant: { name: "Ngozi Eze" },
    listing: "4-Bed Duplex, Ajah",
    date: "3 days ago",
    status: "PENDING",
  },
  {
    id: "5",
    applicant: { name: "Chidi Nwosu" },
    listing: "1-Bed Flat, Surulere",
    date: "4 days ago",
    status: "REJECTED",
  },
]

const statusConfig: Record<
  ApplicationStatus,
  {
    label: string
    variant: "default" | "secondary" | "destructive" | "outline"
  }
> = {
  PENDING: { label: "Pending", variant: "secondary" },
  UNDER_REVIEW: { label: "Under Review", variant: "default" },
  APPROVED: { label: "Approved", variant: "outline" },
  REJECTED: { label: "Rejected", variant: "destructive" },
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function RecentApplications() {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Recent Applications</CardTitle>
        <CardDescription>
          Latest rental applications across your listings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentApplications.map((app) => {
            const { label, variant } = statusConfig[app.status]
            return (
              <div
                key={app.id}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="size-9 flex-shrink-0">
                    <AvatarImage src={app.applicant.image} />
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {getInitials(app.applicant.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {app.applicant.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {app.listing}
                    </p>
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-3">
                  <span className="hidden text-xs text-muted-foreground sm:block">
                    {app.date}
                  </span>
                  <Badge variant={variant} className="text-xs">
                    {label}
                  </Badge>
                </div>
              </div>
            )
          })}
          <Button variant="secondary" size="sm" className="w-full" asChild>
            <Link href="/landlord/listings/applications">
              View all <IconArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
