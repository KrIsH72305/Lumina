import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Mail, 
  MapPin, 
  Briefcase, 
  ChevronLeft, 
  MessageSquare, 
  Calendar,
  Award,
  Target,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

export default async function MemberProfilePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/')

  const member = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      manager: true,
      goals: { take: 3, orderBy: { createdAt: 'desc' } },
      talentRatings: { take: 1, orderBy: { createdAt: 'desc' } }
    }
  })

  if (!member) notFound()

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10 pb-20">
      {/* Back Button */}
      <Link href="/employee/team">
        <Button variant="ghost" className="text-slate-400 hover:text-indigo-600 font-bold p-0 mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Team
        </Button>
      </Link>

      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-indigo-50/50 overflow-hidden relative">
         <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600 w-full" />
         <div className="px-10 pb-10">
            <div className="relative -mt-16 mb-6">
               <div className="w-32 h-32 rounded-3xl bg-white border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${member.name}`} className="w-24 h-24" alt="avatar" />
               </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
               <div className="space-y-1">
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight">{member.name}</h1>
                  <p className="text-lg text-slate-500 font-medium flex items-center gap-2">
                     <Briefcase className="w-5 h-5 text-indigo-400" /> Senior Product Designer
                  </p>
               </div>
               <div className="flex items-center gap-3">
                  <a href={`mailto:${member.email}`}>
                    <Button variant="outline" className="border-slate-200 text-slate-600 font-bold px-6 h-12 shadow-sm">
                      <Mail className="w-4 h-4 mr-2" /> Email
                    </Button>
                  </a>
                  <Link href="/employee/feedback">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 h-12 shadow-lg shadow-indigo-100">
                      <MessageSquare className="w-4 h-4 mr-2" /> Send Feedback
                    </Button>
                  </Link>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Left Column: Info */}
         <div className="lg:col-span-1 space-y-8">
            <Card className="bg-white border-slate-200 shadow-sm p-6 space-y-6">
               <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">About</h3>
                  <div className="space-y-3">
                     <div className="flex items-center gap-3 text-slate-600 font-medium">
                        <MapPin className="w-4 h-4 text-slate-300" /> San Francisco, CA
                     </div>
                     <div className="flex items-center gap-3 text-slate-600 font-medium">
                        <Calendar className="w-4 h-4 text-slate-300" /> Joined Oct 2022
                     </div>
                  </div>
               </div>
               <div className="pt-6 border-t border-slate-50 space-y-4">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Manager</h3>
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${member.manager?.name || 'Admin'}`} className="w-8 h-8" alt="avatar" />
                     </div>
                     <span className="font-bold text-slate-900">{member.manager?.name || 'Company Admin'}</span>
                  </div>
               </div>
            </Card>

            <Card className="bg-indigo-50 border-indigo-100 shadow-sm p-6 space-y-4">
               <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-indigo-500" />
                  <span className="font-bold text-indigo-900 text-sm">Talent Status</span>
               </div>
               {member.talentRatings[0] ? (
                  <div className="space-y-2">
                     <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 font-black">HIGH POTENTIAL</Badge>
                     <p className="text-xs text-indigo-600 font-medium">Last calibrated: May 2024</p>
                  </div>
               ) : (
                  <p className="text-sm text-indigo-400 font-medium italic">Pending calibration...</p>
               )}
            </Card>
         </div>

         {/* Right Column: Work */}
         <div className="lg:col-span-2 space-y-8">
            <section className="space-y-6">
               <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <Target className="w-7 h-7 text-emerald-500" />
                  Active Goals
               </h2>
               <div className="grid gap-4">
                  {member.goals.length > 0 ? member.goals.map(goal => (
                     <Card key={goal.id} className="bg-white border-slate-200 shadow-sm p-6 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between gap-6">
                           <div className="space-y-1">
                              <h4 className="font-bold text-slate-900">{goal.title}</h4>
                              <p className="text-xs text-slate-400 font-medium">{goal.thrustArea} • {goal.weightage}% Weight</p>
                           </div>
                           <div className="flex items-center gap-3 shrink-0">
                              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-emerald-500" style={{ width: '70%' }} />
                              </div>
                              <span className="text-xs font-black text-emerald-600">70%</span>
                           </div>
                        </div>
                     </Card>
                  )) : (
                     <p className="text-slate-400 italic font-medium">No active goals listed.</p>
                  )}
               </div>
            </section>

            <section className="space-y-6">
               <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <TrendingUp className="w-7 h-7 text-indigo-500" />
                  Performance Pulse
               </h2>
               <Card className="bg-white border-slate-200 shadow-sm p-10 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                     <TrendingUp className="w-8 h-8 text-slate-200" />
                  </div>
                  <h4 className="font-bold text-slate-400">Activity graph coming soon</h4>
                  <p className="text-sm text-slate-300 mt-1 max-w-xs">Detailed performance trends and pulse checks are being calibrated.</p>
               </Card>
            </section>
         </div>
      </div>
    </div>
  )
}
