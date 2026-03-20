import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"
const TOTAL_STEPS = 11

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [products, steps, historyForTime] = await Promise.all([
      prisma.product.findMany({
        where: { archived: false },
        select: { id: true, currentStep: true, updatedAt: true },
      }),
      prisma.step.findMany({
        orderBy: { order: "asc" },
        select: {
          stepNumber: true,
          stepName: true,
          estimatedDurationDays: true,
        },
      }),
      prisma.productHistory.findMany({
        orderBy: { updatedAt: "asc" },
        select: { productId: true, stepNumber: true, updatedAt: true },
      }),
    ])

    const totalProducts = products.length
    const completedCount = products.filter((p) => p.currentStep >= TOTAL_STEPS).length
    const completionRate =
      totalProducts > 0 ? Math.round((completedCount / totalProducts) * 100) : 0

    const productsPerStep = Array.from({ length: TOTAL_STEPS }, (_, i) => {
      const stepNum = i + 1
      const count = products.filter((p) => p.currentStep === stepNum).length
      const step = steps.find((s) => s.stepNumber === stepNum)
      return {
        stepNumber: stepNum,
        stepName: step?.stepName ?? `Step ${stepNum}`,
        count,
      }
    })

    const stepDurationMap = new Map(
      steps.map((s) => [s.stepNumber, s.estimatedDurationDays ?? 0])
    )

    let overdueCount = 0
    for (const p of products) {
      if (p.currentStep >= TOTAL_STEPS) continue
      let remainingDays = 0
      for (let n = p.currentStep + 1; n <= TOTAL_STEPS; n++) {
        remainingDays += stepDurationMap.get(n) ?? 0
      }
      if (remainingDays <= 0) continue
      const reachedAt = new Date(p.updatedAt)
      const eta = new Date(
        reachedAt.getTime() + remainingDays * 24 * 60 * 60 * 1000
      )
      if (eta < new Date()) overdueCount++
    }

    const stepDurations: { stepNumber: number; avgDays: number; count: number }[] = []
    for (let stepNum = 1; stepNum < TOTAL_STEPS; stepNum++) {
      const entries = historyForTime.filter((h) => h.stepNumber === stepNum + 1)
      if (entries.length === 0) continue
      const productIds = new Set(entries.map((e) => e.productId))
      const times: number[] = []
      for (const pid of productIds) {
        const entered = historyForTime
          .filter((e) => e.productId === pid && e.stepNumber === stepNum)
          .pop()
        const left = entries.find((e) => e.productId === pid)
        if (entered && left) {
          const days =
            (new Date(left.updatedAt).getTime() -
              new Date(entered.updatedAt).getTime()) /
            (24 * 60 * 60 * 1000)
          if (days >= 0 && days < 365) times.push(days)
        }
      }
      if (times.length > 0) {
        const avgDays =
          times.reduce((a, b) => a + b, 0) / times.length
        const step = steps.find((s) => s.stepNumber === stepNum)
        stepDurations.push({
          stepNumber: stepNum,
          avgDays: Math.round(avgDays * 10) / 10,
          count: times.length,
        })
      }
    }

    return NextResponse.json({
      totalProducts,
      completionRate,
      completedCount,
      productsPerStep,
      overdueCount,
      averageTimePerStep: stepDurations,
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500 }
    )
  }
}
