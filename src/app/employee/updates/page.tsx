import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { TrendingUp, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default async function UpdatesPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'EMPLOYEE') {
    redirect('/')
  }

  // Get current user's manager
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  // Get teammates
  const teammates = currentUser?.managerId ? await prisma.user.findMany({
    where: { managerId: currentUser.managerId },
    select: { id: true, name: true }
  }) : [{ id: session.user.id, name: session.user.name }]

  const teammateIds = teammates.map(t => t.id)

  // Fetch recent check-ins for these teammates
  const recentCheckIns = await prisma.checkIn.findMany({
    where: {
      goal: { employeeId: { in: teammateIds } }
    },
    include: {
      goal: { include: { employee: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  })

  return (
    <div className="flex flex-col min-h-full">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-10 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shadow-sm">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Team Updates</h1>
            <p className="text-emerald-50 mt-1">Recent progress and check-ins from your team</p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {recentCheckIns.length === 0 ? (
              <div className="py-16 text-center">
                <Clock className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No recent updates.</p>
                <p className="text-gray-400 text-sm mt-1">Check back later when your team makes progress.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentCheckIns.map(checkIn => (
                  <div key={checkIn.id} className="p-6 hover:bg-slate-50 transition-colors flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0 overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${checkIn.goal.employee.name}`} alt="avatar" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-900">
                          <span className="font-bold">{checkIn.goal.employee.name}</span> checked in on <span className="font-semibold text-indigo-600">{checkIn.goal.title}</span>
                        </p>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(checkIn.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-6 mb-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-1">Quarter</p>
                            <p className="text-sm font-bold text-gray-900">{checkIn.quarter}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-1">Achievement</p>
                            <p className="text-sm font-bold text-gray-900">{checkIn.actualAchievement}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-1">Status</p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                              ${checkIn.goalStatus === 'ON_TRACK' ? 'bg-emerald-100 text-emerald-800' : 
                                checkIn.goalStatus === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 
                                'bg-gray-100 text-gray-800'}`}>
                              {checkIn.goalStatus.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        
                        {checkIn.managerComment && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500 font-medium mb-1">Manager Note:</p>
                            <p className="text-sm text-gray-700 italic">"{checkIn.managerComment}"</p>
                          </div>
                        )}
                      </div>
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
