import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function ManagerDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN')) {
    redirect('/')
  }

  // Get direct reports
  const team = await prisma.user.findMany({
    where: { managerId: session.user.id },
    include: {
      goals: true,
    },
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Team Goal Review</h1>
        <p className="text-sm text-gray-500">Review and approve your team's goals</p>
      </div>

      <Card className="shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle>Direct Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Goals Drafted</TableHead>
                <TableHead>Total Weightage</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.map((member) => {
                const totalWeightage = member.goals.reduce((sum, g) => sum + g.weightage, 0)
                
                return (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium text-gray-900">{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.goals.length}</TableCell>
                    <TableCell className={totalWeightage !== 100 ? 'text-amber-600 font-medium' : 'text-green-600 font-medium'}>
                      {totalWeightage}%
                    </TableCell>
                    <TableCell>
                      <Link href={`/manager/employee/${member.id}`}>
                        <Button variant="outline" size="sm">Review Goals</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
              {team.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-6">
                    No direct reports found.
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
