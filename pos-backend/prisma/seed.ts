import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // 1. Hash the passwords securely
  const adminPassword = await bcrypt.hash('admin123', 10)
  const cashierPassword = await bcrypt.hash('cashier123', 10)

  // 2. Create Admin (Upsert = Create if not exists, Update if it does)
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {}, // If exists, do nothing
    create: {
      username: 'admin',
      password_hash: adminPassword,
      role: 'admin',
    },
  })

  // 3. Create Cashier
  const cashier = await prisma.user.upsert({
    where: { username: 'cashier' },
    update: {},
    create: {
      username: 'cashier',
      password_hash: cashierPassword,
      role: 'cashier',
    },
  })

  console.log('✅ Seed successful!')
  console.log({ admin, cashier })
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