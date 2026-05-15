import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GoalReviewClient } from '@/components/manager/goal-review-client'

export default async function EmployeeReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN')) {
    redirect('/')
  }

  const employee = await prisma.user.findUnique({
    where: {
      id: resolvedParams.id,
      managerId: session.user.role === 'MANAGER' ? session.user.id : undefined, // Admin can view any
    },
    include: {
      goals: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!employee) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold">Employee Not Found</h1>
        <Link href="/manager">
          <Button variant="link" className="px-0 mt-4">← Back to Team</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/manager">
          <Button variant="outline" size="sm">← Back</Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{employee.name}'s Goals</h1>
          <p className="text-sm text-gray-500">{employee.email}</p>
        </div>
      </div>

      <GoalReviewClient employeeId={employee.id} initialGoals={employee.goals} />
    </div>
  )
}
