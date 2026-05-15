import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const reviewSchema = z.object({
  employeeId: z.string(),
  action: z.enum(['APPROVE', 'REWORK']),
  reworkComment: z.string().optional(),
  goals: z.array(z.object({
    id: z.string(),
    target: z.number(),
    weightage: z.number(),
  }))
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN')) {
      return new Response('Unauthorized', { status: 401 })
    }

    const json = await req.json()
    const { employeeId, action, reworkComment, goals } = reviewSchema.parse(json)

    // Verify employee belongs to manager
    if (session.user.role === 'MANAGER') {
      const employee = await prisma.user.findUnique({
        where: { id: employeeId, managerId: session.user.id }
      })
      if (!employee) return new Response('Forbidden', { status: 403 })
    }

    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REWORK'
    const lockedAt = action === 'APPROVE' ? new Date() : null

    // Update goals in a transaction
    await prisma.$transaction(
      goals.map((g) =>
        prisma.goal.update({
          where: { id: g.id },
          data: {
            target: g.target,
            weightage: g.weightage,
            status: newStatus,
            lockedAt,
            // We could store reworkComment if we add it to the Goal model,
            // or log it to AuditLog. For simplicity in hackathon, we might just use AuditLog.
          },
        })
      )
    )

    if (action === 'REWORK' && reworkComment) {
      // Log the rework comment to the first goal for context, or AuditLog.
      // Since AuditLog requires a goalId, let's log to the first goal.
      if (goals.length > 0) {
        await prisma.auditLog.create({
          data: {
            goalId: goals[0].id,
            changedById: session.user.id,
            fieldChanged: 'STATUS_REWORK',
            newValue: reworkComment,
          }
        })
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ message: error.issues[0].message }), { status: 422 })
    }
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 })
  }
}
