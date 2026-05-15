import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function EmployeeDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'EMPLOYEE') {
    redirect('/')
  }

  const goals = await prisma.goal.findMany({
    where: { employeeId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  const approvedCount = goals.filter(g => g.status === 'APPROVED').length
  const draftCount = goals.filter(g => g.status === 'DRAFT').length
  const reworkCount = goals.filter(g => g.status === 'REWORK').length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800">On track</span>
      case 'DRAFT':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800">Progressing</span>
      case 'REWORK':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-100 text-rose-800">Off track</span>
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-800">{status}</span>
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Welcome Banner (Purple Gradient) */}
      <div className="bg-gradient-to-r from-fuchsia-500 to-purple-400 px-8 py-10 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-fuchsia-400 border-2 border-white text-white flex items-center justify-center text-xl font-bold shadow-sm">
            {session.user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Welcome, {session.user.name.split(' ')[0]}!
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="bg-white text-gray-800 hover:bg-gray-50 border-0 font-medium">
            Give or request feedback
          </Button>
          <Button variant="secondary" className="bg-white text-gray-800 hover:bg-gray-50 border-0 font-medium">
            More actions ▾
          </Button>
        </div>
      </div>

      {/* Main Content Area (2 Columns) */}
      <div className="flex-1 bg-white p-8">
        <div className="max-w-6xl mx-auto flex gap-8">
          
          {/* Left Column (Main Content) */}
          <div className="flex-1 flex flex-col gap-8">
            
            {/* Tasks Section (Dummy Data) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  Tasks (3) <span className="text-xs font-normal text-gray-400">Sorted by priority</span>
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                <div className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">✓</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Complete Self-Evaluation</p>
                      <p className="text-xs text-gray-500">Q2 Performance Review</p>
                    </div>
                  </div>
                  <span className="text-gray-400">›</span>
                </div>
                <div className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">✦</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Write reviews for team</p>
                      <p className="text-xs text-gray-500">360° Review (Basic: In-Flight)</p>
                    </div>
                  </div>
                  <span className="text-gray-400">›</span>
                </div>
                <div className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">★</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Update your {goals.length} goals</p>
                      <p className="text-xs text-gray-500">Due end of month</p>
                    </div>
                  </div>
                  <span className="text-gray-400">›</span>
                </div>
              </div>
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700">See all tasks</button>
              </div>
            </div>

            {/* Active Goals Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">
                  Active goals ({goals.length})
                </h2>
                <Link href="/employee/create">
                  <Button variant="outline" size="sm" className="h-8 text-xs font-medium">Create goal</Button>
                </Link>
              </div>
              
              <div className="p-5 border-b border-gray-100">
                <div className="grid grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-lg p-3 flex flex-col gap-1 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-3 bg-emerald-400 rounded-full"></div>
                      <span className="text-xs text-gray-600 font-medium">On track</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">{approvedCount}</span>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3 flex flex-col gap-1 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-3 bg-amber-400 rounded-full"></div>
                      <span className="text-xs text-gray-600 font-medium">Progressing</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">{draftCount}</span>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3 flex flex-col gap-1 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-3 bg-rose-400 rounded-full"></div>
                      <span className="text-xs text-gray-600 font-medium">Off track</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">{reworkCount}</span>
                  </div>
                </div>
              </div>

              {goals.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">No active goals found.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {goals.map((goal) => (
                    <div key={goal.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center">
                      <div className={`w-1 h-8 rounded-full mr-4 ${goal.status === 'APPROVED' ? 'bg-emerald-400' : goal.status === 'REWORK' ? 'bg-rose-400' : 'bg-amber-400'}`} />
                      
                      <div className="flex-1">
                        <Link href={`/employee/check-ins`} className="text-sm font-semibold text-gray-900 hover:underline">
                          {goal.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{goal.weightage}% Weightage</span>
                        </div>
                      </div>
                      
                      <div className="w-24 flex justify-end">
                        {getStatusBadge(goal.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column (Widgets) */}
          <div className="w-72 flex flex-col gap-6">
            
            {/* Manager & Team Widget */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Manager</h3>
                <button className="text-[10px] font-medium border border-gray-200 px-2 py-1 rounded text-gray-600 hover:bg-gray-50">View org chart</button>
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Manager" alt="Manager" />
                </div>
                <span className="text-sm font-medium text-gray-700">Sarah Manager</span>
              </div>

              <h3 className="text-sm font-semibold text-gray-900 mb-3">Team</h3>
              <div className="flex items-center -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-500 text-white flex items-center justify-center text-xs font-bold z-10">ME</div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 z-20 overflow-hidden"><img src="https://api.dicebear.com/7.x/notionists/svg?seed=T1" /></div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 z-30 overflow-hidden"><img src="https://api.dicebear.com/7.x/notionists/svg?seed=T2" /></div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 z-40 overflow-hidden"><img src="https://api.dicebear.com/7.x/notionists/svg?seed=T3" /></div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-medium z-50">+4</div>
              </div>
            </div>

            {/* 1:1s Widget */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">1:1s</h3>
                <button className="text-[10px] font-medium border border-gray-200 px-2 py-1 rounded text-gray-600 hover:bg-gray-50">Add 1:1</button>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Add talking points, collaborate with your team, and store notes to get the most out of recurring meetings.
              </p>
              <div className="h-px bg-gray-100 my-4" />
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden"><img src="https://api.dicebear.com/7.x/notionists/svg?seed=Manager" /></div>
                    <span className="text-xs font-medium text-gray-700">Sarah Manager</span>
                 </div>
                 <span className="text-[10px] text-gray-400">Tomorrow</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
