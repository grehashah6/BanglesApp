import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { logActivity } from "@/lib/activity"

const createOrderSchema = z.object({
  name: z.string().min(1, "Order name is required"),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        // Accept both names so UI/business can call it "product"
        designName: z.string().min(1).optional(),
        productName: z.string().min(1).optional(),
        sizes: z
          .array(
            z.object({
              size: z.string().min(1, "Size is required"),
              photoUrl: z.string().optional(),
            })
          )
          .min(1, "At least one size is required"),
      })
    )
    .min(1, "At least one product is required"),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)
    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive" as const,
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.order.count({ where }),
    ])

    const orderIds = orders.map((o) => o.id)
    const products = orderIds.length
      ? await prisma.product.findMany({
          where: { orderId: { in: orderIds } },
          select: { id: true, name: true, size: true, currentStep: true, orderId: true },
        })
      : []

    const byOrder = new Map<string, typeof products>()
    for (const p of products) {
      const arr = byOrder.get(p.orderId as string) ?? []
      arr.push(p)
      byOrder.set(p.orderId as string, arr)
    }

    const summarized = orders.map((o) => {
      const ps = byOrder.get(o.id) ?? []
      const productNames = Array.from(new Set(ps.map((p) => p.name)))
      const sizes = Array.from(new Set(ps.map((p) => p.size))).sort()
      const stepsSummary: Record<number, number> = {}

      for (const p of ps) {
        stepsSummary[p.currentStep] = (stepsSummary[p.currentStep] || 0) + 1
      }

      return {
        id: o.id,
        name: o.name,
        notes: o.notes,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
        totalItems: productNames.length,
        totalSizes: ps.length,
        sizes,
        stepsSummary,
      }
    })

    return NextResponse.json({
      orders: summarized,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
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
    const data = createOrderSchema.parse(body)

    const normalizedItems = data.items.map((it) => {
      const name = it.productName ?? it.designName
      if (!name) {
        throw new z.ZodError([
          {
            code: "custom",
            message: "Product name is required",
            path: ["items"],
          } as any,
        ])
      }
      return { name, sizes: it.sizes }
    })

    // Create order + products (one Product per entered size).
    const order = await prisma.order.create({
      data: {
        name: data.name,
        notes: data.notes ?? null,
        createdBy: session.user.id,
      },
      select: { id: true, name: true },
    })

    const productInputs = normalizedItems.flatMap((it) =>
      it.sizes.map((s) => ({
        name: it.name,
        size: s.size,
        photoUrl: s.photoUrl ?? undefined,
        currentStep: 1,
      }))
    )

    const products = await Promise.all(
      productInputs.map((p) =>
        prisma.product.create({
          data: {
            name: p.name,
            size: p.size,
            photoUrl: p.photoUrl,
            currentStep: p.currentStep,
            createdBy: session.user.id,
            orderId: order.id,
          },
          select: { id: true, currentStep: true, name: true, size: true },
        })
      )
    )

    await Promise.all(
      products.map((p) =>
        prisma.productHistory.create({
          data: {
            productId: p.id,
            stepNumber: p.currentStep,
            updatedBy: session.user.id,
            notes: "Order size created",
          },
        })
      )
    )

    await logActivity(
      session.user.id,
      "create_order",
      "Order",
      order.id,
      order.name
    )

    return NextResponse.json({ message: "Order created", orderId: order.id }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error creating order:", error)
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    )
  }
}

