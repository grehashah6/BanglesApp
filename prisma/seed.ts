import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const defaultSteps = [
  { stepNumber: 1, stepName: "Raw Material", description: "Initial raw material stage", order: 1 },
  { stepNumber: 2, stepName: "Material Preparation", description: "Preparing materials for processing", order: 2 },
  { stepNumber: 3, stepName: "Shaping", description: "Shaping the bangle", order: 3 },
  { stepNumber: 4, stepName: "Polishing", description: "Polishing the bangle", order: 4 },
  { stepNumber: 5, stepName: "Decoration", description: "Adding decorative elements", order: 5 },
  { stepNumber: 6, stepName: "Quality Check", description: "Quality assurance check", order: 6 },
  { stepNumber: 7, stepName: "Finished Product", description: "Final product ready", order: 7 },
]

async function main() {
  console.log("Seeding database...")

  // Create default steps
  for (const step of defaultSteps) {
    await prisma.step.upsert({
      where: { stepNumber: step.stepNumber },
      update: {},
      create: step,
    })
  }

  console.log("Seeded default manufacturing steps")
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

