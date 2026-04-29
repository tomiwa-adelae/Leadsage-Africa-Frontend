"use client"

import { useEffect, useState } from "react"
import {
  IconLoader2,
  IconShield,
  IconPlus,
  IconTrash,
  IconPencil,
  IconCrown,
  IconDots,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { fetchData, postData, updateData, deleteData } from "@/lib/api"
import { useAuth } from "@/store/useAuth"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// ── Types ──────────────────────────────────────────────────────────────────────

interface AdminMember {
  id: string
  position: "SUPER_ADMIN" | "ADMIN" | "MODERATOR"
  createdAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    image: string | null
    createdAt: string
    accountStatus: string
  }
}

// ── Schema ─────────────────────────────────────────────────────────────────────

const createSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Minimum 8 characters"),
  position: z.enum(["ADMIN", "MODERATOR"]),
})

type CreateValues = z.infer<typeof createSchema>

// ── Constants ──────────────────────────────────────────────────────────────────

const POSITION_BADGE: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  SUPER_ADMIN: {
    label: "Super Admin",
    className: "bg-purple-100 text-purple-700 border-purple-200",
    icon: IconCrown,
  },
  ADMIN: {
    label: "Admin",
    className: "bg-blue-100 text-blue-700 border-blue-200",
    icon: IconShield,
  },
  MODERATOR: {
    label: "Moderator",
    className: "bg-slate-100 text-slate-600 border-slate-200",
    icon: IconEye,
  },
}

// ── Component ──────────────────────────────────────────────────────────────────

export function AdminTeam() {
  const { user: currentUser } = useAuth()
  const isSuperAdmin = currentUser?.adminPosition === "SUPER_ADMIN"

  const [members, setMembers] = useState<AdminMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showCreate, setShowCreate] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [creating, setCreating] = useState(false)

  const [editTarget, setEditTarget] = useState<AdminMember | null>(null)
  const [editPosition, setEditPosition] = useState<"ADMIN" | "MODERATOR">(
    "ADMIN"
  )
  const [editing, setEditing] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<AdminMember | null>(null)
  const [deleting, setDeleting] = useState(false)

  const form = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      position: "ADMIN",
    },
  })

  function load() {
    setLoading(true)
    fetchData<AdminMember[]>("/admin/team")
      .then(setMembers)
      .catch(() => setError("Failed to load admin team."))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCreate(values: CreateValues) {
    setCreating(true)
    try {
      await postData("/admin/team", values)
      toast.success(`Admin account created for ${values.firstName}.`)
      form.reset()
      setShowCreate(false)
      load()
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? "Failed to create admin account."
      )
    } finally {
      setCreating(false)
    }
  }

  async function handleEdit() {
    if (!editTarget) return
    setEditing(true)
    try {
      await updateData(`/admin/team/${editTarget.id}`, {
        position: editPosition,
      })
      toast.success("Admin role updated.")
      setEditTarget(null)
      load()
    } catch {
      toast.error("Failed to update role.")
    } finally {
      setEditing(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteData(`/admin/team/${deleteTarget.id}`)
      toast.success("Admin removed.")
      setDeleteTarget(null)
      load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to remove admin.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        <PageHeader
          back
          title="Admin Team"
          description="Manage who has access to the admin portal"
        />

        {isSuperAdmin && (
          <Button
            className="w-full md:w-auto"
            onClick={() => setShowCreate(true)}
          >
            <IconPlus className="size-4" />
            Add admin
          </Button>
        )}
      </div>
      {loading ? (
        <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
          <IconLoader2 className="size-5 animate-spin" />
          Loading team…
        </div>
      ) : error ? (
        <div className="flex h-64 items-center justify-center text-sm text-destructive">
          {error}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => {
            const pos = POSITION_BADGE[m.position] ?? POSITION_BADGE.MODERATOR
            const PosIcon = pos.icon
            const initials =
              `${m.user.firstName?.[0] ?? ""}${m.user.lastName?.[0] ?? ""}`.toUpperCase()
            const isMe = m.user.id === currentUser?.id
            const isSelf = isMe
            const isSuperAdminMember = m.position === "SUPER_ADMIN"

            return (
              <div
                key={m.id}
                className="rounded-xl border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarImage src={m.user.image ?? ""} />
                      <AvatarFallback className="bg-muted text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">
                        {m.user.firstName} {m.user.lastName}
                        {isMe && (
                          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                            (you)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {m.user.email}
                      </p>
                    </div>
                  </div>

                  {isSuperAdmin && !isSelf && !isSuperAdminMember && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="-mr-1">
                          <IconDots className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-40">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditTarget(m)
                            setEditPosition(
                              m.position === "ADMIN" ? "MODERATOR" : "ADMIN"
                            )
                          }}
                        >
                          <IconPencil className="size-4" />
                          Change role
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => setDeleteTarget(m)}
                        >
                          <IconTrash className="size-4" />
                          Remove admin
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className={`gap-1 text-xs ${pos.className}`}
                  >
                    <PosIcon className="size-3" />
                    {pos.label}
                  </Badge>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  Added{" "}
                  {new Date(m.createdAt).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* Create admin dialog */}
      <Dialog
        open={showCreate}
        onOpenChange={(o) => {
          setShowCreate(o)
          if (!o) form.reset()
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add admin account</DialogTitle>
            <DialogDescription>
              Create a new admin user. They can log in immediately at
              /admin/login.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleCreate)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input placeholder="Tomi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input placeholder="Williams" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@leadsageafrica.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Min. 8 characters"
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <IconEyeOff className="size-4" />
                          ) : (
                            <IconEye className="size-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ADMIN">
                          Admin — full access
                        </SelectItem>
                        <SelectItem value="MODERATOR">
                          Moderator — limited access
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreate(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? (
                    <IconLoader2 className="size-4 animate-spin" />
                  ) : (
                    <IconPlus className="size-4" />
                  )}
                  Create admin
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit role dialog */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change role</DialogTitle>
            <DialogDescription>
              Update the role for {editTarget?.user.firstName}{" "}
              {editTarget?.user.lastName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
              <p className="font-medium">
                {editTarget?.user.firstName} {editTarget?.user.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                Currently:{" "}
                {editTarget ? POSITION_BADGE[editTarget.position]?.label : ""}
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">New role</label>
              <Select
                value={editPosition}
                onValueChange={(v) => setEditPosition(v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin — full access</SelectItem>
                  <SelectItem value="MODERATOR">
                    Moderator — limited access
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditTarget(null)}
              disabled={editing}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={editing}>
              {editing ? <IconLoader2 className="size-4 animate-spin" /> : null}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove admin access?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove admin access for{" "}
              <strong>
                {deleteTarget?.user.firstName} {deleteTarget?.user.lastName}
              </strong>
              . Their account will be converted to a regular user. This can be
              reversed by adding them again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : null}
              Remove admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
