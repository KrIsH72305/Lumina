import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('Demo@1234', 10)

  // Clear existing data to avoid constraint/duplication conflicts
  await prisma.checkIn.deleteMany({})
  await prisma.auditLog.deleteMany({})
  await prisma.sharedGoalLink.deleteMany({})
  await prisma.portfolioShare.deleteMany({})
  await prisma.goal.deleteMany({})
  await prisma.oneOnOne.deleteMany({})
  await prisma.feedback.deleteMany({})
  await prisma.pip.deleteMany({})
  await prisma.talentRating.deleteMany({})
  await prisma.review.deleteMany({})
  await prisma.reviewCycle.deleteMany({})
  await prisma.cycle.deleteMany({})
  await prisma.user.deleteMany({})

  // 1. Create Users
  const manager = await prisma.user.create({
    data: {
      email: 'manager@lumina.com',
      name: 'Sarah Chen',
      passwordHash,
      role: 'MANAGER',
    },
  })

  const employee = await prisma.user.create({
    data: {
      email: 'employee@lumina.com',
      name: 'Alex Rivera',
      passwordHash,
      role: 'EMPLOYEE',
      managerId: manager.id,
    },
  })

  const pipUser = await prisma.user.create({
    data: {
      email: 'pip@lumina.com',
      name: 'Jordan Smith',
      passwordHash,
      role: 'EMPLOYEE',
      managerId: manager.id,
    },
  })

  const admin = await prisma.user.create({
    data: {
      email: 'admin@lumina.com',
      name: 'Devon Vance',
      passwordHash,
      role: 'ADMIN',
    },
  })

  // 2. Create Goals for Alex Rivera
  const goal1 = await prisma.goal.create({
    data: {
      employeeId: employee.id,
      thrustArea: 'Product Engineering',
      title: 'Implement Core Enterprise Integrations',
      description: 'Integrate Microsoft Entra ID for SSO and set up MS Teams adaptive card notifications.',
      uomType: 'NUMERIC_MAX',
      target: 100,
      weightage: 30,
      status: 'APPROVED',
    }
  })

  const goal2 = await prisma.goal.create({
    data: {
      employeeId: employee.id,
      thrustArea: 'Technical Debt',
      title: 'Optimize Dashboard Performance',
      description: 'Improve Lighthouse scores of Lumina by 20% and implement client-side caching.',
      uomType: 'NUMERIC_MAX',
      target: 90,
      weightage: 30,
      status: 'APPROVED',
    }
  })

  const goal3 = await prisma.goal.create({
    data: {
      employeeId: employee.id,
      thrustArea: 'Culture & Collaboration',
      title: 'Establish Continuous Feedback Engine',
      description: 'Roll out peer-to-peer feedback tool and achieve 80% team participation.',
      uomType: 'NUMERIC_MAX',
      target: 80,
      weightage: 20,
      status: 'APPROVED',
    }
  })

  const goal4 = await prisma.goal.create({
    data: {
      employeeId: employee.id,
      thrustArea: 'Design & UX',
      title: 'Redesign Nucleus Login Portal',
      description: 'Build clean, minimalist login aesthetic matching Lumina enterprise brand.',
      uomType: 'NUMERIC_MAX',
      target: 100,
      weightage: 20,
      status: 'PENDING_APPROVAL',
    }
  })

  // 3. Create Goals for Jordan Smith
  await prisma.goal.create({
    data: {
      employeeId: pipUser.id,
      thrustArea: 'Execution',
      title: 'Improve Sprint Delivery Consistency',
      description: 'Deliver at least 90% of committed sprint tasks on time.',
      uomType: 'NUMERIC_MAX',
      target: 100,
      weightage: 60,
      status: 'APPROVED',
    }
  })

  await prisma.goal.create({
    data: {
      employeeId: pipUser.id,
      thrustArea: 'Communication',
      title: 'Clear Stakeholder Communication Plan',
      description: 'Establish a weekly status reporting cadence with internal stakeholders.',
      uomType: 'NUMERIC_MAX',
      target: 100,
      weightage: 40,
      status: 'DRAFT',
    }
  })

  // 4. Create Check-Ins for Alex Rivera's goals
  await prisma.checkIn.createMany({
    data: [
      {
        goalId: goal1.id,
        quarter: 'Q1',
        actualAchievement: 80,
        progressScore: 80,
        goalStatus: 'ON_TRACK',
        managerComment: 'Solid early implementation steps.',
      },
      {
        goalId: goal1.id,
        quarter: 'Q2',
        actualAchievement: 100,
        progressScore: 100,
        goalStatus: 'COMPLETED',
        managerComment: 'Outstanding execution and deployment ahead of schedule.',
      },
      {
        goalId: goal2.id,
        quarter: 'Q1',
        actualAchievement: 75,
        progressScore: 83.3,
        goalStatus: 'ON_TRACK',
        managerComment: 'Good start. Lighthouse scores are climbing.',
      },
      {
        goalId: goal2.id,
        quarter: 'Q2',
        actualAchievement: 85,
        progressScore: 94.4,
        goalStatus: 'ON_TRACK',
        managerComment: 'Almost at target! Excellent optimization techniques used.',
      },
      {
        goalId: goal3.id,
        quarter: 'Q1',
        actualAchievement: 40,
        progressScore: 50,
        goalStatus: 'ON_TRACK',
        managerComment: 'Tool has been rolled out; now we need to drive adoption.',
      },
      {
        goalId: goal3.id,
        quarter: 'Q2',
        actualAchievement: 70,
        progressScore: 87.5,
        goalStatus: 'ON_TRACK',
        managerComment: 'Adoption rates are looking highly promising.',
      }
    ]
  })

  // 5. Create 1:1 Meetings
  const now = new Date()
  await prisma.oneOnOne.createMany({
    data: [
      {
        employeeId: employee.id,
        managerId: manager.id,
        date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // in 2 days
        talkingPoints: 'Review Q2 check-ins, discuss upcoming promo cycle, and check alignment on goals.',
        actionItems: 'Sarah to review login portal goal submission. Alex to draft promo package.',
      },
      {
        employeeId: employee.id,
        managerId: manager.id,
        date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        talkingPoints: 'Discuss blockers on the MS Teams integration and review team adoption rates.',
        actionItems: 'Alex to connect with enterprise architecture team regarding webhook permissions.',
      }
    ]
  })

  // 6. Create Feedback
  await prisma.feedback.createMany({
    data: [
      {
        fromUserId: manager.id,
        toUserId: employee.id,
        content: 'Alex has shown tremendous technical leadership on the enterprise integrations project. High caliber work!',
        visibility: 'PUBLIC',
      },
      {
        fromUserId: pipUser.id,
        toUserId: employee.id,
        content: 'Alex was incredibly helpful during the onboarding phase of our new developer. Patient and highly knowledgeable.',
        visibility: 'PUBLIC',
      }
    ]
  })

  // 7. Create Review Cycle & Reviews
  const reviewCycle = await prisma.reviewCycle.create({
    data: {
      name: '2024 Mid-Year Review',
      status: 'ACTIVE',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-06-30'),
    }
  })

  await prisma.review.create({
    data: {
      cycleId: reviewCycle.id,
      revieweeId: employee.id,
      reviewerId: employee.id,
      type: 'SELF',
      content: '',
      status: 'PENDING',
    }
  })

  // 8. Create Talent Rating (9-Box)
  await prisma.talentRating.create({
    data: {
      userId: employee.id,
      performance: 3, // High
      potential: 2,   // Medium
      managerComment: 'Alex is an exceptionally strong performer with great potential for technical leadership roles.'
    }
  })

  // 9. Create a PIP for Jordan Smith
  await prisma.pip.create({
    data: {
      userId: pipUser.id,
      title: 'Communication & Sprint Delivery Plan',
      description: 'Focus on timely sprint task completion and transparent stakeholder updates.',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      status: 'ACTIVE'
    }
  })

  // 10. Create Atomberg Quarterly Windows
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

  // Seed default Escalation Rules
  const defaultRules = [
    {
      id: 'rule-employee-goals-not-submitted',
      triggerType: 'EMPLOYEE_GOALS_NOT_SUBMITTED',
      nDays: 5,
      isActive: true,
    },
    {
      id: 'rule-manager-goals-not-approved',
      triggerType: 'MANAGER_GOALS_NOT_APPROVED',
      nDays: 3,
      isActive: true,
    },
    {
      id: 'rule-quarterly-checkin-not-completed',
      triggerType: 'QUARTERLY_CHECKIN_NOT_COMPLETED',
      nDays: 7,
      isActive: true,
    },
  ]

  for (const r of defaultRules) {
    await prisma.escalationRule.upsert({
      where: { id: r.id },
      update: { nDays: r.nDays, isActive: r.isActive },
      create: r,
    })
  }

  console.log('Extended seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
