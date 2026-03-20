"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type OrderSummary = {
  id: string
  name: string
  notes?: string | null
  createdAt: string
  updatedAt: string
  totalItems: number
  totalSizes?: number
  sizes: string[]
  stepsSummary: Record<string, number>
}

type OrdersResponse = {
  orders: OrderSummary[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

type DraftSize = {
  id: string
  size: string
  file: File | null
}

type DraftDesignItem = {
  id: string
  designName: string
  sizes: DraftSize[]
}

export default function OrdersPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "ADMIN"
  const router = useRouter()

  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [query, setQuery] = useState("")

  const [name, setName] = useState("")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState<DraftDesignItem[]>([
    {
      id: "item-1",
      designName: "",
      sizes: [{ id: "item-1-size-1", size: "", file: null }],
    },
  ])
  const [creating, setCreating] = useState(false)

  async function loadOrders(currentQuery = query) {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (currentQuery.trim()) params.set("search", currentQuery.trim())
      const res = await fetch(`/api/orders?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to load orders")
      const data: OrdersResponse = await res.json()
      setOrders(data.orders)
    } catch (e: any) {
      console.error(e)
      setError(e.message ?? "Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  function addDesignItem() {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${prev.length + 1}`,
        designName: "",
        sizes: [
          { id: `item-${prev.length + 1}-size-1`, size: "", file: null },
        ],
      },
    ])
  }

  function removeDesignItem(id: string) {
    setItems((prev) => (prev.length <= 1 ? prev : prev.filter((it) => it.id !== id)))
  }

  function updateDesignName(id: string, designName: string) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, designName } : it))
    )
  }

  function addSizeRow(designItemId: string) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== designItemId) return it
        const nextIdx = it.sizes.length + 1
        return {
          ...it,
          sizes: [
            ...it.sizes,
            { id: `${it.id}-size-${nextIdx}`, size: "", file: null },
          ],
        }
      })
    )
  }

  function removeSizeRow(designItemId: string, sizeId: string) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== designItemId) return it
        if (it.sizes.length <= 1) return it
        return { ...it, sizes: it.sizes.filter((s) => s.id !== sizeId) }
      })
    )
  }

  function updateSizeValue(designItemId: string, sizeId: string, size: string) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== designItemId) return it
        return {
          ...it,
          sizes: it.sizes.map((s) => (s.id === sizeId ? { ...s, size } : s)),
        }
      })
    )
  }

  function updateSizeFile(designItemId: string, sizeId: string, file: File | null) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== designItemId) return it
        return {
          ...it,
          sizes: it.sizes.map((s) => (s.id === sizeId ? { ...s, file } : s)),
        }
      })
    )
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!isAdmin) return
    setError(null)
    setCreating(true)

    try {
      // upload files first (optional)
      const uploadedUrls: Record<string, string | undefined> = {}
      for (const item of items) {
        for (const s of item.sizes) {
          if (!s.file) continue
          const formData = new FormData()
          formData.append("file", s.file)
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })
          if (!uploadRes.ok) {
            const body = await uploadRes.json().catch(() => null)
            throw new Error(body?.error ?? "Image upload failed")
          }
          const uploadBody = await uploadRes.json()
          uploadedUrls[s.id] = uploadBody.url
        }
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          notes: notes || undefined,
          items: items
            .filter((it) => it.designName.trim())
            .map((it) => ({
              productName: it.designName.trim(),
              sizes: it.sizes
                .filter((s) => s.size.trim())
                .map((s) => ({
                  size: s.size.trim(),
                  photoUrl: uploadedUrls[s.id],
                })),
            })),
        }),
      })

      const body = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(body?.error ?? "Failed to create order")
      }

      setName("")
      setNotes("")
      setItems([
        {
          id: "item-1",
          designName: "",
          sizes: [{ id: "item-1-size-1", size: "", file: null }],
        },
      ])
      await loadOrders()
    } catch (e: any) {
      console.error(e)
      setError(e.message ?? "Failed to create order")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Orders
          </h1>
          <p className="text-sm text-muted-foreground">
            Each order can contain multiple products, and each product can contain multiple sizes.
          </p>
        </div>
      </div>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Create new order</CardTitle>
            <CardDescription>
              Add an order name, then add one or more products and sizes. Each size is tracked independently.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="order-name">Order name / number</Label>
                  <Input
                    id="order-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Order-123"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order-notes">Notes (optional)</Label>
                  <Input
                    id="order-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any extra details…"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Products and sizes</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addDesignItem}>
                    Add product
                  </Button>
                </div>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="rounded-lg border p-3 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground">
                            Product
                          </Label>
                          <Input
                            value={item.designName}
                            onChange={(e) => updateDesignName(item.id, e.target.value)}
                            placeholder={idx === 0 ? "Product name (e.g. Bangle A)" : "Product name"}
                            required={idx === 0}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addSizeRow(item.id)}
                          >
                            Add size
                          </Button>
                          {items.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDesignItem(item.id)}
                            >
                              Remove product
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {item.sizes.map((s, sIdx) => (
                          <div
                            key={s.id}
                            className="grid gap-2 md:grid-cols-[2fr,2fr,auto]"
                          >
                            <Input
                              value={s.size}
                              onChange={(e) => updateSizeValue(item.id, s.id, e.target.value)}
                              placeholder={sIdx === 0 ? "Size (e.g. 2.8, 11)" : "Size"}
                              required={idx === 0 && sIdx === 0}
                            />
                            <Input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={(e) =>
                                updateSizeFile(item.id, s.id, e.target.files?.[0] ?? null)
                              }
                            />
                            <div className="flex items-center justify-end">
                              {item.sizes.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeSizeRow(item.id, s.id)}
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={creating}>
                  {creating ? "Creating…" : "Create order"}
                </Button>
                {error && (
                  <div
                    className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                    role="alert"
                  >
                    {error}
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Orders</CardTitle>
            <CardDescription>Click an order to view items and progress.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by order name…"
              className="w-48"
            />
            <Button variant="outline" onClick={() => loadOrders()}>
              Search
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-14 rounded-md border bg-muted/30 animate-pulse"
                />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No orders yet. {isAdmin ? "Create your first order above." : ""}
            </p>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => router.push(`/orders/${o.id}`)}
                  className="w-full text-left rounded-lg border bg-card px-4 py-3 hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{o.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {o.totalItems} item{o.totalItems === 1 ? "" : "s"}
                        {typeof o.totalSizes === "number"
                          ? ` · ${o.totalSizes} size${o.totalSizes === 1 ? "" : "s"}`
                          : ""}
                        {o.sizes.length > 0 && ` · Sizes: ${o.sizes.join(", ")}`}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      <div>
                        Updated{" "}
                        {new Date(o.updatedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                  {Object.keys(o.stepsSummary).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {Object.entries(o.stepsSummary).map(([step, count]) => (
                        <span
                          key={step}
                          className="rounded-full border px-2 py-0.5"
                        >
                          {count} at step {step}
                        </span>
                      ))}
                    </div>
                  )}
                  {o.notes && (
                    <div className="mt-2 text-xs text-muted-foreground line-clamp-1">
                      {o.notes}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

