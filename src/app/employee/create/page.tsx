import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { GoalForm } from '@/components/employee/goal-form'
import { prisma } from '@/lib/prisma'

export default async function CreateGoalPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'EMPLOYEE') {
    redirect('/')
  }

  // Get existing weightage
  const goals = await prisma.goal.findMany({
    where: { employeeId: session.user.id },
  })

  const currentWeightage = goals.reduce((sum, g) => sum + g.weightage, 0)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Goal</h1>
        <p className="text-sm text-gray-500">Add a new goal to your plan. Total weightage must equal 100%.</p>
      </div>
      <GoalForm currentWeightage={currentWeightage} />
    </div>
  )
}
