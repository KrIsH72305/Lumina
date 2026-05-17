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

export default async function AdminReportsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const users = await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    include: {
      goals: {
        where: { status: 'APPROVED' },
        include: { checkIns: true }
      },
      manager: true
    }
  })

  const currentQuarter = 'Q1'

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Achievement Report</h1>
        <p className="text-sm text-gray-500">System-wide goal completion progress for {currentQuarter}</p>
      </div>

      <Card className="shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle>Employee Progress Rollup</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Approved Goals</TableHead>
                <TableHead>Quarterly Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => {
                let rollupScore = 0

                user.goals.forEach(goal => {
                  const checkIn = goal.checkIns.find(c => c.quarter === currentQuarter)
                  if (checkIn) {
                    rollupScore += ((checkIn.progressScore || 0) * goal.weightage) / 100
                  }
                })

                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-gray-900">{user.name}</TableCell>
                    <TableCell>{user.email === 'employee@lumina.com' ? 'Product Engineering' : 'Operations'}</TableCell>
                    <TableCell>{user.manager?.name || 'N/A'}</TableCell>
                    <TableCell>{user.goals.length}</TableCell>
                    <TableCell className={`font-semibold ${rollupScore >= 80 ? 'text-green-600' : rollupScore >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                      {rollupScore.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                )
              })}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No employees found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
