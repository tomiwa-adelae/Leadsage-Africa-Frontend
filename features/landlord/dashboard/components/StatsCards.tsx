import {
  IconHome,
  IconFileText,
  IconContract,
  IconCurrencyNaira,
  IconTrendingUp,
  IconTrendingDown,
} from "@tabler/icons-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StatCard = {
  title: string
  value: string
  change: string
  trend: "up" | "down" | "neutral"
  icon: React.ElementType
  badge?: {
    label: string
    variant: "default" | "secondary" | "destructive" | "outline"
  }
}

const stats: StatCard[] = [
  {
    title: "Total Listings",
    value: "12",
    change: "+2 this month",
    trend: "up",
    icon: IconHome,
  },
  {
    title: "Pending Applications",
    value: "8",
    change: "3 need review",
    trend: "neutral",
    icon: IconFileText,
    badge: { label: "Action needed", variant: "destructive" },
  },
  {
    title: "Active Leases",
    value: "7",
    change: "1 expiring soon",
    trend: "neutral",
    icon: IconContract,
  },
  {
    title: "Monthly Revenue",
    value: "₦2,450,000",
    change: "+12.5% vs last month",
    trend: "up",
    icon: IconCurrencyNaira,
  },
]

export function StatsCards() {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
              <stat.icon className="size-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex items-center gap-1 text-xs",
                  stat.trend === "up" && "text-green-600",
                  stat.trend === "down" && "text-red-500",
                  stat.trend === "neutral" && "text-muted-foreground"
                )}
              >
                {stat.trend === "up" && <IconTrendingUp className="size-3" />}
                {stat.trend === "down" && (
                  <IconTrendingDown className="size-3" />
                )}
                {stat.change}
              </span>
              {stat.badge && (
                <Badge
                  variant={stat.badge.variant}
                  className="h-4 px-1.5 text-[10px]"
                >
                  {stat.badge.label}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
