"use client"

import { useCallback, useEffect, useState } from "react"
import {
  IconLoader2,
  IconSearch,
  IconRefresh,
  IconCheck,
  IconX,
  IconArrowUp,
  IconBuildingBank,
  IconAlertCircle,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { fetchData, postData } from "@/lib/api"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { formatMoneyInput } from "@/lib/utils"
import { NairaIcon } from "@/components/NairaIcon"

// ── Types ──────────────────────────────────────────────────────────────────────

interface WithdrawalRequest {
  id: string
  userId: string
  amount: number
  fee: number
  netAmount: number
  bankAccountNumber: string
  bankCode: string
  bankName: string
  accountName: string
  status: "PENDING" | "COMPLETED" | "REJECTED" | "CANCELLED"
  adminNote: string | null
  processedManually: boolean
  processedAt: string | null
  anchorTransferRef: string | null
  createdAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    image: string | null
    wallet: {
      availableBalance: number
      anchorAccountId: string | null
    } | null
  }
}

interface Stats {
  pending: number
  completed: number
  rejected: number
  cancelled: number
  totalAmountPending: number
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n)

const fmtDate = (d: string) =>
  new Date(d).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
  CANCELLED: "bg-gray-100 text-gray-600 border-gray-200",
}

// ── Component ──────────────────────────────────────────────────────────────────

