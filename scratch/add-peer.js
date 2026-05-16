const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const manager = await prisma.user.findUnique({
    where: { email: 'manager@goalflow.com' }
  })
  if (manager) {
    await prisma.user.upsert({
      where: { email: 'peer@goalflow.com' },
      update: {},
      create: {
        email: 'peer@goalflow.com',
        name: 'Jordan Rivera',
        passwordHash: 'dummy',
        role: 'EMPLOYEE',
        managerId: manager.id
      }
    })
    console.log('Peer added for goalflow')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
