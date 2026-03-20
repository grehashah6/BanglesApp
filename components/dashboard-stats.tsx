"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

type Stats = {
  totalProducts: number
  completionRate: number
  completedCount: number
  productsPerStep: { stepNumber: number; stepName: string; count: number }[]
  overdueCount: number
  averageTimePerStep: { stepNumber: number; avgDays: number; count: number }[]
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setStats(data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-5 w-24 rounded bg-muted animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 rounded bg-muted animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const maxCount = Math.max(1, ...stats.productsPerStep.map((s) => s.count))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedCount} of {stats.totalProducts} at step 11
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overdueCount}</div>
            <p className="text-xs text-muted-foreground">
              Past ETA (based on step durations)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg time per step
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageTimePerStep.length > 0
                ? `${(
                    stats.averageTimePerStep.reduce((a, s) => a + s.avgDays, 0) /
                    stats.averageTimePerStep.length
                  ).toFixed(1)}d`
                : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              From history (steps 1→2, 2→3, …)
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products per step</CardTitle>
          <CardDescription>Distribution across pipeline steps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.productsPerStep.map((s) => (
              <div key={s.stepNumber} className="flex items-center gap-3">
                <div className="w-24 shrink-0 text-sm text-muted-foreground">
                  Step {s.stepNumber}
                </div>
                <div className="flex-1 h-6 rounded-md bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-md transition-all"
                    style={{
                      width: `${Math.max(4, (s.count / maxCount) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium w-8">{s.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
