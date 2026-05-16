import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, ShieldAlert, Target, TrendingUp, Star, Users as UsersIcon } from 'lucide-react'

export default async function TalentPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const isManager = session.user.role === 'MANAGER' || session.user.role === 'ADMIN'

  if (!isManager) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center gap-6">
        <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center">
          <ShieldAlert className="w-10 h-10 text-rose-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-heading font-bold text-slate-900">Access Restricted</h1>
          <p className="text-slate-500 max-w-md mx-auto text-lg">
            The Talent Management module is only accessible to managers and administrators.
          </p>
        </div>
      </div>
    )
  }

  const reports = await prisma.user.findMany({
    where: { managerId: session.user.id },
    include: {
      talentRatings: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  })

  const grid: { [key: string]: any[] } = {}
  for (let i = 1; i <= 3; i++) {
    for (let j = 1; j <= 3; j++) {
      grid[`${i}-${j}`] = []
    }
  }

  reports.forEach(user => {
    const rating = user.talentRatings[0]
    if (rating) {
      grid[`${rating.performance}-${rating.potential}`].push(user)
    }
  })

  const gridLabels: { [key: string]: { title: string, color: string } } = {
    '1-1': { title: 'Risk', color: 'bg-rose-50 text-rose-600 border-rose-100' },
    '1-2': { title: 'Inconsistent', color: 'bg-orange-50 text-orange-600 border-orange-100' },
    '1-3': { title: 'Potential Gem', color: 'bg-sky-50 text-sky-600 border-sky-100' },
    '2-1': { title: 'Solid Performer', color: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
    '2-2': { title: 'Core Player', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    '2-3': { title: 'High Potential', color: 'bg-violet-50 text-violet-600 border-violet-100' },
    '3-1': { title: 'Workhorse', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    '3-2': { title: 'High Performer', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    '3-3': { title: 'Star', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-heading font-extrabold tracking-tight text-slate-900">Talent Management</h1>
        <p className="text-slate-500 text-lg">Assess potential and performance across your team.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* 9-Box Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-indigo-500" />
              9-Box Calibration
            </h2>
            <div className="flex gap-4 text-xs font-bold uppercase tracking-wider text-slate-400">
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400" /> Potential</div>
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Performance</div>
            </div>
          </div>

          <div className="grid grid-cols-3 grid-rows-3 gap-3 aspect-square max-w-[650px] w-full mx-auto relative bg-slate-100 p-3 rounded-2xl border border-slate-200">
             {/* Labels */}
             <div className="absolute -left-14 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase">
               POTENTIAL
             </div>
             <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase">
               PERFORMANCE
             </div>

             {[3, 2, 1].map(potential => (
               [1, 2, 3].map(performance => {
                 const key = `${performance}-${potential}`
                 const label = gridLabels[key]
                 const users = grid[key]
                 
                 return (
                   <div key={key} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
                     <div className="flex flex-col gap-1.5">
                       <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${label.color} w-fit uppercase tracking-wider`}>
                         {label.title}
                       </span>
                     </div>
                     <div className="flex flex-wrap gap-1.5 mt-auto">
                        {users.map(u => (
                          <div key={u.id} className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white border-2 border-white shadow-sm ring-1 ring-slate-100" title={u.name}>
                            {u.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        ))}
                        {users.length === 0 && <span className="text-[10px] text-slate-300 italic font-medium">No results</span>}
                     </div>
                   </div>
                 )
               })
             ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-10">
          <section className="space-y-4">
             <h2 className="text-xl font-bold text-slate-800">Succession Planning</h2>
             <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
                <div className="h-1 bg-emerald-500" />
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">Engineering Manager</span>
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Key Critical Role</span>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold">Ready Now</Badge>
                  </div>
                  <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-sm font-bold text-white shadow-sm">AR</div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">Alex Rivera</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">9-Box Status: Star</span>
                    </div>
                  </div>
                </CardContent>
             </Card>
          </section>

          <section className="space-y-4">
             <h2 className="text-xl font-bold text-slate-800">Growth Insights</h2>
             <div className="space-y-4">
               <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100 flex gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-indigo-400 uppercase tracking-wider">Performance Trend</p>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">
                      Team performance has increased by <span className="text-emerald-600 font-bold">12.4%</span> this quarter.
                    </p>
                  </div>
               </div>
               <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100 flex gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <Star className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-amber-400 uppercase tracking-wider">Talent Opportunity</p>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">
                      <span className="font-bold">2 members</span> are in the "Potential Gem" quadrant. Career talks recommended.
                    </p>
                  </div>
               </div>
             </div>
          </section>
        </div>
      </div>
    </div>
  )
}
