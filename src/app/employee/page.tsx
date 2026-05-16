export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ClipboardList, 
  MessageSquare, 
  Target, 
  TrendingUp, 
  Calendar, 
  ChevronRight, 
  Star, 
  ArrowUpRight,
  Plus,
  Users
} from 'lucide-react'

export default async function EmployeeDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'EMPLOYEE') {
    redirect('/')
  }

  const userExists = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!userExists) {
    redirect('/login')
  }

  // Fetch data for summary
  const [goals, oneOnOnes, feedback, pips, pendingReviews] = await Promise.all([
    prisma.goal.findMany({ where: { employeeId: session.user.id } }),
    prisma.oneOnOne.findMany({ where: { employeeId: session.user.id }, take: 3, orderBy: { date: 'desc' } }),
    prisma.feedback.findMany({ where: { toUserId: session.user.id }, take: 3, orderBy: { createdAt: 'desc' } }),
    prisma.pip.findMany({ where: { userId: session.user.id, status: 'ACTIVE' } }),
    prisma.review.findMany({ 
      where: { reviewerId: session.user.id, status: 'PENDING' },
      include: { cycle: true },
      take: 2
    })
  ])

  const approvedCount = goals.filter(g => g.status === 'APPROVED').length

  return (
    <div className="flex flex-col min-h-full bg-slate-50/50">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-10 py-16 flex items-center justify-between shadow-xl shadow-indigo-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="flex items-center gap-8 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-xl border-2 border-white/30 text-white flex items-center justify-center text-3xl font-black shadow-2xl">
            {session.user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-white tracking-tight">
              Good morning, {session.user.name.split(' ')[0]}!
            </h1>
            <p className="text-indigo-100 text-lg font-medium opacity-90">You have 3 tasks requiring your attention today.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <Link href="/employee/feedback">
            <Button variant="secondary" className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border-white/20 font-bold px-6 h-12">
              Give Feedback
            </Button>
          </Link>
          <Link href="/employee/goals">
            <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-slate-50 border-0 font-black px-8 h-12 shadow-lg">
              View Goals
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-10 max-w-[1600px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Active Tasks Widget */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <ClipboardList className="w-7 h-7 text-indigo-500" />
                  Your Tasks
                </h2>
                <Button variant="ghost" className="text-indigo-600 font-bold hover:bg-indigo-50">
                  See all <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              
              <div className="grid gap-4">
                {pendingReviews.length > 0 ? (
                  pendingReviews.map(review => (
                    <Card key={review.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                      <div className="flex items-center p-6 gap-6">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                          <Star className="w-6 h-6 text-amber-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-900">
                            {review.type === 'SELF' ? 'Complete Self-Evaluation' : `Review for Peer`}
                          </h3>
                          <p className="text-sm text-slate-500 font-medium">Part of {review.cycle.name}</p>
                        </div>
                        <Badge className="bg-amber-50 text-amber-600 border-amber-100 px-4 py-1 font-bold">Priority</Badge>
                        <Link href={`/employee/reviews/${review.id}`}>
                          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6">Start</Button>
                        </Link>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="bg-white rounded-xl p-10 text-center border-2 border-dashed border-slate-100">
                    <p className="text-slate-400 font-medium italic">No pending review tasks! All caught up.</p>
                  </div>
                )}
                
                {/* Always show goal update task as a prompt */}
                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                   <div className="flex items-center p-6 gap-6">
                     <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                       <Target className="w-6 h-6 text-indigo-500" />
                     </div>
                     <div className="flex-1">
                       <h3 className="text-lg font-bold text-slate-900">Update your goals</h3>
                       <p className="text-sm text-slate-500 font-medium">Check in on your {goals.length} active targets</p>
                     </div>
                     <Link href="/employee/goals">
                       <Button variant="outline" className="border-slate-200 text-slate-600 font-bold px-6">Update</Button>
                     </Link>
                   </div>
                </Card>
              </div>
            </section>

            {/* Goals Overview Widget */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <Target className="w-7 h-7 text-emerald-500" />
                  Goals Overview
                </h2>
                <Link href="/employee/goals">
                  <Button variant="ghost" className="text-emerald-600 font-bold hover:bg-emerald-50">
                    Full List <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Card className="bg-white border-slate-200 shadow-sm p-6">
                   <div className="flex flex-col gap-4">
                     <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Progress to Date</span>
                        <span className="text-2xl font-black text-emerald-600">68%</span>
                     </div>
                     <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 rounded-full shadow-lg shadow-emerald-200" style={{ width: '68%' }} />
                     </div>
                     <p className="text-xs font-medium text-slate-500 text-center">
                       You are <span className="text-emerald-600 font-bold">ahead of schedule</span> for 3 out of 5 goals.
                     </p>
                   </div>
                 </Card>
                 <Card className="bg-white border-slate-200 shadow-sm p-6 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Weightage Score</span>
                      <span className="text-3xl font-black text-slate-900">8.4 / 10</span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-indigo-600" />
                    </div>
                 </Card>
              </div>
            </section>
          </div>

          {/* Sidebar Column (Widgets) */}
          <div className="space-y-10">
            
            {/* 1:1 Meetings Widget */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                Upcoming 1:1s
              </h2>
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-0">
                  {oneOnOnes.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {oneOnOnes.map(meeting => (
                        <div key={meeting.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shadow-inner">SC</div>
                             <div className="flex flex-col">
                               <span className="text-sm font-bold text-slate-900">Sarah Chen</span>
                               <span className="text-[11px] font-medium text-slate-400">{new Date(meeting.date).toLocaleDateString()}</span>
                             </div>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-slate-300" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center text-sm text-slate-400 font-medium">No 1:1s scheduled</div>
                  )}
                  <div className="p-4 bg-slate-50/50 border-t border-slate-100">
                    <Link href="/employee/1-1s">
                      <Button variant="ghost" className="w-full text-xs font-bold text-indigo-600 hover:bg-indigo-50">Schedule New</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Recent Feedback Widget */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-500" />
                Recent Feedback
              </h2>
              <div className="space-y-3">
                 {feedback.map(f => (
                   <div key={f.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                     <p className="text-sm text-slate-600 font-medium line-clamp-2 italic">"{f.content}"</p>
                     <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Public Feedback</span>
                        <Link href="/employee/feedback">
                          <Button variant="ghost" size="sm" className="h-6 text-[10px] font-black text-indigo-500 p-0">View all</Button>
                        </Link>
                     </div>
                   </div>
                 ))}
              </div>
            </section>

            {/* PIP Alert (Conditional) */}
            {pips.length > 0 && (
              <Card className="bg-rose-50 border-rose-200 shadow-lg shadow-rose-100 overflow-hidden">
                <div className="p-6 space-y-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center mx-auto text-white shadow-lg">
                    <Plus className="rotate-45 w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-rose-900">Active PIP</h3>
                    <p className="text-xs text-rose-700 font-medium leading-relaxed">
                      You are currently on a Performance Improvement Plan. Focus on your objectives.
                    </p>
                  </div>
                  <Link href="/employee/pips">
                    <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold">View Objectives</Button>
                  </Link>
                </div>
              </Card>
            )}

          </div>

        </div>
      </div>
    </div>
  )
}
