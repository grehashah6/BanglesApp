import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { logActivity } from "@/lib/activity"

const bulkSchema = z.object({
  productIds: z.array(z.string().min(1)).min(1).max(100),
})

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { productIds } = bulkSchema.parse(body)

    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, archived: false },
      include: {
        createdByUser: { select: { name: true, email: true } },
      },
    })

    const steps = await prisma.step.findMany({
      where: { stepNumber: { gte: 1, lte: 11 } },
      orderBy: { order: "asc" },
    })
    const stepMap = new Map(steps.map((s) => [s.stepNumber, s]))

    const results: { id: string; success: boolean; error?: string }[] = []
    for (const product of products) {
      const nextStep = Math.min(product.currentStep + 1, 11)
      if (product.currentStep >= 11) {
        results.push({ id: product.id, success: false, error: "Already at step 11" })
        continue
      }
      const step = stepMap.get(nextStep)
      if (!step) {
        results.push({ id: product.id, success: false, error: "Invalid step" })
        continue
      }
      try {
        await prisma.product.update({
          where: { id: product.id },
          data: { currentStep: nextStep },
        })
        await prisma.productHistory.create({
          data: {
            productId: product.id,
            stepNumber: nextStep,
            updatedBy: session.user.id,
            notes: `Bulk advance to step ${nextStep}: ${step.stepName}`,
          },
        })
        await logActivity(
          session.user.id,
          "advance_step",
          "Product",
          product.id,
          `${product.name} → step ${nextStep} (bulk)`
        )
        results.push({ id: product.id, success: true })
      } catch {
        results.push({ id: product.id, success: false, error: "Update failed" })
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
    console.error("Bulk status error:", error)
    return NextResponse.json(
      { error: "Failed to bulk update" },
      { status: 500 }
    )
  }
}
