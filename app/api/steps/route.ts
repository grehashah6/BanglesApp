import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const steps = await prisma.step.findMany({
    orderBy: { order: "asc" },
  })
  return NextResponse.json(steps)
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const updates: { stepNumber: number; estimatedDurationDays: number | null }[] =
    body?.steps ?? []

  for (const u of updates) {
    await prisma.step.update({
      where: { stepNumber: u.stepNumber },
      data: { estimatedDurationDays: u.estimatedDurationDays },
    })
  }

  const steps = await prisma.step.findMany({
    orderBy: { order: "asc" },
  })
  return NextResponse.json(steps)
}

