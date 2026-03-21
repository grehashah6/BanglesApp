"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Log = {
  id: string
  action: string
  entityType: string
  entityId: string | null
  details: string | null
  createdAt: string
  user: { id: string; email: string; name: string | null }
}

export default function ActivityPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login")
      return
    }
    if (session?.user?.role !== "ADMIN") {
      router.replace("/dashboard")
      return
    }
    load()
  }, [status, session, router])

  async function load(cursor?: string) {
    if (cursor) setLoadingMore(true)
    else setLoading(true)
    try {
      const url = cursor
        ? `/api/activity?limit=50&cursor=${encodeURIComponent(cursor)}`
        : "/api/activity?limit=50"
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to load")
      const data = await res.json()
      if (cursor) {
        setLogs((prev) => [...prev, ...data.logs])
      } else {
        setLogs(data.logs)
      }
      setNextCursor(data.nextCursor)
    } finally {
      setLoading(false)
      setLoadingMore(false)
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
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Activity log
        </h1>
        <p className="text-sm text-muted-foreground">
          Timeline of actions across the app (create, advance step, archive, delete).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <CardDescription>Recent activity by all users.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 rounded-md bg-muted animate-pulse" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="space-y-4">
              {logs.map((log) => (
                <li
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 rounded-lg border p-4 text-sm"
                >
                  <div className="shrink-0 text-muted-foreground sm:w-36">
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">{log.action}</span>
                    <span className="text-muted-foreground"> · {log.entityType}</span>
                    {log.details && (
                      <span className="text-muted-foreground"> · {log.details}</span>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {log.user?.name || log.user?.email}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {nextCursor && (
            <div className="mt-4">
              <Button
                variant="outline"
                className="h-10 w-full sm:w-auto"
                onClick={() => load(nextCursor)}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading…" : "Load more"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
