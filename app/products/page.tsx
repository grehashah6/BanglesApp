"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Product = {
  id: string
  name: string
  size: string
  photoUrl?: string | null
  currentStep: number
  order?: { id: string; name: string } | null
  archived?: boolean
  createdAt: string
  updatedAt: string
}

type ProductsResponse = {
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

type Step = {
  stepNumber: number
  stepName: string
  estimatedDurationDays?: number | null
}

const TOTAL_STEPS = 11

export default function ProductsPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "ADMIN"
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [advancingId, setAdvancingId] = useState<string | null>(null)

  const [query, setQuery] = useState("")
  const [stepFilter, setStepFilter] = useState<string>("all")
  const [includeArchived, setIncludeArchived] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkAdvancing, setBulkAdvancing] = useState(false)

  const [steps, setSteps] = useState<Step[]>([])

  const stepNameByNumber = useMemo(() => {
    const map = new Map<number, string>()
    for (const s of steps) map.set(s.stepNumber, s.stepName)
    return map
  }, [steps])

  const stepDurationByNumber = useMemo(() => {
    const map = new Map<number, number>()
    for (const s of steps) {
      const days = Number(s.estimatedDurationDays)
      if (!Number.isNaN(days)) {
        map.set(s.stepNumber, days)
      }
    }
    return map
  }, [steps])

  async function loadProducts(overrides?: { query?: string; step?: string; archived?: boolean }) {
    setLoading(true)
    try {
      const q = overrides?.query ?? query
      const st = overrides?.step ?? stepFilter
      const arch = overrides?.archived ?? includeArchived
      const params = new URLSearchParams()
      if (q.trim()) params.set("search", q.trim())
      if (st !== "all") params.set("step", st)
      if (arch) params.set("archived", "true")

      const res = await fetch(`/api/products?${params.toString()}`)
      if (!res.ok) {
        throw new Error("Failed to load products")
      }
      const data: ProductsResponse = await res.json()
      setProducts(data.products)
    } catch (e: any) {
      console.error(e)
      setError(e.message ?? "Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    async function loadSteps() {
      try {
        const res = await fetch("/api/steps")
        if (!res.ok) return
        const data = await res.json()
        setSteps(
          Array.isArray(data)
            ? data.map((s: any) => ({
                stepNumber: s.stepNumber,
                stepName: s.stepName,
                // Back-compat: some dev servers may still return estimatedDurationHours
                // until Next is restarted after Prisma schema changes.
                estimatedDurationDays:
                  s.estimatedDurationDays ??
                  (typeof s.estimatedDurationHours === "number"
                    ? s.estimatedDurationHours / 24
                    : null),
              }))
            : []
        )
      } catch {
        // ignore
      }
    }
    loadSteps()
  }, [])

  function formatProgress(step: number) {
    const pct = Math.round((step / TOTAL_STEPS) * 100)
    return `${pct}%`
  }

  function getEta(product: Product) {
    // Dynamic ETA:
    // - Use when the item *actually* reached the current step (product.updatedAt)
    // - Add estimated days for remaining steps (currentStep+1 .. 11)
    if (steps.length === 0) return null

    let remainingDays = 0
    let hasAnyDuration = false
    for (let n = product.currentStep + 1; n <= TOTAL_STEPS; n++) {
      const h = stepDurationByNumber.get(n)
      if (typeof h === "number" && Number.isFinite(h) && h > 0) {
        remainingDays += h
        hasAnyDuration = true
      }
    }

    if (!hasAnyDuration) return null

    const reachedAt = new Date(product.updatedAt)
    const eta = new Date(
      reachedAt.getTime() + remainingDays * 24 * 60 * 60 * 1000
    )
    return { eta, remainingDays }
  }

  async function advanceProduct(e: React.MouseEvent, productId: string, currentStep: number) {
    e.preventDefault()
    e.stopPropagation()
    if (!isAdmin) return

    const nextStep = Math.min(currentStep + 1, TOTAL_STEPS)
    setAdvancingId(productId)
    try {
      const res = await fetch(`/api/products/${productId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepNumber: nextStep }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? "Failed to advance step")
      }
      await loadProducts()
    } catch (e: any) {
      console.error(e)
      setError(e.message ?? "Failed to advance step")
    } finally {
      setAdvancingId(null)
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === products.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(products.map((p) => p.id)))
  }

  async function bulkAdvance() {
    if (selectedIds.size === 0) return
    setBulkAdvancing(true)
    setError(null)
    try {
      const res = await fetch("/api/products/bulk-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: Array.from(selectedIds) }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error ?? "Bulk update failed")
      setSelectedIds(new Set())
      await loadProducts()
      if (data.failed > 0) {
        setError(`${data.updated} advanced; ${data.failed} failed.`)
      }
    } catch (e: any) {
      setError(e.message ?? "Bulk advance failed")
    } finally {
      setBulkAdvancing(false)
    }
  }

  const canBulkAdvance =
    isAdmin &&
    selectedIds.size > 0 &&
    products.some((p) => selectedIds.has(p.id) && p.currentStep < TOTAL_STEPS)

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Products
          </h1>
          <p className="text-sm text-muted-foreground">
            Track each bangle from step 1 to step {TOTAL_STEPS}.
          </p>
        </div>
        <Badge variant={isAdmin ? "default" : "secondary"}>
          {isAdmin ? "Admin" : "Viewer"}
        </Badge>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Items</CardTitle>
            <CardDescription>Click an item to view details and history.</CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => loadProducts()}
            >
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const headers = ["Name", "Size", "Step", "Progress %", "Updated"]
                                const rows = products.map((p) => [
                                  `"${(p.name ?? "").replace(/"/g, '""')}"`,
                                  `"${(p.size ?? "").replace(/"/g, '""')}"`,
                                  p.currentStep,
                                  Math.round((p.currentStep / TOTAL_STEPS) * 100),
                                  new Date(p.updatedAt).toISOString(),
                                ])
                                const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
                                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
                                const url = URL.createObjectURL(blob)
                                const a = document.createElement("a")
                                a.href = url
                                a.download = `products-${new Date().toISOString().slice(0, 10)}.csv`
                                a.click()
                                URL.revokeObjectURL(url)
                              }}
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
            >
              Print / PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-3">
            <div className="grid gap-3 md:grid-cols-[1fr,220px,auto]">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name…"
              />
              <Select value={stepFilter} onValueChange={setStepFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by step" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All steps</SelectItem>
                  {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      Step {n}
                      {stepNameByNumber.get(n) ? ` · ${stepNameByNumber.get(n)}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => loadProducts({ query, step: stepFilter, archived: includeArchived })}>
                Apply
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeArchived}
                  onChange={(e) => {
                    setIncludeArchived(e.target.checked)
                    loadProducts({ query, step: stepFilter, archived: e.target.checked })
                  }}
                  className="rounded border-input"
                />
                Show archived
              </label>
              {isAdmin && products.length > 0 && (
                <>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === products.length && products.length > 0}
                      ref={(el) => {
                        if (el) el.indeterminate = selectedIds.size > 0 && selectedIds.size < products.length
                      }}
                      onChange={toggleSelectAll}
                      className="rounded border-input"
                    />
                    Select all
                  </label>
                  {canBulkAdvance && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={bulkAdvance}
                      disabled={bulkAdvancing}
                    >
                      {bulkAdvancing ? "Advancing…" : `Advance ${selectedIds.size} to next step`}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-12 rounded-md border bg-muted/30 animate-pulse"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-md border bg-muted/20 p-6">
              <div className="text-sm font-medium">No items found</div>
              <div className="text-sm text-muted-foreground mt-1">
                {isAdmin
                  ? "Create an order to generate products, or clear your filters."
                  : "Ask an admin to create an order, or clear your filters."}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery("")
                    setStepFilter("all")
                    loadProducts({ query: "", step: "all" })
                  }}
                >
                  Clear filters
                </Button>
              </div>
            </div>
          ) : (
            <>
            {/* Mobile: card list */}
            <div className="md:hidden space-y-3">
              {products.map((p) => {
                const etaInfo = getEta(p)
                return (
                  <Card
                    key={p.id}
                    className="cursor-pointer transition-all hover:shadow-md active:scale-[0.99]"
                    onClick={() => router.push(`/products/${p.id}`)}
                  >
                    <CardContent className="p-4 flex gap-3">
                      {isAdmin && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(p.id)}
                            onChange={() => toggleSelect(p.id)}
                            className="rounded border-input"
                          />
                        </div>
                      )}
                      <div className="h-12 w-12 rounded-md border bg-muted shrink-0 overflow-hidden flex items-center justify-center">
                        {p.photoUrl ? (
                          <img src={p.photoUrl} alt={p.name} className="h-12 w-12 object-cover" />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{p.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Size {p.size} · Step {p.currentStep}
                          {stepNameByNumber.get(p.currentStep) && ` · ${stepNameByNumber.get(p.currentStep)}`}
                        </div>
                        {p.order?.name && (
                          <div className="text-[11px] text-muted-foreground">
                            Order: {p.order.name}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-1.5 flex-1 max-w-20 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${Math.round((p.currentStep / TOTAL_STEPS) * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {etaInfo ? etaInfo.eta.toLocaleDateString(undefined, { month: "short", day: "2-digit" }) : "—"}
                          </span>
                        </div>
                        {isAdmin && p.currentStep < TOTAL_STEPS && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 w-full"
                            disabled={advancingId === p.id}
                            onClick={(e) => { e.stopPropagation(); advanceProduct(e, p.id, p.currentStep) }}
                          >
                            {advancingId === p.id ? "Advancing…" : "Advance"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            {/* Desktop: table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    {isAdmin && (
                      <th className="text-left py-3 pr-2 w-10">
                        <input
                          type="checkbox"
                          checked={products.length > 0 && selectedIds.size === products.length}
                          ref={(el) => {
                            if (el) el.indeterminate = selectedIds.size > 0 && selectedIds.size < products.length
                          }}
                          onChange={toggleSelectAll}
                          className="rounded border-input"
                        />
                      </th>
                    )}
                    <th className="text-left py-3 pr-4">Item</th>
                    <th className="text-left py-3 pr-4">Size</th>
                    <th className="text-left py-3 pr-4">Step</th>
                    <th className="text-left py-3 pr-4">Progress</th>
                    <th className="text-left py-3 pr-4">ETA</th>
                    <th className="text-left py-3">Updated</th>
                    {isAdmin && <th className="text-left py-3" />}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    (() => {
                      const etaInfo = getEta(p)
                      const etaLabel = etaInfo
                        ? etaInfo.eta.toLocaleDateString(undefined, {
                            month: "short",
                            day: "2-digit",
                          })
                        : "—"
                      const etaTitle = etaInfo
                        ? `~${Math.round(etaInfo.remainingDays)} day(s) remaining from step ${p.currentStep}`
                        : "Configure step durations in Steps"

                      return (
                    <tr
                      key={p.id}
                      className="group relative border-b last:border-0 cursor-pointer transition-all duration-150 hover:bg-primary/5 hover:shadow-md hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      onClick={() => router.push(`/products/${p.id}`)}
                      role="link"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          router.push(`/products/${p.id}`)
                        }
                      }}
                    >
                      {isAdmin && (
                        <td className="py-3 pr-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(p.id)}
                            onChange={() => toggleSelect(p.id)}
                            className="rounded border-input"
                          />
                        </td>
                      )}
                      <td className="py-3 pr-4 relative">
                        <span className="pointer-events-none absolute left-0 top-2 bottom-2 w-1 rounded-full bg-primary/0 group-hover:bg-primary/60 transition-colors" />
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md border bg-muted overflow-hidden flex items-center justify-center transition-colors group-hover:border-ring/30">
                            {p.photoUrl ? (
                              <img
                                src={p.photoUrl}
                                alt={p.name}
                                className="h-10 w-10 object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                                loading="lazy"
                              />
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            )}
                          </div>
                          <Link
                            href={`/products/${p.id}`}
                            className="font-medium hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {p.name}
                          </Link>
                          {p.order?.name && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              Order: {p.order.name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{p.size}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={p.currentStep >= TOTAL_STEPS ? "default" : "secondary"}>
                          Step {p.currentStep}
                          {stepNameByNumber.get(p.currentStep)
                            ? ` · ${stepNameByNumber.get(p.currentStep)}`
                            : ""}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-2 bg-primary"
                              style={{
                                width: `${Math.round((p.currentStep / TOTAL_STEPS) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-muted-foreground">
                            {formatProgress(p.currentStep)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground" title={etaTitle}>
                        {etaLabel}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(p.updatedAt).toLocaleString()}
                      </td>
                      {isAdmin && (
                        <td className="py-3">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={advancingId === p.id || p.currentStep >= TOTAL_STEPS}
                            onClick={(e) => advanceProduct(e, p.id, p.currentStep)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {p.currentStep >= TOTAL_STEPS
                              ? "Done"
                              : advancingId === p.id
                                ? "Advancing…"
                                : "Advance"}
                          </Button>
                        </td>
                      )}
                    </tr>
                      )
                    })()
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

