import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { logActivity } from "@/lib/activity"

const bulkSchema = z.object({
  sizeIds: z.array(z.string().min(1)).min(1).max(500),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { sizeIds } = bulkSchema.parse(body)

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      select: { id: true, name: true },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const products = await prisma.product.findMany({
      where: {
        id: { in: sizeIds },
        orderId: params.id,
      },
    })

    const steps = await prisma.step.findMany({
      where: { stepNumber: { gte: 1, lte: 11 } },
      orderBy: { order: "asc" },
    })
    const stepMap = new Map(steps.map((s) => [s.stepNumber, s]))

    const results: { id: string; success: boolean; error?: string }[] = []

    for (const p of products) {
      const nextStep = Math.min(p.currentStep + 1, 11)
      if (p.currentStep >= 11) {
        results.push({ id: p.id, success: false, error: "Already at step 11" })
        continue
      }
      const step = stepMap.get(nextStep)
      if (!step) {
        results.push({ id: p.id, success: false, error: "Invalid step" })
        continue
      }
      try {
        await prisma.product.update({
          where: { id: p.id },
          data: { currentStep: nextStep },
        })

        await prisma.productHistory.create({
          data: {
            productId: p.id,
            stepNumber: nextStep,
            updatedBy: session.user.id,
            notes: `Bulk advance to step ${nextStep}: ${step.stepName}`,
          },
        })
        await logActivity(
          session.user.id,
          "bulk_advance_items",
          "OrderItemSize",
          p.id,
          `Order ${order.name} – ${p.name} size ${p.size} → step ${nextStep}`
        )
        results.push({ id: p.id, success: true })
      } catch {
        results.push({ id: p.id, success: false, error: "Update failed" })
      }
    }

    return NextResponse.json({
      updated: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Order bulk status error:", error)
    return NextResponse.json(
      { error: "Failed to bulk update order items" },
      { status: 500 }
    )
  }
}

