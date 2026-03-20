import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  size: z.string().min(1, "Size is required"),
  photoUrl: z.string().optional(),
  currentStep: z.number().int().min(1).max(11).default(1),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search") || ""
    const step = searchParams.get("step")
    const includeArchived = searchParams.get("archived") === "true"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

    const where: any = {}
    if (!includeArchived) {
      where.archived = false
    }
    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive" as const,
      }
    }
    if (step) {
      where.currentStep = parseInt(step)
    }

    // Products should be order-linked only. This keeps the UI order-centric:
    // users create sizes via Orders, and those appear in Products.
    where.orderId = { not: null }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          createdByUser: {
            select: {
              name: true,
              email: true,
            },
          },
          order: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = productSchema.parse(body)

    const product = await prisma.product.create({
      data: {
        ...validatedData,
        createdBy: session.user.id,
      },
      include: {
        createdByUser: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    await prisma.productHistory.create({
      data: {
        productId: product.id,
        stepNumber: product.currentStep,
        updatedBy: session.user.id,
        notes: "Product created",
      },
    })

    const { logActivity } = await import("@/lib/activity")
    await logActivity(
      session.user.id,
      "create",
      "Product",
      product.id,
      product.name
    )

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error creating product:", error)
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    )
  }
}

