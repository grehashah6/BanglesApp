"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ImagePreviewDialog } from "@/components/image-preview-dialog"

const TOTAL_STEPS = 11

type OrderItemSize = {
  id: string
  size: string
  photoUrl?: string | null
  currentStep: number
  createdAt: string
  updatedAt: string
  history: {
    id: string
    stepNumber: number
    notes?: string | null
    updatedAt: string
    updatedByUser?: { name: string | null; email: string } | null
  }[]
}

type OrderDesignItem = {
  id: string
  designName: string
  createdAt: string
  updatedAt: string
  sizes: OrderItemSize[]
}

type OrderDetail = {
  id: string
  name: string
  notes?: string | null
  createdAt: string
  updatedAt: string
  createdByUser?: { name: string | null; email: string } | null
  items: OrderDesignItem[]
}

export default function OrderDetailPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "ADMIN"
  const router = useRouter()
  const params = useParams<{ id: string }>()

  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [advancingId, setAdvancingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkAdvancing, setBulkAdvancing] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/orders/${params.id}`)
        if (!res.ok) {
          throw new Error("Failed to load order")
        }
        const data = await res.json()
        setOrder(data)
      } catch (e: any) {
        setError(e.message ?? "Failed to load order")
      } finally {
        setLoading(false)
      }
    }
    if (params.id) {
      load()
    }
  }, [params.id])

  const designItems = order?.items ?? []
  const allSizes = useMemo(
    () => designItems.flatMap((it) => it.sizes || []),
    [designItems]
  )

  const stepCounts = useMemo(() => {
    const m = new Map<number, number>()
    for (const s of allSizes) {
      m.set(s.currentStep, (m.get(s.currentStep) || 0) + 1)
    }
    return m
  }, [allSizes])

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (!order) return
    if (selectedIds.size === allSizes.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(allSizes.map((s) => s.id)))
    }
  }

  async function advanceSize(id: string, currentStep: number) {
    if (!isAdmin) return
    const nextStep = Math.min(currentStep + 1, TOTAL_STEPS)
    setAdvancingId(id)
    setError(null)
    try {
      const res = await fetch(`/api/orders/items/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepNumber: nextStep }),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) throw new Error(body?.error ?? "Failed to advance item")
      // reload order
      const refreshed = await fetch(`/api/orders/${params.id}`)
      if (refreshed.ok) {
        setOrder(await refreshed.json())
      }
    } catch (e: any) {
      setError(e.message ?? "Failed to advance item")
    } finally {
      setAdvancingId(null)
    }
  }

  async function bulkAdvance() {
    if (!order || selectedIds.size === 0) return
    setBulkAdvancing(true)
    setError(null)
    try {
      const res = await fetch(`/api/orders/${order.id}/bulk-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sizeIds: Array.from(selectedIds) }),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) throw new Error(body?.error ?? "Failed to bulk advance")
      const refreshed = await fetch(`/api/orders/${params.id}`)
      if (refreshed.ok) {
        setOrder(await refreshed.json())
      }
      setSelectedIds(new Set())
    } catch (e: any) {
      setError(e.message ?? "Failed to bulk advance")
    } finally {
      setBulkAdvancing(false)
    }
  }

  const canBulkAdvance =
    isAdmin &&
    allSizes.length > 0 &&
    selectedIds.size > 0 &&
    allSizes.some((s) => selectedIds.has(s.id) && s.currentStep < TOTAL_STEPS)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-7 w-40 bg-muted animate-pulse rounded" />
        <div className="h-40 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Order not found.</p>
        <Button variant="outline" onClick={() => router.push("/orders")}>
          Back to orders
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => router.push("/orders")}
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Back to orders
          </button>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            {order.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>
              {order.createdByUser
                ? `Created by ${order.createdByUser.name || order.createdByUser.email}`
                : null}
            </span>
            <span>·</span>
            <span>
              {new Date(order.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })}
            </span>
          </div>
          {order.notes && (
            <p className="text-sm text-muted-foreground max-w-xl mt-1">
              {order.notes}
            </p>
          )}
        </div>
        <Badge variant={isAdmin ? "default" : "secondary"}>
          {isAdmin ? "Admin" : "Viewer"}
        </Badge>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Products</CardTitle>
              <CardDescription>
                Products can have multiple sizes. Each size is tracked separately.
              </CardDescription>
            </div>
            {isAdmin && allSizes.length > 0 && (
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === allSizes.length}
                    ref={(el) => {
                      if (!el) return
                      el.indeterminate =
                        selectedIds.size > 0 && selectedIds.size < allSizes.length
                    }}
                    onChange={toggleSelectAll}
                    className="rounded border-input"
                  />
                  Select all
                </label>
                {canBulkAdvance && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={bulkAdvance}
                    disabled={bulkAdvancing}
                  >
                    {bulkAdvancing
                      ? "Advancing…"
                      : `Advance ${selectedIds.size} selected`}
                  </Button>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent>
            {designItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No items on this order yet.
              </p>
            ) : (
              <div className="space-y-3">
                {designItems.map((it) => (
                  <div key={it.id} className="rounded-lg border">
                    <div className="px-3 py-2 border-b bg-muted/30">
                      <div className="text-sm font-medium">{it.designName}</div>
                      <div className="text-xs text-muted-foreground">
                        {it.sizes?.length ?? 0} size(s)
                      </div>
                    </div>
                    <div className="p-3 space-y-3">
                      {(it.sizes || []).map((s) => (
                        <div
                          key={s.id}
                          className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-lg border px-3 py-2"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {isAdmin && (
                              <input
                                type="checkbox"
                                checked={selectedIds.has(s.id)}
                                onChange={() => toggleSelect(s.id)}
                                className="rounded border-input"
                              />
                            )}
                            {s.photoUrl ? (
                              <ImagePreviewDialog
                                src={s.photoUrl}
                                alt={`${it.designName} · size ${s.size}`}
                                title={`${it.designName} — size ${s.size}`}
                                className="h-10 w-10 shrink-0"
                                imgClassName="object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-muted">
                                <span className="text-xs text-muted-foreground">—</span>
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="text-sm font-medium">Size {s.size}</div>
                              <div className="text-xs text-muted-foreground">
                                Step {s.currentStep} of {TOTAL_STEPS}
                              </div>
                              <div className="mt-1 flex items-center gap-2">
                                <div className="h-1.5 w-16 sm:w-24 rounded-full bg-muted overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full"
                                    style={{
                                      width: `${Math.round(
                                        (s.currentStep / TOTAL_STEPS) * 100
                                      )}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {Math.round((s.currentStep / TOTAL_STEPS) * 100)}%
                                </span>
                              </div>
                            </div>
                          </div>
                          {isAdmin && (
                            <div className="flex items-center gap-2 w-full md:w-auto">
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full md:w-auto"
                                disabled={
                                  advancingId === s.id ||
                                  s.currentStep >= TOTAL_STEPS
                                }
                                onClick={() => advanceSize(s.id, s.currentStep)}
                              >
                                {s.currentStep >= TOTAL_STEPS
                                  ? "Done"
                                  : advancingId === s.id
                                    ? "Advancing…"
                                    : "Advance"}
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>
              Distribution of items across the 11 steps.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {allSizes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No items yet to summarize.
              </p>
            ) : stepCounts.size === 0 ? (
              <p className="text-sm text-muted-foreground">
                No step data available.
              </p>
            ) : (
              <div className="space-y-2">
                {Array.from(stepCounts.entries())
                  .sort(([a], [b]) => a - b)
                  .map(([step, count]) => (
                    <div key={step} className="flex items-center gap-3 text-sm">
                      <div className="w-28 text-muted-foreground">
                        Step {step}
                      </div>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${Math.max(
                              8,
                              (count / allSizes.length) * 100
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="w-10 text-right text-xs text-muted-foreground">
                        {count}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent item history</CardTitle>
          <CardDescription>
            Latest updates across all items in this order.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allSizes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No history yet.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {allSizes
                .flatMap((s) =>
                  (s.history || []).map((h) => ({ size: s, history: h }))
                )
                .sort(
                  (a, b) =>
                    new Date(b.history.updatedAt).getTime() -
                    new Date(a.history.updatedAt).getTime()
                )
                .slice(0, 20)
                .map(({ size, history }) => (
                  <li
                    key={history.id}
                    className="rounded-md border px-3 py-2 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">
                        Size {size.size} · Step {history.stepNumber}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(history.updatedAt).toLocaleString()}
                      </div>
                    </div>
                    {history.notes && (
                      <div className="text-sm text-muted-foreground">
                        {history.notes}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {history.updatedByUser
                        ? history.updatedByUser.name ||
                          history.updatedByUser.email
                        : ""}
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

