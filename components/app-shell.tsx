"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react"

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const active = pathname === href || pathname?.startsWith(href + "/")

  return (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium transition-colors hover:text-foreground",
        active ? "text-foreground" : "text-muted-foreground"
      )}
    >
      {children}
    </Link>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "ADMIN"
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-semibold tracking-tight">
              BangleTracker
            </Link>
            <nav className="hidden sm:flex items-center gap-4">
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/orders">Orders</NavLink>
              <NavLink href="/products">Products</NavLink>
              {isAdmin && <NavLink href="/steps">Steps</NavLink>}
              {isAdmin && <NavLink href="/users">Users</NavLink>}
              {isAdmin && <NavLink href="/activity">Activity</NavLink>}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="sm:hidden"
              onClick={() => setMobileOpen(true)}
            >
              Menu
            </Button>
            <ThemeToggle />
            {session?.user?.email && (
              <div className="hidden md:block text-xs text-muted-foreground">
                {session.user.email}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>

      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent className="sm:hidden">
          <DialogHeader>
            <DialogTitle>Menu</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Link
              href="/dashboard"
              className="rounded-md border px-3 py-2 text-sm"
              onClick={() => setMobileOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/orders"
              className="rounded-md border px-3 py-2 text-sm"
              onClick={() => setMobileOpen(false)}
            >
              Orders
            </Link>
            <Link
              href="/products"
              className="rounded-md border px-3 py-2 text-sm"
              onClick={() => setMobileOpen(false)}
            >
              Products
            </Link>
            {isAdmin && (
              <>
                <Link
                  href="/steps"
                  className="rounded-md border px-3 py-2 text-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  Steps
                </Link>
                <Link
                  href="/users"
                  className="rounded-md border px-3 py-2 text-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  Users
                </Link>
                <Link
                  href="/activity"
                  className="rounded-md border px-3 py-2 text-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  Activity
                </Link>
              </>
            )}
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Sign out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

