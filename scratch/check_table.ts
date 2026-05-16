import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  try {
    const count = await prisma.notificationLog.count()
    console.log(`Table exists! Current logs: ${count}`)
  } catch (e) {
    console.log(`Table does not exist or error: ${e.message}`)
  }
}
main()
