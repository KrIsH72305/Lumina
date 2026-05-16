import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }

    const goals = await prisma.goal.findMany({
      where: { employeeId: session.user.id },
      include: {
        checkIns: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Create CSV header
    let csv = 'Goal Title,Thrust Area,UoM Type,Weightage,Target,Actual Achievement,Progress Score,Status\n'

    // Add rows
    goals.forEach(goal => {
      // Get most recent check-in (e.g. Q1)
      const lastCheckIn = goal.checkIns[0] // Since we only have Q1 for now
      
      const row = [
        `"${goal.title}"`,
        `"${goal.thrustArea}"`,
        `"${goal.uomType}"`,
        `${goal.weightage}%`,
        `${goal.target}`,
        `${lastCheckIn ? lastCheckIn.actualAchievement : '0'}`,
        `${lastCheckIn ? lastCheckIn.progressScore : '0'}%`,
        `"${goal.status}"`,
      ].join(',')
      
      csv += row + '\n'
    })

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=achievement_report_${session.user.name.replace(/\s+/g, '_').toLowerCase()}.csv`,
      },
    })
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 })
  }
}
