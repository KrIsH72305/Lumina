const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany()
  
  for (const user of users) {
    if (user.email.includes('@goalflow.com')) {
      const newEmail = user.email.replace('@goalflow.com', '@lumina.com')
      await prisma.user.update({
        where: { id: user.id },
        data: { email: newEmail }
      })
      console.log(`Updated ${user.email} -> ${newEmail}`)
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
