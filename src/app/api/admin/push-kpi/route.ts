import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const pushKpiSchema = z.object({
  title: z.string().min(5),
  thrustArea: z.string(),
  uomType: z.string(),
  target: z.number(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return new Response('Unauthorized', { status: 401 })
    }

    const json = await req.json()
    const { title, thrustArea, uomType, target } = pushKpiSchema.parse(json)

    // Get all employees
    const employees = await prisma.user.findMany({
      where: { role: 'EMPLOYEE' }
    })

    // Create a goal for each employee
    const goals = await Promise.all(
      employees.map((emp) => 
        prisma.goal.create({
          data: {
            employeeId: emp.id,
            title,
            thrustArea,
            uomType,
            target,
            weightage: 10, // Default weightage
            status: 'DRAFT',
            isShared: true,
          }
        })
      )
    )

    return new Response(JSON.stringify({ message: `KPI pushed to ${employees.length} employees`, count: employees.length }), { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ message: error.issues[0].message }), { status: 422 })
    }
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 })
  }
}
