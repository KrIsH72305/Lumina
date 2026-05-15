import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

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
