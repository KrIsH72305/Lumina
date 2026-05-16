const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const manager = await prisma.user.findUnique({
    where: { email: 'manager@lumina.com' }
  })
  
  if (manager) {
    const peers = [
      { email: 'jordan@lumina.com', name: 'Jordan Rivera' },
      { email: 'casey@lumina.com', name: 'Casey Morgan' },
      { email: 'taylor@lumina.com', name: 'Taylor Swift' }
    ]
    
    for (const p of peers) {
      await prisma.user.upsert({
        where: { email: p.email },
        update: {},
        create: {
          ...p,
          passwordHash: 'dummy',
          role: 'EMPLOYEE',
          managerId: manager.id
        }
      })
    }
    console.log('Added 3 more peers for manager@lumina.com')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
