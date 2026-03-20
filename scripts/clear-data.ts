import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Clearing all data...")

  await prisma.activityLog.deleteMany({})
  console.log("  Cleared ActivityLog")

  await prisma.orderItemSizeComment.deleteMany({})
  console.log("  Cleared OrderItemSizeComment")

  await prisma.orderItemSizeHistory.deleteMany({})
  console.log("  Cleared OrderItemSizeHistory")

  await prisma.orderItemSize.deleteMany({})
  console.log("  Cleared OrderItemSize")

  await prisma.orderItem.deleteMany({})
  console.log("  Cleared OrderItem")

  await prisma.order.deleteMany({})
  console.log("  Cleared Order")

  await prisma.productComment.deleteMany({})
  console.log("  Cleared ProductComment")

  await prisma.productHistory.deleteMany({})
  console.log("  Cleared ProductHistory")

  await prisma.product.deleteMany({})
  console.log("  Cleared Product")

  await prisma.step.deleteMany({})
  console.log("  Cleared Step")

  await prisma.user.deleteMany({})
  console.log("  Cleared User")

  console.log("Done. Run `npm run db:seed` to restore steps, then `npm run create-user <email> <password> ADMIN` to create an admin user.")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
