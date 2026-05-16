const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Testing connection to Supabase...')
  try {
    const users = await prisma.user.findMany()
    console.log('Success! Found', users.length, 'users.')
  } catch (err) {
    console.error('Connection failed:', err.message)
  }
}

main().finally(() => prisma.$disconnect())
