import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        createdByUser: {
          select: { name: true, email: true },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const products = await prisma.product.findMany({
      where: { orderId: order.id },
      include: {
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
      orderBy: { createdAt: "asc" },
    })

    // Group by product name so the UI can render "Products" sections.
    const groups = new Map<
      string,
      { id: string; designName: string; sizes: any[] }
    >()

    for (const p of products) {
      const key = p.name
      if (!groups.has(key)) {
        groups.set(key, { id: key, designName: key, sizes: [] })
      }
      groups.get(key)!.sizes.push({
        id: p.id, // UI selection uses this
        size: p.size,
        photoUrl: p.photoUrl,
        currentStep: p.currentStep,
        history: p.history,
      })
    }

    return NextResponse.json({
      id: order.id,
      name: order.name,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      createdByUser: order.createdByUser,
      items: Array.from(groups.values()).sort((a, b) =>
        a.designName.localeCompare(b.designName)
      ),
    })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    )
  }
}

