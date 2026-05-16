import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('Demo@1234', 10)

  // 1. Create Users
  const manager = await prisma.user.upsert({
    where: { email: 'manager@lumina.com' },
    update: {},
    create: {
      email: 'manager@lumina.com',
      name: 'Sarah Chen',
      passwordHash,
      role: 'MANAGER',
    },
  })

  const employee = await prisma.user.upsert({
    where: { email: 'employee@lumina.com' },
    update: {},
    create: {
      email: 'employee@lumina.com',
      name: 'Alex Rivera',
      passwordHash,
      role: 'EMPLOYEE',
      managerId: manager.id,
    },
  })

  // 2. Create Review Cycle
  const reviewCycle = await prisma.reviewCycle.create({
    data: {
      name: '2024 Mid-Year Review',
      status: 'ACTIVE',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-06-30'),
    }
  })

  // 3. Create Sample Reviews
  await prisma.review.create({
    data: {
      cycleId: reviewCycle.id,
      revieweeId: employee.id,
      reviewerId: employee.id,
      type: 'SELF',
      content: JSON.stringify({
        strengths: "Great progress on the Lumina project.",
        improvements: "Need to focus more on documentation."
      }),
      status: 'SUBMITTED',
      score: 4.5
    }
  })

  // 4. Create Talent Rating (9-Box)
  await prisma.talentRating.create({
    data: {
      userId: employee.id,
      performance: 3, // High
      potential: 2,   // Medium
      managerComment: "Alex is a high performer with potential for leadership roles."
    }
  })

  // 5. Create a PIP for another user (let's create a new one)
  const pipUser = await prisma.user.upsert({
    where: { email: 'pip@lumina.com' },
    update: {},
    create: {
      email: 'pip@lumina.com',
      name: 'Jordan Smith',
      passwordHash,
      role: 'EMPLOYEE',
      managerId: manager.id,
    },
  })

  await prisma.pip.create({
    data: {
      userId: pipUser.id,
      title: 'Communication Improvement Plan',
      description: 'Focus on timely updates and stakeholder communication.',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      status: 'ACTIVE'
    }
  })

  // 6. Create Atomberg Quarterly Windows
  const year = new Date().getFullYear()
  
  const cycles = [
    {
      name: `Goal Setting ${year}`,
      phase: 'GOAL_SETTING',
      windowOpen: new Date(`${year}-05-01`),
      windowClose: new Date(`${year}-06-30`),
      isActive: true,
    },
    {
      name: `Q1 Check-in ${year}`,
      phase: 'CHECK_IN_Q1',
      windowOpen: new Date(`${year}-07-01`),
      windowClose: new Date(`${year}-08-31`),
      isActive: true,
    },
    {
      name: `Q2 Check-in ${year}`,
      phase: 'CHECK_IN_Q2',
      windowOpen: new Date(`${year}-10-01`),
      windowClose: new Date(`${year}-11-30`),
      isActive: true,
    },
    {
      name: `Q3 Check-in ${year+1}`,
      phase: 'CHECK_IN_Q3',
      windowOpen: new Date(`${year+1}-01-01`),
      windowClose: new Date(`${year+1}-02-28`),
      isActive: true,
    },
    {
      name: `Q4 Annual ${year+1}`,
      phase: 'CHECK_IN_Q4',
      windowOpen: new Date(`${year+1}-03-01`),
      windowClose: new Date(`${year+1}-04-30`),
      isActive: true,
    },
  ]

  for (const c of cycles) {
    await prisma.cycle.upsert({
      where: { id: `cycle-${c.phase}-${year}` },
      update: c,
      create: { id: `cycle-${c.phase}-${year}`, ...c },
    })
  }

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
