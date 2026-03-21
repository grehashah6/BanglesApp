import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { AdvanceStepForm } from "@/components/advance-step-form"
import { ProductActions } from "@/components/product-actions"
import { ProductComments } from "@/components/product-comments"
import { ImagePreviewDialog } from "@/components/image-preview-dialog"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const TOTAL_STEPS = 11

type PageProps = {
  params: { id: string }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session) {
    notFound()
  }

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      createdByUser: {
        select: { name: true, email: true },
      },
      order: {
        select: { id: true, name: true },
      },
      history: {
        orderBy: { updatedAt: "desc" },
        take: 20,
        include: {
          updatedByUser: {
            select: { name: true, email: true },
          },
        },
      },
    },
  })

  if (!product) {
    notFound()
  }

  const isAdmin = session.user?.role === "ADMIN"
  const progressPct = Math.round((product.currentStep / TOTAL_STEPS) * 100)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Link href="/products" className="text-sm text-muted-foreground hover:underline">
            ← Back to products
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{product.name}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">Size {product.size}</Badge>
            {product.archived && (
              <Badge variant="outline" className="border-amber-500 text-amber-700 dark:text-amber-400">
                Archived
              </Badge>
            )}
            <span>
              Created by{" "}
              <span className="font-medium">
                {product.createdByUser?.name || product.createdByUser?.email}
              </span>
            </span>
          </div>
          <div className="pt-1">
            {product.order ? (
              <Card className="border-dashed bg-muted/30">
                <CardContent className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Part of order</p>
                    <p className="text-sm font-medium">{product.order.name}</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="w-full shrink-0 sm:w-auto">
                    <Link href={`/orders/${product.order.id}`}>View order</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <p className="text-xs text-muted-foreground">
                Not linked to an order (legacy or manual entry).
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isAdmin && (
            <ProductActions
              productId={product.id}
              productName={product.name}
              archived={product.archived}
            />
          )}
          <Badge variant={isAdmin ? "default" : "secondary"}>
            {isAdmin ? "Admin" : "Viewer"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          {product.photoUrl && (
            <Card>
              <CardContent className="p-3 sm:p-4">
                <ImagePreviewDialog
                  src={product.photoUrl}
                  alt={product.name}
                  title={`${product.name} — photo`}
                  className="aspect-video w-full max-h-96"
                  imgClassName="object-cover"
                  showHint
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>
                Step {product.currentStep} of {TOTAL_STEPS} · {progressPct}% complete
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-2 bg-primary"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Last updated {new Date(product.updatedAt).toLocaleString()}
              </div>
              {isAdmin && (
                <AdvanceStepForm id={product.id} currentStep={product.currentStep} />
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
            <CardDescription>Recent step updates and notes.</CardDescription>
          </CardHeader>
          <CardContent>
            {product.history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No history yet.</p>
            ) : (
              <ul className="space-y-4">
                {product.history.map((h) => (
                  <li key={h.id} className="rounded-md border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-sm">Step {h.stepNumber}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(h.updatedAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {h.notes}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      By {h.updatedByUser?.name || h.updatedByUser?.email}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <ProductComments productId={product.id} />
        </div>
      </div>
    </div>
  )
}
