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
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as <span className="font-medium">{session.user.email}</span>
        </p>
      </div>

      <DashboardStats />

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>
              Create orders with multiple sizes and track each item through 11 steps.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="h-11 w-full sm:w-auto">
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
            <Button asChild variant="outline" className="h-11 w-full sm:w-auto">
              <Link href="/steps">Configure steps</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
