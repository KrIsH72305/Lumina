const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('Demo@1234', 10)
  console.log('Starting Mega Seed...')

  // 1. Users
  const manager = await prisma.user.upsert({
    where: { email: 'manager@lumina.com' },
    update: {},
    create: { email: 'manager@lumina.com', name: 'Sarah Chen', passwordHash, role: 'MANAGER' }
  })

  const employee = await prisma.user.upsert({
    where: { email: 'employee@lumina.com' },
    update: {},
    create: { email: 'employee@lumina.com', name: 'Alex Rivera', passwordHash, role: 'EMPLOYEE', managerId: manager.id }
  })

  const peer1 = await prisma.user.upsert({
    where: { email: 'jordan@lumina.com' },
    update: {},
    create: { email: 'jordan@lumina.com', name: 'Jordan Rivera', passwordHash, role: 'EMPLOYEE', managerId: manager.id }
  })

  const peer2 = await prisma.user.upsert({
    where: { email: 'casey@lumina.com' },
    update: {},
    create: { email: 'casey@lumina.com', name: 'Casey Morgan', passwordHash, role: 'EMPLOYEE', managerId: manager.id }
  })

  // 2. Goals & Check-ins for Alex
  const goal1 = await prisma.goal.create({
    data: {
      employeeId: employee.id,
      title: 'Launch Lumina v2.0 Platform',
      description: 'Complete the full UI refactor and core features for the new HR suite.',
      thrustArea: 'Product Excellence',
      weightage: 40,
      status: 'APPROVED',
      uomType: 'TIMELINE',
      target: 100
    }
  })

  await prisma.checkIn.createMany({
    data: [
      { goalId: goal1.id, quarter: 'Q1', goalStatus: 'ON_TRACK', actualAchievement: 30, managerComment: 'Completed the core navigation and layout.' },
      { goalId: goal1.id, quarter: 'Q2', goalStatus: 'ON_TRACK', actualAchievement: 70, managerComment: 'Refactored all performance modules to premium light mode.' }
    ]
  })

  const goal2 = await prisma.goal.create({
    data: {
      employeeId: employee.id,
      title: 'Increase Platform Performance by 20%',
      description: 'Optimize database queries and asset loading times.',
      thrustArea: 'Engineering Quality',
      weightage: 30,
      status: 'APPROVED',
      uomType: 'NUMERIC_MAX',
      target: 20
    }
  })

  // 3. 1:1 Meetings
  await prisma.oneOnOne.createMany({
    data: [
      { employeeId: employee.id, managerId: manager.id, date: new Date(), talkingPoints: 'Discussed career growth and project milestones.' },
      { employeeId: employee.id, managerId: manager.id, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), talkingPoints: 'Reviewed Lumina UI refactor progress.' }
    ]
  })

  // 4. Feedback
  await prisma.feedback.createMany({
    data: [
      { fromUserId: peer1.id, toUserId: employee.id, content: 'Alex did an incredible job on the new 9-box grid. Very intuitive!', visibility: 'PUBLIC' },
      { fromUserId: manager.id, toUserId: employee.id, content: 'Great leadership on the UI overhaul. The team is impressed.', visibility: 'PUBLIC' }
    ]
  })

  // 5. Review Cycles & Reviews
  const cycle = await prisma.reviewCycle.create({
    data: { name: '2024 Annual Performance Cycle', status: 'ACTIVE', startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
  })

  await prisma.review.createMany({
    data: [
      { cycleId: cycle.id, revieweeId: employee.id, reviewerId: employee.id, type: 'SELF', status: 'PENDING', content: '' },
      { cycleId: cycle.id, revieweeId: employee.id, reviewerId: manager.id, type: 'MANAGER', status: 'PENDING', content: '' },
      { cycleId: cycle.id, revieweeId: peer1.id, reviewerId: employee.id, type: 'PEER', status: 'PENDING', content: '' }
    ]
  })

  // 6. Talent Ratings (for 9-box)
  await prisma.talentRating.createMany({
    data: [
      { userId: employee.id, performance: 3, potential: 3, managerComment: 'Star player. Ready for promotion.' },
      { userId: peer1.id, performance: 2, potential: 3, managerComment: 'High potential, needs more project ownership.' },
      { userId: peer2.id, performance: 3, potential: 1, managerComment: 'Solid performer, content in current role.' }
    ]
  })

  // 7. PIPs
  await prisma.pip.create({
    data: {
      userId: peer2.id,
      title: 'Documentation & Communication Plan',
      description: 'Improve technical documentation and team updates.',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    }
  })

  console.log('Mega Seed completed successfully!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
