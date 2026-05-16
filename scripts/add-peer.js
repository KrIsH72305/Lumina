const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const manager = await prisma.user.findUnique({
    where: { email: 'manager@lumina.com' }
  })
  if (manager) {
    await prisma.user.upsert({
      where: { email: 'peer@lumina.com' },
      update: {},
      create: {
        email: 'peer@lumina.com',
        name: 'Jordan Rivera',
        passwordHash: 'dummy',
        role: 'EMPLOYEE',
        managerId: manager.id
      }
    })
    console.log('Peer added for lumina')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