export function AdminWithdrawals() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("PENDING")

  // Action state
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [markingId, setMarkingId] = useState<string | null>(null)

  // Reject dialog
  const [rejectTarget, setRejectTarget] = useState<WithdrawalRequest | null>(
    null
  )
  const [rejectReason, setRejectReason] = useState("")
  const [rejecting, setRejecting] = useState(false)

  const limit = 30

  const loadStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const data = await fetchData<Stats>("/admin/withdrawals/stats")
      setStats(data)
    } catch {
      toast.error("Could not load stats")
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const loadRequests = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", String(limit))
      if (search) params.set("search", search)
      if (status !== "ALL") params.set("status", status)

      const data = await fetchData<{
        requests: WithdrawalRequest[]
        total: number
      }>(`/admin/withdrawals?${params}`)
      setRequests(data.requests)
      setTotal(data.total)
    } catch {
      toast.error("Could not load withdrawal requests")
    } finally {
      setLoading(false)
    }
  }, [page, search, status])

  useEffect(() => {
    loadStats()
  }, [loadStats])
  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  async function handleProcessViaAnchor(id: string) {
    setProcessingId(id)
    try {
      const res = await postData<{ message: string }>(
        `/admin/withdrawals/${id}/process`,
        {}
      )
      toast.success(res.message)
      loadRequests()
      loadStats()
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? "Could not process withdrawal"
      )
    } finally {
      setProcessingId(null)
    }
  }

  async function handleMarkDone(id: string) {
    setMarkingId(id)
    try {
      const res = await postData<{ message: string }>(
        `/admin/withdrawals/${id}/mark-done`,
        {}
      )
      toast.success(res.message)
      loadRequests()
      loadStats()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Could not mark as done")
    } finally {
      setMarkingId(null)
    }
  }

  async function handleReject() {
    if (!rejectTarget || !rejectReason.trim()) {
      toast.error("Please provide a reason for rejection")
      return
    }
    setRejecting(true)
    try {
      await postData(`/admin/withdrawals/${rejectTarget.id}/reject`, {
        reason: rejectReason.trim(),
      })
      toast.success("Withdrawal rejected")
      setRejectTarget(null)
      setRejectReason("")
      loadRequests()
      loadStats()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Could not reject withdrawal")
    } finally {
      setRejecting(false)
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <PageHeader
        back
        title="Withdrawal Requests"
        description="Review and process user withdrawal requests."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Card>
          <CardHeader className="">
            <CardTitle className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              {stats?.pending ? (
                <IconAlertCircle className="size-3 text-amber-500" />
              ) : null}
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${stats?.pending ? "text-amber-600" : ""}`}
            >
              {statsLoading ? "—" : (stats?.pending ?? 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Pending Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-0.5">
              <NairaIcon />
              <p className="text-2xl font-bold">
                {statsLoading
                  ? "—"
                  : formatMoneyInput(String(stats?.totalAmountPending ?? 0))}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">
              {statsLoading ? "—" : (stats?.completed ?? 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">
              {statsLoading ? "—" : (stats?.rejected ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-lg border bg-card p-4">
        <form
          className="flex flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            setPage(1)
          }}
        >
          <div className="relative flex-1">
            <IconSearch className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setSearch("")
              setPage(1)
            }}
          >
            <IconRefresh className="size-4" />
          </Button>
        </form>

        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Bank account</TableHead>
              <TableHead>Wallet balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center">
                  <IconLoader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center">
                  <IconBuildingBank className="mx-auto mb-2 size-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No withdrawal requests
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              requests.map((req) => (
                <TableRow key={req.id} className="hover:bg-muted/30">
                  {/* User */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-7">
                        <AvatarImage src={req.user?.image ?? ""} />
                        <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                          {req.user?.firstName?.[0]}
                          {req.user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs leading-none font-medium">
                          {req.user?.firstName} {req.user?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {req.user?.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Amount */}
                  <TableCell>
                    <p className="text-sm font-semibold">{fmt(req.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      Receives {fmt(req.netAmount)} · Fee {fmt(req.fee)}
                    </p>
                  </TableCell>

                  {/* Bank */}
                  <TableCell>
                    <p className="text-xs font-medium">{req.accountName}</p>
                    <p className="text-xs text-muted-foreground">
                      {req.bankAccountNumber} · {req.bankName}
                    </p>
                  </TableCell>

                  {/* Wallet balance (live) */}
                  <TableCell>
                    <p
                      className={`text-xs font-semibold ${
                        (req.user?.wallet?.availableBalance ?? 0) >= req.amount
                          ? "text-emerald-600"
                          : "text-red-500"
                      }`}
                    >
                      {req.user?.wallet
                        ? fmt(req.user.wallet.availableBalance)
                        : "—"}
                    </p>
                    {(req.user?.wallet?.availableBalance ?? 0) < req.amount &&
                      req.status === "PENDING" && (
                        <p className="text-xs text-red-500">Insufficient</p>
                      )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs ${STATUS_COLORS[req.status]}`}
                    >
                      {req.status.charAt(0) + req.status.slice(1).toLowerCase()}
                    </Badge>
                    {req.processedManually && req.status === "COMPLETED" && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Manual
                      </p>
                    )}
                    {req.adminNote && (
                      <p
                        className="mt-0.5 max-w-32 truncate text-xs text-red-500"
                        title={req.adminNote}
                      >
                        {req.adminNote}
                      </p>
                    )}
                  </TableCell>

                  {/* Date */}
                  <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                    {fmtDate(req.createdAt)}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    {req.status === "PENDING" ? (
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          className="hidden h-7 text-xs"
                          onClick={() => handleProcessViaAnchor(req.id)}
                          disabled={!!processingId || !!markingId}
                        >
                          {processingId === req.id ? (
                            <IconLoader2 className="size-3 animate-spin" />
                          ) : (
                            <IconArrowUp className="size-3" />
                          )}
                          Send via Paystack
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => handleMarkDone(req.id)}
                          disabled={!!processingId || !!markingId}
                        >
                          {markingId === req.id ? (
                            <IconLoader2 className="size-3 animate-spin" />
                          ) : (
                            <IconCheck className="size-3" />
                          )}
                          Mark done
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-red-600 hover:text-red-700"
                          onClick={() => {
                            setRejectTarget(req)
                            setRejectReason("")
                          }}
                          disabled={!!processingId || !!markingId}
                        >
                          <IconX className="size-3" />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {req.processedAt ? fmtDate(req.processedAt) : "—"}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {total.toLocaleString()} requests · page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Reject dialog */}
      <Dialog
        open={!!rejectTarget}
        onOpenChange={(o) => !o && setRejectTarget(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reject withdrawal</DialogTitle>
            <DialogDescription>
              {rejectTarget && (
                <>
                  {fmt(rejectTarget.amount)} request from{" "}
                  {rejectTarget.user?.firstName} {rejectTarget.user?.lastName}.
                  The reason will be shown to the user.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Reason for rejection</Label>
            <Textarea
              placeholder="e.g. Insufficient Anchor balance — please try again later."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectTarget(null)}
              disabled={rejecting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejecting || !rejectReason.trim()}
            >
              {rejecting && <IconLoader2 className="size-4 animate-spin" />}
              Reject request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
