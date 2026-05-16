import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { isWindowOpen } from '@/lib/cycles'

const goalSchema = z.object({
  title: z.string().min(5),
  description: z.string().optional(),
  thrustArea: z.string().min(1),
  uomType: z.string().min(1),
  target: z.number().min(0),
  weightage: z.number().min(10).max(100),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'EMPLOYEE') {
      return new Response('Unauthorized', { status: 401 })
    }

    // Check if Goal Setting window is open
    const canEdit = await isWindowOpen('GOAL_SETTING')
    if (!canEdit) {
      return new Response(JSON.stringify({ message: 'Goal setting window is currently closed.' }), { status: 403 })
    }

    const json = await req.json()
    const body = goalSchema.parse(json)

    // Check existing weightage and limits
    const existingGoals = await prisma.goal.findMany({
      where: { employeeId: session.user.id },
    })

    if (existingGoals.length >= 8) {
      return new Response(JSON.stringify({ message: 'Maximum of 8 goals allowed' }), { status: 400 })
    }

    const currentWeightage = existingGoals.reduce((sum, g) => sum + g.weightage, 0)
    if (currentWeightage + body.weightage > 100) {
      return new Response(JSON.stringify({ message: 'Total weightage cannot exceed 100%' }), { status: 400 })
    }

    const goal = await prisma.goal.create({
      data: {
        employeeId: session.user.id,
        title: body.title,
        description: body.description,
        thrustArea: body.thrustArea,
        uomType: body.uomType,
        target: body.target,
        weightage: body.weightage,
        status: 'DRAFT',
      },
    })

    return new Response(JSON.stringify(goal), { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ message: error.issues[0].message }), { status: 422 })
    }
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'EMPLOYEE') {
      return new Response('Unauthorized', { status: 401 })
    }

    const goals = await prisma.goal.findMany({
      where: { employeeId: session.user.id },
    })

    if (goals.length === 0) {
      return new Response(JSON.stringify({ message: 'You have no goals to submit' }), { status: 400 })
    }

    // Validation 1: Total weightage must be exactly 100%
    const totalWeightage = goals.reduce((sum, g) => sum + g.weightage, 0)
    if (totalWeightage !== 100) {
      return new Response(JSON.stringify({ message: `Total weightage must be exactly 100%. Current total: ${totalWeightage}%` }), { status: 400 })
    }

    // Validation 2: Min weightage per goal (handled at creation, but good to double check)
    const hasSmallGoal = goals.some(g => g.weightage < 10)
    if (hasSmallGoal) {
      return new Response(JSON.stringify({ message: 'All goals must have at least 10% weightage' }), { status: 400 })
    }

    // Validation 3: Max goals (handled at creation)
    if (goals.length > 8) {
      return new Response(JSON.stringify({ message: 'Maximum of 8 goals allowed' }), { status: 400 })
    }

    // Update all DRAFT or REWORK goals to PENDING_APPROVAL
    await prisma.goal.updateMany({
      where: { 
        employeeId: session.user.id,
        status: { in: ['DRAFT', 'REWORK'] }
      },
      data: { status: 'PENDING_APPROVAL' },
    })

    // Fetch manager details to notify
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { manager: true }
    })

    if (user?.manager) {
      const { notifyManagerOfSubmission } = await import('@/lib/notifications')
      await notifyManagerOfSubmission(user.name, user.manager.email, user.manager.name, user.id)
    }

    return new Response(JSON.stringify({ message: 'Goal sheet submitted for approval' }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 })
  }
}

