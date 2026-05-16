export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Target, Plus, Filter, ArrowUpRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

export default async function GoalsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
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
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">On Track</Badge>
      case 'DRAFT':
        return <Badge className="bg-amber-50 text-amber-700 border-amber-100">Drafting</Badge>
      case 'REWORK':
        return <Badge className="bg-rose-50 text-rose-700 border-rose-100">Needs Rework</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 -mx-8 -mt-8 px-10 py-12 flex items-center justify-between shadow-lg shadow-emerald-100 mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="flex flex-col gap-2 relative z-10">
          <h1 className="text-4xl font-black text-white tracking-tight">My Goals & OKRs</h1>
          <p className="text-emerald-50 text-lg font-medium opacity-90">Track your individual performance and growth targets.</p>
        </div>
        <Link href="/employee/create" className="relative z-10">
          <Button className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-xl font-black px-8 h-12">
            <Plus className="w-4 h-4 mr-2" /> Create New Goal
          </Button>
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <Card className="bg-white border-slate-200 shadow-sm">
           <CardContent className="p-6 flex flex-col gap-1">
             <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Goals</span>
             <span className="text-3xl font-black text-slate-900">{goals.length}</span>
           </CardContent>
         </Card>
         <Card className="bg-white border-slate-200 shadow-sm">
           <CardContent className="p-6 flex flex-col gap-1">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500" />
               <span className="text-xs font-black text-slate-400 uppercase tracking-widest">On Track</span>
             </div>
             <span className="text-3xl font-black text-emerald-600">{approvedCount}</span>
           </CardContent>
         </Card>
         <Card className="bg-white border-slate-200 shadow-sm">
           <CardContent className="p-6 flex flex-col gap-1">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-amber-500" />
               <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Progressing</span>
             </div>
             <span className="text-3xl font-black text-amber-600">{draftCount}</span>
           </CardContent>
         </Card>
         <Card className="bg-white border-slate-200 shadow-sm">
           <CardContent className="p-6 flex flex-col gap-1">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-rose-500" />
               <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Off Track</span>
             </div>
             <span className="text-3xl font-black text-rose-600">{reworkCount}</span>
           </CardContent>
         </Card>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 border-slate-200 text-slate-600 font-bold px-4">
              <Filter className="w-4 h-4 mr-2 text-slate-400" /> All Goals
            </Button>
            <Button variant="ghost" size="sm" className="h-9 text-slate-500 font-bold px-4">
              Active
            </Button>
            <Button variant="ghost" size="sm" className="h-9 text-slate-500 font-bold px-4">
              Completed
            </Button>
          </div>
        </div>

        {goals.length > 0 ? (
          <div className="grid gap-4">
            {goals.map((goal) => (
              <Card key={goal.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                <div className="flex h-full">
                  <div className={`w-1.5 ${goal.status === 'APPROVED' ? 'bg-emerald-500' : goal.status === 'REWORK' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                  <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <Link href={`/employee/check-ins`} className="text-xl font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                          {goal.title}
                        </Link>
                        {getStatusBadge(goal.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Target className="w-4 h-4 text-slate-300" />
                          {goal.thrustArea}
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                        <div>{goal.weightage}% Weightage</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Progress</span>
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${goal.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: '65%' }} />
                        </div>
                      </div>
                      <Link href={`/employee/check-ins`}>
                        <Button variant="ghost" size="icon" className="text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-full">
                          <ArrowUpRight className="w-5 h-5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white border-slate-200 shadow-sm p-20 text-center flex flex-col items-center justify-center border-2 border-dashed">
             <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
               <Target className="w-8 h-8 text-slate-300" />
             </div>
             <h3 className="text-xl font-bold text-slate-900">No goals found</h3>
             <p className="text-slate-500 mt-1 max-w-sm">You haven't created any goals for this cycle yet. Start by setting your OKRs.</p>
             <Link href="/employee/create" className="mt-6">
               <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8">Create your first goal</Button>
             </Link>
          </Card>
        )}
      </div>
    </div>
  )
}
