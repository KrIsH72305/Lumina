import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('Demo@1234', 10)

  // 1. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lumina.com' },
    update: {},
    create: {
      email: 'admin@lumina.com',
      name: 'Admin User',
      passwordHash,
      role: 'ADMIN',
    },
  })

  // 2. Create Manager
  const manager = await prisma.user.upsert({
    where: { email: 'manager@lumina.com' },
    update: {},
    create: {
      email: 'manager@lumina.com',
      name: 'Manager User',
      passwordHash,
      role: 'MANAGER',
    },
  })

  // 3. Create Employee
  const employee = await prisma.user.upsert({
    where: { email: 'employee@lumina.com' },
    update: {},
    create: {
      email: 'employee@lumina.com',
      name: 'Employee User',
      passwordHash,
      role: 'EMPLOYEE',
      managerId: manager.id,
    },
  })

  // 4. Create Active Cycle
  const cycle = await prisma.cycle.upsert({
    where: { id: 'default-cycle' }, // Or let it auto-generate, but we need upsert
    update: {},
    create: {
      name: 'Phase 1 Goal Setting 2026',
      phase: 'GOAL_SETTING',
      windowOpen: new Date('2026-05-01T00:00:00Z'),
      windowClose: new Date('2026-05-31T23:59:59Z'),
      isActive: true,
    },
  })

  console.log({ admin, manager, employee, cycle })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
