"use client"

import { useCallback, useEffect, useState } from "react"
import {
  IconLoader2,
  IconSearch,
  IconUsers,
  IconShieldOff,
  IconBan,
  IconCircleCheck,
  IconAlertTriangle,
  IconDots,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { fetchData, updateData } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// ── Types ──────────────────────────────────────────────────────────────────────

type AccountStatus = "ACTIVE" | "SUSPENDED" | "BANNED"

interface AdminUser {
  id: string
  firstName: string
  lastName: string
  email: string
  username: string
  image: string | null
  role: string
  accountStatus: AccountStatus
  accountStatusReason: string | null
  accountStatusUpdatedAt: string | null
  emailVerified: boolean
  onboardingCompleted: boolean
  createdAt: string
  _count: { listings: number }
}

interface UsersResponse {
  users: AdminUser[]
  total: number
  page: number
  pages: number
}

interface StatusAction {
  user: AdminUser
  newStatus: AccountStatus
}

// ── Constants ──────────────────────────────────────────────────────────────────

const ROLE_OPTIONS = [
  { value: "ALL", label: "All roles" },
  { value: "LANDLORD", label: "Landlords" },
  { value: "CLIENT", label: "Renters" },
]

const STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "BANNED", label: "Banned" },
]

const SUSPEND_REASONS = [
  "Suspicious account activity",
  "Multiple policy violations",
  "Fraudulent listing reported",
  "Payment dispute under investigation",
  "Identity verification failed",
  "Other (see details below)",
]

const BAN_REASONS = [
  "Repeated policy violations after warnings",
  "Confirmed fraudulent activity",
  "Harassment or abuse of other users",
  "Impersonation of another person or organisation",
  "Illegal content or listings",
  "Other (see details below)",
]

