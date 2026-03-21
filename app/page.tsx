import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-3 pb-12 pt-6 sm:px-4 sm:pt-10">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-medium text-muted-foreground">
              Manufacturing tracker
            </div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
              BangleFlow
            </h1>
          </div>
          <div className="shrink-0">
            <ThemeToggle />
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Create orders, track bangle products through each of the 11 manufacturing steps,
              and keep your team aligned with progress + ETA insights.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-11 w-full sm:w-auto">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-11 w-full sm:w-auto"
              >
                <Link href="#features">See features</Link>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {[
                "Touch-friendly UI",
                "Photo per size (optional)",
                "Step progress tracking",
                "Simple admin tools",
              ].map((t) => (
                <span
                  key={t}
                  className="rounded-full border bg-card/70 px-3 py-1 text-xs text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>

            <div id="features" className="mt-8 space-y-3">
              <div className="text-sm font-medium">What you get</div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    title: "Orders → products → sizes",
                    desc: "Build a full order in minutes, including multiple products and sizes.",
                  },
                  {
                    title: "Live step progress",
                    desc: "Track where each item is and keep expected timing visible.",
                  },
                  {
                    title: "Cleaner dashboard",
                    desc: "At-a-glance counts by step, redesigned for mobile clarity.",
                  },
                  {
                    title: "Admin controls",
                    desc: "Advance steps, configure durations, and manage users.",
                  },
                ].map((f) => (
                  <div
                    key={f.title}
                    className="rounded-xl border bg-card/60 p-4"
                  >
                    <div className="font-medium">{f.title}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-24">
            <Card>
              <CardContent className="p-5">
                <div className="text-sm font-medium text-muted-foreground">
                  Quick start
                </div>
                <div className="mt-2 space-y-3">
                  {[
                    { n: "1", t: "Sign in" },
                    { n: "2", t: "Create an order" },
                    { n: "3", t: "Add products + sizes" },
                    { n: "4", t: "Advance steps" },
                  ].map((s) => (
                    <div
                      key={s.n}
                      className="flex items-start gap-3 rounded-lg border bg-background/50 px-3 py-2"
                    >
                      <div className="mt-0.5 grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                        {s.n}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{s.t}</div>
                        <div className="text-xs text-muted-foreground">
                          Tap-friendly on mobile
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <Button asChild className="h-11 w-full" size="lg">
                    <Link href="/login">Go to sign in</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <p className="mt-3 text-xs text-muted-foreground">
              You will be redirected to the dashboard after signing in.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

