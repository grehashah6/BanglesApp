import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DashboardStats } from "@/components/dashboard-stats"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as <span className="font-medium">{session.user.email}</span>
        </p>
      </div>

      <DashboardStats />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>
              Create orders with multiple sizes and track each item through 11 steps.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/orders">View orders</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step durations</CardTitle>
            <CardDescription>
              Tune estimated hours per step to improve ETA accuracy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/steps">Configure steps</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
