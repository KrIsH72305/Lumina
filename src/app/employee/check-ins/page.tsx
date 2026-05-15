import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckInList } from '@/components/employee/check-in-list'

export default async function EmployeeCheckInsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'EMPLOYEE') {
    redirect('/')
  }

  const goals = await prisma.goal.findMany({
    where: { employeeId: session.user.id, status: 'APPROVED' },
    include: { checkIns: true },
    orderBy: { createdAt: 'desc' },
  })

  // Hardcode current quarter for demo
  const currentQuarter = 'Q1'

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quarterly Check-ins</h1>
          <p className="text-sm text-gray-500">Update your actual achievements for the current quarter ({currentQuarter})</p>
        </div>
      </div>

      <CheckInList goals={goals} currentQuarter={currentQuarter} />
    </div>
  )
}
