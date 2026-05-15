import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'EMPLOYEE') {
      return new Response('Unauthorized', { status: 401 })
    }

    // Check if an active link already exists
    const existingLink = await prisma.sharedGoalLink.findFirst({
      where: { employeeId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })

    if (existingLink) {
      return new Response(JSON.stringify({ token: existingLink.token }), { status: 200 })
    }

    // Create a new link
    const token = randomBytes(16).toString('hex')
    
    const newLink = await prisma.sharedGoalLink.create({
      data: {
        employeeId: session.user.id,
        token: token,
      }
    })

    return new Response(JSON.stringify({ token: newLink.token }), { status: 201 })
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 })
  }
}
