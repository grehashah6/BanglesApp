import Link from "next/link"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"

function FeatureCard({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <Card className="border-border/70 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0">{icon}</div>
          <div className="min-w-0">
            <div className="font-medium leading-tight">{title}</div>
            <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 -translate-x-1/2 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl motion-safe:animate-[float_7s_ease-in-out_infinite]" />
        <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl motion-safe:animate-[float_9s_ease-in-out_infinite]" />
        <div className="absolute -right-24 top-24 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl motion-safe:animate-[float_8s_ease-in-out_infinite]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              Mobile-first manufacturing tracker
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">BangleFlow</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Create orders, track each bangle through 11 steps, and keep ETA visible.
            </p>
          </div>

          <div className="shrink-0">
            <ThemeToggle />
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild size="lg" className="h-12 w-full sm:w-auto">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          <FeatureCard
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M3 12h18" />
                <path d="M7 7h10" />
                <path d="M7 17h10" />
              </svg>
            }
            title="Orders that scale"
            desc="Build products + sizes in one go."
          />
          <FeatureCard
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M12 2v20" />
                <path d="M4 7h16" />
                <path d="M4 17h16" />
                <path d="M7 12h10" />
              </svg>
            }
            title="Live step progress"
            desc="Advance items with one tap."
          />
          <FeatureCard
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M21 15a4 4 0 0 1-4 4H7l-4 3V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" />
                <path d="M7 8h10" />
                <path d="M7 12h7" />
              </svg>
            }
            title="ETA you can trust"
            desc="Use step durations for better timing."
          />
        </div>

        <div className="mt-6 rounded-2xl border bg-card/50 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="font-medium">Simple start</div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Sign in to create orders, add sizes/photos, and track progress on mobile.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

