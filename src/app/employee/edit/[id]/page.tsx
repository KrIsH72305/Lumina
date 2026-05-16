import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { GoalForm } from '@/components/employee/goal-form'

export default async function EditGoalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'EMPLOYEE') {
    redirect('/')
  }

  const goal = await prisma.goal.findUnique({
    where: { id: resolvedParams.id, employeeId: session.user.id },
  })

  if (!goal || goal.status === 'APPROVED' || goal.status === 'PENDING_APPROVAL') {
    notFound()
  }

  // Get existing weightage (excluding this goal)
  const otherGoals = await prisma.goal.findMany({
    where: { employeeId: session.user.id, NOT: { id: goal.id } },
  })

  const currentWeightage = otherGoals.reduce((sum, g) => sum + g.weightage, 0)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Goal</h1>
        <p className="text-sm text-gray-500">Update your goal details. {goal.isShared ? 'Title and Target are fixed for this shared KPI.' : ''}</p>
      </div>
      <GoalForm currentWeightage={currentWeightage} initialData={goal} />
    </div>
  )
}
