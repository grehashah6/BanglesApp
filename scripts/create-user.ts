import { PrismaClient, UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length < 3) {
    console.error("Usage: tsx scripts/create-user.ts <email> <password> <role> [name]")
    console.error("Role must be either 'ADMIN' or 'USER'")
    process.exit(1)
  }

  const [email, password, role, name] = args

  if (role !== "ADMIN" && role !== "USER") {
    console.error("Role must be either 'ADMIN' or 'USER'")
    process.exit(1)
  }

  const normalizedEmail = String(email).toLowerCase()
  const effectiveRole =
    normalizedEmail === "admin@example.com" ? "ADMIN" : role

  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: effectiveRole as UserRole,
        name: name || undefined,
      },
    })

    console.log(`✅ User created successfully!`)
    console.log(`Email: ${user.email}`)
    console.log(`Role: ${user.role}`)
    console.log(`ID: ${user.id}`)
  } catch (error: any) {
    if (error.code === "P2002") {
      console.error("❌ Error: User with this email already exists")
    } else {
      console.error("❌ Error creating user:", error.message)
    }
    process.exit(1)
  }
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

