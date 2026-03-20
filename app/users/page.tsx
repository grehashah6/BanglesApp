"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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

type User = {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: string
}

export default function UsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createEmail, setCreateEmail] = useState("")
  const [createPassword, setCreatePassword] = useState("")
  const [createName, setCreateName] = useState("")
  const [createRole, setCreateRole] = useState<"ADMIN" | "USER">("USER")
  const [creating, setCreating] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editRole, setEditRole] = useState<"ADMIN" | "USER">("USER")
  const [resetId, setResetId] = useState<string | null>(null)
  const [resetPassword, setResetPassword] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const PRIMARY_ADMIN_EMAIL = "admin@example.com"

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login")
      return
    }
    if (session?.user?.role !== "ADMIN") {
      router.replace("/dashboard")
      return
    }
    loadUsers()
  }, [status, session, router])

  async function loadUsers() {
    setLoading(true)
    try {
      const res = await fetch("/api/users")
      if (!res.ok) throw new Error("Failed to load users")
      const data = await res.json()
      setUsers(data)
    } catch (e: any) {
      setError(e.message ?? "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setCreating(true)
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: createEmail,
          password: createPassword,
          name: createName || undefined,
          role: createRole,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error ?? "Failed to create user")
      setCreateOpen(false)
      setCreateEmail("")
      setCreatePassword("")
      setCreateName("")
      setCreateRole("USER")
      await loadUsers()
    } catch (e: any) {
      setError(e.message ?? "Failed to create user")
    } finally {
      setCreating(false)
    }
  }

  async function handleUpdateRole() {
    if (!editId) return
    setError(null)
    try {
      const res = await fetch(`/api/users/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: editRole }),
      })
      if (!res.ok) throw new Error("Failed to update role")
      setEditId(null)
      await loadUsers()
    } catch (e: any) {
      setError(e.message ?? "Failed to update")
    }
  }

  async function handleResetPassword() {
    if (!resetId || !resetPassword.trim()) return
    setError(null)
    try {
      const res = await fetch(`/api/users/${resetId}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: resetPassword }),
      })
      if (!res.ok) throw new Error("Failed to reset password")
      setResetId(null)
      setResetPassword("")
    } catch (e: any) {
      setError(e.message ?? "Failed to reset password")
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setError(null)
    try {
      const res = await fetch(`/api/users/${deleteId}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error ?? "Failed to delete")
      }
      setDeleteId(null)
      await loadUsers()
    } catch (e: any) {
      setError(e.message ?? "Failed to delete")
    }
  }

  if (status === "loading" || session?.user?.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            User management
          </h1>
          <p className="text-sm text-muted-foreground">
            Create, edit, and manage user accounts and roles.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>Add user</Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>All users with access to the app.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-md bg-muted animate-pulse" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users yet. Add one above.</p>
          ) : (
            <>
            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {users.map((u) => (
                <Card key={u.id}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{u.email}</div>
                        <div className="text-xs text-muted-foreground">
                          {u.name ?? "—"} · {new Date(u.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>
                        {u.role}
                      </Badge>
                    </div>
                    <div className="grid gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditId(u.id)
                          setEditRole(u.role as "ADMIN" | "USER")
                        }}
                        disabled={u.email.toLowerCase() === PRIMARY_ADMIN_EMAIL}
                      >
                        Edit role
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setResetId(u.id)}
                      >
                        Reset password
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteId(u.id)}
                        disabled={
                          u.id === session?.user?.id ||
                          u.email.toLowerCase() === PRIMARY_ADMIN_EMAIL
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3 pr-4">Email</th>
                    <th className="text-left py-3 pr-4">Name</th>
                    <th className="text-left py-3 pr-4">Role</th>
                    <th className="text-left py-3 pr-4">Created</th>
                    <th className="text-right py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{u.email}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{u.name ?? "—"}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditId(u.id)
                              setEditRole(u.role as "ADMIN" | "USER")
                            }}
                            disabled={u.email.toLowerCase() === PRIMARY_ADMIN_EMAIL}
                          >
                            Edit role
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setResetId(u.id)}
                          >
                            Reset password
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteId(u.id)}
                            disabled={u.id === session?.user?.id || u.email.toLowerCase() === PRIMARY_ADMIN_EMAIL}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add user</DialogTitle>
            <DialogDescription>
              Create a new user account. They can sign in with email and password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="create-password">Password</Label>
              <Input
                id="create-password"
                type="password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div>
              <Label htmlFor="create-name">Name (optional)</Label>
              <Input
                id="create-name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={createRole} onValueChange={(v: "ADMIN" | "USER") => setCreateRole(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">USER</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? "Creating…" : "Create user"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editId} onOpenChange={() => setEditId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit role</DialogTitle>
            <DialogDescription>Change the user&apos;s role (ADMIN or USER).</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Role</Label>
              <Select value={editRole} onValueChange={(v: "ADMIN" | "USER") => setEditRole(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">USER</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditId(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateRole}>Save</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!resetId} onOpenChange={() => { setResetId(null); setResetPassword("") }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset password</DialogTitle>
            <DialogDescription>
              Set a new password for this user. They will use it to sign in.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reset-password">New password</Label>
              <Input
                id="reset-password"
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                minLength={6}
                placeholder="Min 6 characters"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setResetId(null); setResetPassword("") }}>
                Cancel
              </Button>
              <Button onClick={handleResetPassword} disabled={resetPassword.length < 6}>
                Reset password
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete user</DialogTitle>
            <DialogDescription>
              This will permanently remove the user. They will no longer be able to sign in.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
