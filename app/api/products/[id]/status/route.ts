import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateStatusSchema = z.object({
  stepNumber: z.number().int().min(1).max(7),
  notes: z.string().optional(),
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
    const { stepNumber, notes } = updateStatusSchema.parse(body)

    const product = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Verify step exists
    const step = await prisma.step.findUnique({
      where: { stepNumber },
    })

    if (!step) {
      return NextResponse.json(
        { error: "Invalid step number" },
        { status: 400 }
      )
    }

    // Update product step
    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: { currentStep: stepNumber },
      include: {
        createdByUser: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Create history entry
    await prisma.productHistory.create({
      data: {
        productId: product.id,
        stepNumber,
        updatedBy: session.user.id,
        notes: notes || `Moved to step ${stepNumber}: ${step.stepName}`,
      },
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error updating product status:", error)
    return NextResponse.json(
      { error: "Failed to update product status" },
      { status: 500 }
    )
  }
}

