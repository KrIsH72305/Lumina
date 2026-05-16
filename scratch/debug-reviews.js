const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'employee@lumina.com' } })
  console.log('User:', user?.id)
  
  const reviews = await prisma.review.findMany({
    where: { reviewerId: user?.id }
  })
  console.log('Reviews:', reviews.map(r => r.id))
}

main().finally(() => prisma.$disconnect())
