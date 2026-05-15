import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Award, Compass, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GrowthAreaDialog } from '@/components/employee/growth-area-dialog'

export default async function GrowPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'EMPLOYEE') {
    redirect('/')
  }

  // Fetch GrowthAreas
  const growthAreas = await prisma.growthArea.findMany({
    where: { employeeId: session.user.id },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="flex flex-col min-h-full">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-400 px-8 py-10 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shadow-sm">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Grow</h1>
            <p className="text-amber-50 mt-1">Track your career development and skills</p>
          </div>
        </div>
        <GrowthAreaDialog />
      </div>

      <div className="flex-1 bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-6 bg-gray-50/50">
              <h2 className="font-bold text-gray-900 border-b-2 border-amber-500 pb-5 -mb-5">Development Plan</h2>
              <h2 className="font-medium text-gray-500 hover:text-gray-900 cursor-pointer pb-5 -mb-5">Career Tracks</h2>
            </div>
            
            {growthAreas.length === 0 ? (
              <div className="py-20 text-center">
                <Compass className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-900 font-bold text-lg">No growth areas defined</p>
                <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">
                  Where do you want to take your career next? Set development goals to align your growth with company opportunities.
                </p>
                <Button className="mt-6 bg-amber-500 hover:bg-amber-600">Create your first growth area</Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {growthAreas.map((area) => (
                  <div key={area.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900 text-lg">{area.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                        ${area.status === 'ACHIEVED' ? 'bg-emerald-100 text-emerald-800' : 
                          area.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {area.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{area.description || 'No description provided.'}</p>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs">Add Update</Button>
                      <Button variant="outline" size="sm" className="text-xs">Request Feedback</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
