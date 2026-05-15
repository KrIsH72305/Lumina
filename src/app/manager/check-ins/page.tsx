import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function ManagerCheckInsPage() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN')) {
    redirect('/')
  }

  const team = await prisma.user.findMany({
    where: { managerId: session.user.id },
    include: {
      goals: {
        where: { status: 'APPROVED' },
        include: { checkIns: true }
      }
    }
  })

  const currentQuarter = 'Q1'

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Team Check-ins</h1>
        <p className="text-sm text-gray-500">Track your team's progress for {currentQuarter}</p>
      </div>

      <div className="grid gap-6">
        {team.map(member => {
          // Calculate overall rollup score for this member in the current quarter
          let rollupScore = 0

          member.goals.forEach(goal => {
            const checkIn = goal.checkIns.find(c => c.quarter === currentQuarter)
            if (checkIn) {
              rollupScore += (checkIn.progressScore * goal.weightage) / 100
            }
          })

          return (
            <Card key={member.id} className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <div className="text-right">
                    <span className="text-sm text-gray-500 block">Overall Score</span>
                    <span className={`text-xl font-bold ${rollupScore >= 80 ? 'text-green-600' : rollupScore >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                      {rollupScore.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Goal</TableHead>
                      <TableHead>Weightage</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Actual</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {member.goals.map(goal => {
                      const checkIn = goal.checkIns.find(c => c.quarter === currentQuarter)
                      return (
                        <TableRow key={goal.id}>
                          <TableCell className="font-medium">{goal.title}</TableCell>
                          <TableCell>{goal.weightage}%</TableCell>
                          <TableCell>{goal.target} {goal.uomType}</TableCell>
                          <TableCell>{checkIn ? checkIn.actualAchievement : '-'}</TableCell>
                          <TableCell className="font-semibold text-blue-600">{checkIn ? `${checkIn.progressScore}%` : '-'}</TableCell>
                          <TableCell>{checkIn ? checkIn.goalStatus.replace('_', ' ') : 'PENDING'}</TableCell>
                        </TableRow>
                      )
                    })}
                    {member.goals.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                          No approved goals for this employee.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )
        })}
        {team.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            You do not have any direct reports.
          </div>
        )}
      </div>
    </div>
  )
}
