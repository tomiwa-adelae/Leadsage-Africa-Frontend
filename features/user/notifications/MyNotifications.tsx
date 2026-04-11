"use client"

import { useCallback, useEffect, useState } from "react"
import {
  IconLoader2,
  IconBell,
  IconBellOff,
  IconCircleCheck,
  IconCalendar,
  IconBuildingSkyscraper,
  IconX,
  IconInfoCircle,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import { fetchData, updateData } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"

// ── Types ──────────────────────────────────────────────────────────────────────

interface Notification {
  id: string
  type: string
  title: string
  body: string
  isRead: boolean
  data: Record<string, string> | null
  createdAt: string
}

// ── Constants ──────────────────────────────────────────────────────────────────

const TYPE_META: Record<string, { icon: React.ElementType; accent: string }> = {
  APPLICATION_STATUS: {
    icon: IconCircleCheck,
    accent: "text-blue-500 bg-blue-50",
  },
  BOOKING_STATUS: {
    icon: IconCalendar,
    accent: "text-purple-500 bg-purple-50",
  },
  LISTING_APPROVED: {
    icon: IconBuildingSkyscraper,
    accent: "text-green-500 bg-green-50",
  },
  LISTING_REJECTED: { icon: IconX, accent: "text-red-500 bg-red-50" },
  GENERAL: { icon: IconInfoCircle, accent: "text-slate-500 bg-slate-100" },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

// ── Component ──────────────────────────────────────────────────────────────────

export function MyNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetchData<Notification[]>("/user/notifications")
      .then(setNotifications)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  async function handleMarkOne(id: string) {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
    try {
      await updateData(`/user/notifications/${id}/read`, {})
    } catch {
      // Revert on failure
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
      )
    }
  }

  async function handleMarkAll() {
    if (!unreadCount) return
    setMarkingAll(true)
    try {
      await updateData("/user/notifications/read-all", {})
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      toast.success("All notifications marked as read")
    } catch {
      toast.error("Failed to mark notifications as read")
    } finally {
      setMarkingAll(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          back
          title="Notifications"
          description={
            loading
              ? "Loading…"
              : unreadCount > 0
                ? `${unreadCount} unread`
                : "All caught up"
          }
        />
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAll}
            disabled={markingAll}
          >
            {markingAll ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : (
              <IconBell className="size-4" />
            )}
            Mark all as read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
          <IconLoader2 className="size-5 animate-spin" />
          Loading notifications…
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border bg-card text-center">
          <IconBellOff className="size-10 text-muted-foreground/40" />
          <div>
            <p className="font-medium">No notifications yet</p>
            <p className="text-sm text-muted-foreground">
              We'll let you know when something important happens.
            </p>
          </div>
        </div>
      ) : (
        <div className="divide-y overflow-hidden rounded-xl border bg-card">
          {notifications.map((n) => {
            const meta = TYPE_META[n.type] ?? TYPE_META.GENERAL
            const Icon = meta.icon

            return (
              <button
                key={n.id}
                onClick={() => !n.isRead && handleMarkOne(n.id)}
                className={cn(
                  "flex w-full items-start gap-4 px-4 py-4 text-left transition-colors",
                  !n.isRead
                    ? "cursor-pointer bg-primary/5 hover:bg-primary/10"
                    : "hover:bg-muted/40"
                )}
              >
                {/* Icon */}
                <div
                  className={`mt-0.5 flex-shrink-0 rounded-full p-2 ${meta.accent}`}
                >
                  <Icon className="size-4" />
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-sm", !n.isRead && "font-semibold")}>
                      {n.title}
                    </p>
                    <span className="flex-shrink-0 text-xs text-muted-foreground">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                    {n.body}
                  </p>
                </div>

                {/* Unread dot */}
                {!n.isRead && (
                  <div className="mt-2 size-2 flex-shrink-0 rounded-full bg-primary" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
