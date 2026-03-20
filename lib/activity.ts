import { prisma } from "./prisma"

export async function logActivity(
  userId: string,
  action: string,
  entityType: string,
  entityId?: string | null,
  details?: string | null
) {
  await prisma.activityLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId: entityId ?? undefined,
      details: details ?? undefined,
    },
  })
}