const STATUS_BADGE: Record<AccountStatus, { label: string; className: string }> = {
  ACTIVE:    { label: "Active",    className: "bg-green-100 text-green-700 border-green-200" },
  SUSPENDED: { label: "Suspended", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  BANNED:    { label: "Banned",    className: "bg-red-100 text-red-700 border-red-200" },
}

// ── Component ──────────────────────────────────────────────────────────────────

export function AdminUsers() {
  const [data, setData] = useState<UsersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [page, setPage] = useState(1)

  // Status action dialog
  const [action, setAction] = useState<StatusAction | null>(null)
  const [presetReason, setPresetReason] = useState("")
  const [customReason, setCustomReason] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("page", String(page))
    params.set("limit", "15")
    if (search) params.set("search", search)
    if (roleFilter !== "ALL") params.set("role", roleFilter)
    if (statusFilter !== "ALL") params.set("accountStatus", statusFilter)

    fetchData<UsersResponse>(`/admin/users?${params}`)
      .then(setData)
      .catch(() => setError("Failed to load users."))
      .finally(() => setLoading(false))
  }, [search, roleFilter, statusFilter, page])

  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
  }, [load])

  function openAction(user: AdminUser, newStatus: AccountStatus) {
    setAction({ user, newStatus })
    setPresetReason("")
    setCustomReason("")
  }

  async function handleStatusUpdate() {
    if (!action) return
    const reasons =
      action.newStatus === "BANNED" ? BAN_REASONS : SUSPEND_REASONS
    const finalReason =
      action.newStatus === "ACTIVE"
        ? undefined
        : presetReason === reasons[reasons.length - 1] || !presetReason
        ? customReason.trim()
        : presetReason + (customReason.trim() ? `\n\n${customReason.trim()}` : "")

    if (action.newStatus !== "ACTIVE" && !finalReason) {
      toast.error("Please provide a reason.")
      return
    }

    setSubmitting(true)
    try {
      await updateData(`/admin/users/${action.user.id}/status`, {
        status: action.newStatus,
        reason: finalReason,
      })
      const labels: Record<AccountStatus, string> = {
        ACTIVE: "reactivated",
        SUSPENDED: "suspended",
        BANNED: "banned",
      }
      toast.success(`User account ${labels[action.newStatus]}.`)
      setAction(null)
      load()
    } catch {
      toast.error("Failed to update user status.")
    } finally {
      setSubmitting(false)
    }
  }

  const reasonOptions =
    action?.newStatus === "BANNED" ? BAN_REASONS : SUSPEND_REASONS
  const needsReason = action?.newStatus !== "ACTIVE"

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description={data ? `${data.total.toLocaleString()} total users` : ""}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search name, email, username…"
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1) }}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Listings</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center">
                  <IconLoader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-destructive text-sm">
                  {error}
                </TableCell>
              </TableRow>
            ) : !data?.users.length ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-muted-foreground text-sm">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              data.users.map((u) => {
                const badge = STATUS_BADGE[u.accountStatus]
                const initials = `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase()
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarImage src={u.image ?? ""} />
                          <AvatarFallback className="text-xs bg-muted">{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {u.firstName} {u.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {u.role === "LANDLORD" ? "Landlord" : "Renter"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline" className={`text-xs ${badge.className}`}>
                          {badge.label}
                        </Badge>
                        {u.accountStatusReason && (
                          <p className="max-w-40 truncate text-xs text-muted-foreground">
                            {u.accountStatusReason}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {u._count.listings}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <IconDots className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {u.accountStatus !== "ACTIVE" && (
                            <DropdownMenuItem
                              className="text-green-600 focus:text-green-600"
                              onClick={() => openAction(u, "ACTIVE")}
                            >
                              <IconCircleCheck className="size-4" />
                              Reactivate account
                            </DropdownMenuItem>
                          )}
                          {u.accountStatus !== "SUSPENDED" && (
                            <DropdownMenuItem
                              className="text-yellow-600 focus:text-yellow-600"
                              onClick={() => openAction(u, "SUSPENDED")}
                            >
                              <IconAlertTriangle className="size-4" />
                              Suspend account
                            </DropdownMenuItem>
                          )}
                          {u.accountStatus !== "BANNED" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => openAction(u, "BANNED")}
                              >
                                <IconBan className="size-4" />
                                Ban account
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Page {data.page} of {data.pages} ({data.total} total)</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= data.pages}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Status action dialog */}
      <Dialog open={!!action} onOpenChange={() => setAction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {action?.newStatus === "ACTIVE" && "Reactivate account"}
              {action?.newStatus === "SUSPENDED" && "Suspend account"}
              {action?.newStatus === "BANNED" && "Ban account"}
            </DialogTitle>
            <DialogDescription>
              {action?.newStatus === "ACTIVE" &&
                "This will restore the user's access to Leadsage Africa."}
              {action?.newStatus === "SUSPENDED" &&
                "The user will be blocked from logging in until the suspension is lifted."}
              {action?.newStatus === "BANNED" &&
                "This is a permanent action. The user will be permanently blocked from the platform."}
            </DialogDescription>
          </DialogHeader>

          {action && (
            <div className="space-y-4">
              {/* User preview */}
              <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2">
                <Avatar className="size-8">
                  <AvatarImage src={action.user.image ?? ""} />
                  <AvatarFallback className="text-xs">
                    {`${action.user.firstName?.[0] ?? ""}${action.user.lastName?.[0] ?? ""}`.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {action.user.firstName} {action.user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{action.user.email}</p>
                </div>
              </div>

              {needsReason && (
                <>
                  <div className="space-y-1.5">
                    <Label>Reason</Label>
                    <Select value={presetReason} onValueChange={setPresetReason}>
                      <SelectTrigger><SelectValue placeholder="Select a reason…" /></SelectTrigger>
                      <SelectContent>
                        {reasonOptions.map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>
                      Additional details{" "}
                      <span className="text-muted-foreground font-normal">(optional)</span>
                    </Label>
                    <Textarea
                      placeholder="Any additional context for this action…"
                      rows={3}
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant={action?.newStatus === "ACTIVE" ? "default" : action?.newStatus === "BANNED" ? "destructive" : "outline"}
              className={action?.newStatus === "SUSPENDED" ? "border-yellow-300 bg-yellow-50 text-yellow-800 hover:bg-yellow-100" : ""}
              onClick={handleStatusUpdate}
              disabled={submitting || (needsReason && !presetReason && !customReason.trim())}
            >
              {submitting ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : action?.newStatus === "ACTIVE" ? (
                <IconCircleCheck className="size-4" />
              ) : action?.newStatus === "BANNED" ? (
                <IconBan className="size-4" />
              ) : (
                <IconShieldOff className="size-4" />
              )}
              Confirm{" "}
              {action?.newStatus === "ACTIVE"
                ? "reactivation"
                : action?.newStatus === "BANNED"
                ? "ban"
                : "suspension"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
