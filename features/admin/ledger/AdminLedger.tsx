"use client"

import { useCallback, useEffect, useState } from "react"
import {
  IconLoader2,
  IconSearch,
  IconBook,
  IconChevronLeft,
  IconChevronRight,
  IconArrowUp,
  IconArrowDown,
  IconRefresh,
  IconDownload,
  IconX,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { fetchData } from "@/lib/api"
import api from "@/lib/api"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NairaIcon } from "@/components/NairaIcon"
import { formatMoneyInput } from "@/lib/utils"

// ── Types ──────────────────────────────────────────────────────────────────────

interface LedgerEntry {
  id: string
  userId: string
  accountType: "WALLET" | "FIRSTKEY_SAVINGS" | "ESCROW" | "EXTERNAL"
  entryType: "CREDIT" | "DEBIT"
  amount: string
  balanceAfter: string
  eventType: string
  reference: string
  description: string
  groupRef: string | null
  paystackRef: string | null
  anchorEventId: string | null
  reconciled: boolean
  createdAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    image: string | null
  }
}

interface LedgerStats {
  totalEntries: number
  unreconciledCount: number
  summary: Record<
    string,
    { credits: number; debits: number; count: number }
  >
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmtDate = (d: string) =>
  new Date(d).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

const ACCOUNT_COLORS: Record<string, string> = {
  WALLET: "bg-blue-100 text-blue-800",
  FIRSTKEY_SAVINGS: "bg-green-100 text-green-800",
  ESCROW: "bg-orange-100 text-orange-800",
  EXTERNAL: "bg-gray-100 text-gray-700",
}

const ACCOUNT_LABELS: Record<string, string> = {
  WALLET: "Wallet",
  FIRSTKEY_SAVINGS: "FirstKey",
  ESCROW: "Escrow",
  EXTERNAL: "External",
}

const EVENT_LABELS: Record<string, string> = {
  BANK_DEPOSIT: "Bank Deposit",
  CARD_TOPUP: "Card Top-up",
  WALLET_TO_SAVINGS: "Wallet → Savings",
  SCHEDULED_CONTRIBUTION_WALLET: "Auto-save (Wallet)",
  SCHEDULED_CONTRIBUTION_CARD: "Auto-save (Card)",
  INTEREST: "Interest",
  WITHDRAWAL: "Withdrawal",
  EARLY_WITHDRAWAL: "Early Withdrawal",
  ESCROW_HOLD: "Escrow Hold",
  ESCROW_RELEASE: "Escrow Release",
  ESCROW_REFUND: "Escrow Refund",
  ANCHOR_SYNC_CORRECTION: "Anchor Sync",
  REVERSAL: "Reversal",
}

const ACCOUNT_TYPES = ["WALLET", "FIRSTKEY_SAVINGS", "ESCROW", "EXTERNAL"]
const EVENT_TYPES = Object.keys(EVENT_LABELS)

// ── Component ──────────────────────────────────────────────────────────────────

export function AdminLedger() {
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [stats, setStats] = useState<LedgerStats | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  // Filters
  const [search, setSearch] = useState("")
  const [userIdFilter, setUserIdFilter] = useState("")    // set when user clicks a row
  const [userNameFilter, setUserNameFilter] = useState("") // display name for the active filter
  const [accountType, setAccountType] = useState("ALL")
  const [eventType, setEventType] = useState("ALL")
  const [entryType, setEntryType] = useState("ALL")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const limit = 50
  const totalPages = Math.ceil(total / limit)

  const loadStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const data = await fetchData<LedgerStats>("/admin/ledger/stats")
      setStats(data)
    } catch {
      toast.error("Could not load ledger stats")
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const buildParams = useCallback(() => {
    const params = new URLSearchParams()
    params.set("page", String(page))
    params.set("limit", String(limit))
    if (userIdFilter) params.set("userId", userIdFilter)
    else if (search) params.set("search", search)
    if (accountType !== "ALL") params.set("accountType", accountType)
    if (eventType !== "ALL") params.set("eventType", eventType)
    if (entryType !== "ALL") params.set("entryType", entryType)
    if (dateFrom) params.set("dateFrom", dateFrom)
    if (dateTo) params.set("dateTo", dateTo)
    return params
  }, [page, search, userIdFilter, accountType, eventType, entryType, dateFrom, dateTo])

  const loadEntries = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchData<{ entries: LedgerEntry[]; total: number }>(
        `/admin/ledger/entries?${buildParams().toString()}`
      )
      setEntries(data.entries)
      setTotal(data.total)
    } catch {
      toast.error("Could not load ledger entries")
    } finally {
      setLoading(false)
    }
  }, [buildParams])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setUserIdFilter("")
    setUserNameFilter("")
    setPage(1) // triggers useEffect → loadEntries via buildParams dep change
  }

  function filterByUser(entry: LedgerEntry) {
    setSearch("")
    setUserIdFilter(entry.userId)
    setUserNameFilter(`${entry.user?.firstName} ${entry.user?.lastName}`.trim())
    setPage(1)
  }

  function clearUserFilter() {
    setUserIdFilter("")
    setUserNameFilter("")
    setPage(1)
  }

  function resetFilters() {
    setSearch("")
    setUserIdFilter("")
    setUserNameFilter("")
    setAccountType("ALL")
    setEventType("ALL")
    setEntryType("ALL")
    setDateFrom("")
    setDateTo("")
    setPage(1)
  }

  async function handleExport() {
    setExporting(true)
    try {
      const params = buildParams()
      params.delete("page")
      params.delete("limit")
      const response = await api.get(`/admin/ledger/export?${params.toString()}`, {
        responseType: "blob",
      })
      const url = URL.createObjectURL(new Blob([response.data], { type: "text/csv" }))
      const a = document.createElement("a")
      a.href = url
      a.download = `leadsage-ledger-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error("Export failed")
    } finally {
      setExporting(false)
    }
  }

  const walletSummary = stats?.summary?.WALLET
  const savingsSummary = stats?.summary?.FIRSTKEY_SAVINGS
  const escrowSummary = stats?.summary?.ESCROW

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Ledger"
        description="Immutable double-entry record of all money movements across the platform."
      />

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {statsLoading ? "—" : (stats?.totalEntries ?? 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">Wallet Net Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              <NairaIcon />
              <p className="text-2xl font-bold">
                {statsLoading || !walletSummary
                  ? "—"
                  : formatMoneyInput(
                      String(Math.round((walletSummary.credits - walletSummary.debits) * 100) / 100)
                    )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">FirstKey Net Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              <NairaIcon />
              <p className="text-2xl font-bold">
                {statsLoading || !savingsSummary
                  ? "—"
                  : formatMoneyInput(
                      String(Math.round((savingsSummary.credits - savingsSummary.debits) * 100) / 100)
                    )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">Escrow Held</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              <NairaIcon />
              <p className="text-2xl font-bold">
                {statsLoading || !escrowSummary
                  ? "—"
                  : formatMoneyInput(
                      String(Math.round((escrowSummary.credits - escrowSummary.debits) * 100) / 100)
                    )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <div className="flex gap-2">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by user name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={!!userIdFilter}
              />
            </div>
            <Button type="submit" variant="secondary" disabled={!!userIdFilter}>Search</Button>
          </form>
          <Button type="button" variant="ghost" onClick={resetFilters} title="Reset filters">
            <IconRefresh className="size-4" />
          </Button>
          <Button type="button" variant="outline" onClick={handleExport} disabled={exporting}>
            {exporting
              ? <IconLoader2 className="size-4 animate-spin" />
              : <IconDownload className="size-4" />}
            Export CSV
          </Button>
        </div>

        {userIdFilter && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Filtered by user:</span>
            <Badge variant="secondary" className="gap-1">
              {userNameFilter}
              <button onClick={clearUserFilter} className="ml-1 hover:opacity-70">
                <IconX className="size-3" />
              </button>
            </Badge>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Select value={accountType} onValueChange={(v) => { setAccountType(v); setPage(1) }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Account type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All accounts</SelectItem>
              {ACCOUNT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{ACCOUNT_LABELS[t] ?? t}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={entryType} onValueChange={(v) => { setEntryType(v); setPage(1) }}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Credit / Debit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All entries</SelectItem>
              <SelectItem value="CREDIT">Credits only</SelectItem>
              <SelectItem value="DEBIT">Debits only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={eventType} onValueChange={(v) => { setEventType(v); setPage(1) }}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All events</SelectItem>
              {EVENT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{EVENT_LABELS[t] ?? t}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1">
            <Input
              type="date"
              className="w-36"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
              placeholder="From"
            />
            <span className="text-muted-foreground text-sm">–</span>
            <Input
              type="date"
              className="w-36"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
              placeholder="To"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Date</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Balance After</TableHead>
              <TableHead>Ref</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="py-16 text-center">
                  <IconLoader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-16 text-center">
                  <IconBook className="mx-auto mb-2 size-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No ledger entries found</p>
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id} className="hover:bg-muted/30">
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {fmtDate(entry.createdAt)}
                  </TableCell>

                  <TableCell>
                    <button
                      onClick={() => filterByUser(entry)}
                      className="flex items-center gap-2 text-left hover:underline focus:outline-none"
                      title="Filter by this user"
                    >
                      <Avatar className="size-7">
                        <AvatarImage src={entry.user?.image ?? ""} />
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                          {entry.user?.firstName?.[0]}{entry.user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-medium leading-none">
                          {entry.user?.firstName} {entry.user?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{entry.user?.email}</p>
                      </div>
                    </button>
                  </TableCell>

                  <TableCell>
                    <Badge className={`text-xs ${ACCOUNT_COLORS[entry.accountType] ?? ""}`} variant="outline">
                      {ACCOUNT_LABELS[entry.accountType] ?? entry.accountType}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {entry.entryType === "CREDIT" ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <IconArrowDown className="size-3" />
                        <span className="text-xs font-semibold">Credit</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-500">
                        <IconArrowUp className="size-3" />
                        <span className="text-xs font-semibold">Debit</span>
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {EVENT_LABELS[entry.eventType] ?? entry.eventType}
                    </span>
                  </TableCell>

                  <TableCell className="max-w-48 truncate text-xs">
                    {entry.description}
                  </TableCell>

                  <TableCell className="text-right font-mono text-sm">
                    <span className={entry.entryType === "CREDIT" ? "text-green-600" : "text-red-500"}>
                      {entry.entryType === "CREDIT" ? "+" : "−"}₦{formatMoneyInput(String(Math.round(Number(entry.amount) * 100) / 100))}
                    </span>
                  </TableCell>

                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    {entry.accountType === "EXTERNAL"
                      ? <span className="text-muted-foreground/50">—</span>
                      : `₦${formatMoneyInput(String(Math.round(Number(entry.balanceAfter) * 100) / 100))}`}
                  </TableCell>

                  <TableCell>
                    <span className="text-xs font-mono text-muted-foreground truncate max-w-24 block" title={entry.reference}>
                      {entry.reference.slice(0, 16)}…
                    </span>
                    {entry.paystackRef && (
                      <span className="block text-xs text-muted-foreground/60">PS</span>
                    )}
                    {entry.anchorEventId && (
                      <span className="block text-xs text-muted-foreground/60">ANC</span>
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
            {total.toLocaleString()} entries · page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <IconChevronLeft className="size-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <IconChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
