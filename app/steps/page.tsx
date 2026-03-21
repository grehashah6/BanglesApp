"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Step = {
  id: string
  stepNumber: number
  stepName: string
  description: string | null
  order: number
  estimatedDurationDays: number | null
}

export default function StepsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [steps, setSteps] = useState<Step[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const isAdmin = session?.user?.role === "ADMIN"

  useEffect(() => {
    if (status === "loading") return
    if (!session || !isAdmin) {
      router.push("/dashboard")
      return
    }

    async function load() {
      setLoading(true)
      const res = await fetch("/api/steps")
      const data = await res.json()
      setSteps(
        Array.isArray(data)
          ? data.map((s: any) => ({
              ...s,
              estimatedDurationDays:
                s.estimatedDurationDays ??
                (typeof s.estimatedDurationHours === "number"
                  ? s.estimatedDurationHours / 24
                  : null),
            }))
          : []
      )
      setLoading(false)
    }
    load()
  }, [session, status, isAdmin, router])

  async function save() {
    setSaving(true)
    setSaved(false)
    await fetch("/api/steps", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        steps: steps.map((s) => ({
          stepNumber: s.stepNumber,
          estimatedDurationDays: s.estimatedDurationDays,
        })),
      }),
    })
    setSaving(false)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1500)
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Step durations</h1>
          <p className="text-sm text-muted-foreground">
            Configure typical days for each step to drive ETA.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <div className="text-sm text-muted-foreground">Saved</div>
          )}
          <Button type="button" onClick={save} disabled={saving} className="h-10 w-full sm:w-auto">
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Steps</CardTitle>
          <CardDescription>
            Use days as a baseline; you can refine later for better ETA accuracy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:hidden">
            {steps.map((s) => (
              <div key={s.id} className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Step {s.stepNumber}</div>
                <div className="font-medium">{s.stepName}</div>
                {s.description && (
                  <div className="mt-1 text-xs text-muted-foreground">{s.description}</div>
                )}
                <div className="mt-3">
                  <Input
                    type="number"
                    className="h-10 w-full"
                    value={
                      s.estimatedDurationDays !== null
                        ? s.estimatedDurationDays
                        : ""
                    }
                    onChange={(e) => {
                      const value =
                        e.target.value === ""
                          ? null
                          : Number(e.target.value)
                      setSteps((prev) =>
                        prev.map((p) =>
                          p.id === s.id
                            ? { ...p, estimatedDurationDays: value }
                            : p
                        )
                      )
                    }}
                    placeholder="Estimated days"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="text-left py-3 pr-4">#</th>
                  <th className="text-left py-3 pr-4">Step</th>
                  <th className="text-left py-3 pr-4">Description</th>
                  <th className="text-left py-3">Estimated days</th>
                </tr>
              </thead>
              <tbody>
                {steps.map((s) => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 text-muted-foreground">{s.stepNumber}</td>
                    <td className="py-3 pr-4 font-medium">{s.stepName}</td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {s.description}
                    </td>
                    <td className="py-3">
                      <Input
                        type="number"
                        className="w-28"
                        value={
                          s.estimatedDurationDays !== null
                            ? s.estimatedDurationDays
                            : ""
                        }
                        onChange={(e) => {
                          const value =
                            e.target.value === ""
                              ? null
                              : Number(e.target.value)
                          setSteps((prev) =>
                            prev.map((p) =>
                              p.id === s.id
                                ? { ...p, estimatedDurationDays: value }
                                : p
                            )
                          )
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

