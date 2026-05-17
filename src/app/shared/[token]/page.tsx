import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function SharedGoalsPage({
  params
}: {
  params: Promise<{ token: string }>
}) {
  const resolvedParams = await params
  
  const link = await prisma.portfolioShare.findUnique({
    where: { token: resolvedParams.token },
    include: {
      employee: {
        include: {
          goals: {
            where: { status: 'APPROVED' }, // Only show approved goals
            orderBy: { createdAt: 'desc' },
            include: { checkIns: true }
          }
        }
      }
    }
  })

  if (!link) {
    notFound()
  }

  const currentQuarter = 'Q1'

  // Calculate overall rollup score
  let rollupScore = 0
  link.employee.goals.forEach(goal => {
    const checkIn = goal.checkIns.find(c => c.quarter === currentQuarter)
    if (checkIn) {
      rollupScore += ((checkIn.progressScore || 0) * goal.weightage) / 100
    }
  })

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent inline-block pb-1">Lumina</h1>
          <p className="mt-2 text-sm text-gray-600">Public Goal Portfolio</p>
        </div>

        <Card className="shadow-sm border-gray-200 mb-8">
          <CardHeader className="border-b bg-gray-50/50">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">{link.employee.name}'s Goals</CardTitle>
                <p className="text-sm text-gray-500 mt-1">{link.employee.email === 'employee@lumina.com' ? 'Product Engineering' : 'Operations'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 font-medium">Overall {currentQuarter} Score</p>
                <p className={`text-2xl font-bold ${rollupScore >= 80 ? 'text-green-600' : rollupScore >= 50 ? 'text-amber-500' : 'text-gray-900'}`}>
                  {rollupScore.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Goal Title</TableHead>
                  <TableHead>Thrust Area</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Weightage</TableHead>
                  <TableHead>{currentQuarter} Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {link.employee.goals.map(goal => {
                  const checkIn = goal.checkIns.find(c => c.quarter === currentQuarter)
                  return (
                    <TableRow key={goal.id}>
                      <TableCell className="font-medium text-gray-900">{goal.title}</TableCell>
                      <TableCell>{goal.thrustArea}</TableCell>
                      <TableCell>{goal.target} {goal.uomType}</TableCell>
                      <TableCell>{goal.weightage}%</TableCell>
                      <TableCell>
                        {checkIn ? (
                          <Badge variant="outline" className={(checkIn.progressScore || 0) >= 80 ? 'text-green-600 border-green-200 bg-green-50' : ''}>
                            {checkIn.progressScore || 0}%
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
                {link.employee.goals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No approved goals found for this portfolio.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-gray-400">
          Generated on {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}
