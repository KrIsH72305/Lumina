import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const checkInSchema = z.object({
  goalId: z.string(),
  quarter: z.string(),
  actualAchievement: z.number(),
  goalStatus: z.string(),
})

function calculateProgressScore(uomType: string, target: number, actual: number): number {
  let score = 0
  
  if (uomType === 'NUMERIC_MAX') {
    // Higher is better (Min in Atomberg table)
    if (target === 0) return actual > 0 ? 100 : 0
    score = (actual / target) * 100
  } else if (uomType === 'NUMERIC_MIN') {
    // Lower is better (Max in Atomberg table)
    if (actual === 0) return 100 // Target met perfectly if actual is 0 (e.g. 0 accidents)
    score = (target / actual) * 100
  } else if (uomType === 'ZERO') {
    // Zero = Success (e.g. Safety incidents)
    score = actual === 0 ? 100 : 0
  } else if (uomType === 'TIMELINE') {
    // Date-based completion
    // For demo purposes, we treat target as a completion flag (1 = Done on time, 0 = Not)
    // Or if target is a number of days, actual is days taken.
    score = actual <= target ? 100 : 0
  } else {
    score = (actual / target) * 100
  }

  // Cap at 100% for the "Score" but allow achievement to be recorded as higher
  // Actually, some systems allow > 100% (extra points). 
  // Atomberg requirement doesn't specify cap, but usually it's capped at 100% for progress tracking.
  return Math.max(Math.round(score), 0)
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'EMPLOYEE') {
      return new Response('Unauthorized', { status: 401 })
    }

    const json = await req.json()
    const { goalId, quarter, actualAchievement, goalStatus } = checkInSchema.parse(json)

    const goal = await prisma.goal.findUnique({
      where: { id: goalId, employeeId: session.user.id }
    })

    if (!goal || goal.status !== 'APPROVED') {
      return new Response('Goal not found or not approved', { status: 404 })
    }

    const progressScore = calculateProgressScore(goal.uomType, goal.target, actualAchievement)

    // Upsert check-in
    const checkIn = await prisma.checkIn.upsert({
      where: {
        goalId_quarter: {
          goalId,
          quarter,
        }
      },
      update: {
        actualAchievement,
        progressScore,
        goalStatus,
      },
      create: {
        goalId,
        quarter,
        actualAchievement,
        progressScore,
        goalStatus,
      }
    })

    return new Response(JSON.stringify(checkIn), { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ message: error.issues[0].message }), { status: 422 })
    }
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 })
  }
}
