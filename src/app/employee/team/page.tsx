export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Mail, MapPin, Briefcase, ChevronRight, MessageSquare, Plus } from 'lucide-react'

export default async function TeamPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'EMPLOYEE') {
    redirect('/')
  }

  // Get current user's manager
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { manager: true }
  })

  // If DB was reset and session is stale, force re-login
  if (!currentUser) {
    redirect('/login')
  }

  // Get teammates (sharing the same manager)
  const teammates = await prisma.user.findMany({
    where: { managerId: currentUser.managerId, id: { not: session.user.id } }
  })

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 pb-20">
      {/* Header */}
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-600 to-indigo-500 -mx-8 -mt-8 px-10 py-12 flex items-center justify-between shadow-lg shadow-sky-100 mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="flex flex-col gap-2 relative z-10">
          <h1 className="text-4xl font-black text-white tracking-tight">My Team</h1>
          <p className="text-sky-50 text-lg font-medium opacity-90">Your network and direct reporting structure.</p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
           <Button variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 font-bold px-4 h-11 shadow-sm">
             View Org Chart
           </Button>
           <Button className="bg-white text-sky-600 hover:bg-sky-50 font-black px-8 h-11 shadow-xl">
             <Plus className="w-4 h-4 mr-2" /> Add Team Note
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Peers Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <Users className="w-7 h-7 text-indigo-500" />
                Peers <Badge className="ml-2 bg-indigo-50 text-indigo-700 border-indigo-100 font-bold">{teammates.length}</Badge>
              </h2>
            </div>
            
            {teammates.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">No peers found</h3>
                <p className="text-slate-500 max-w-sm mt-2 font-medium">
                  It looks like you're the only one reporting to your manager right now.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teammates.map(member => (
                  <Card key={member.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-6 space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${member.name}`} className="w-10 h-10" alt="avatar" />
                          </div>
                          <div className="flex flex-col">
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{member.name}</h3>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                               <Briefcase className="w-3 h-3" /> Product Designer
                            </div>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-slate-50 space-y-2">
                           <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                             <Mail className="w-4 h-4 text-slate-300" /> {member.email}
                           </div>
                           <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                             <MapPin className="w-4 h-4 text-slate-300" /> San Francisco, CA
                           </div>
                        </div>
                      </div>
                      <div className="bg-slate-50/50 p-4 border-t border-slate-100 flex items-center justify-between">
                         <Link href="/employee/feedback">
                           <Button variant="ghost" size="sm" className="text-xs font-bold text-indigo-600 hover:bg-white">
                             <MessageSquare className="w-3.5 h-3.5 mr-2" /> Message
                           </Button>
                         </Link>
                         <Link href={`/employee/team/${member.id}`}>
                           <Button variant="ghost" size="sm" className="text-xs font-bold text-slate-400">
                             View Profile <ChevronRight className="w-3.5 h-3.5 ml-1" />
                           </Button>
                         </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-10">
           {/* Manager Section */}
           {currentUser?.manager && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-800">Your Manager</h2>
              <Card className="bg-white border-slate-200 shadow-lg shadow-indigo-50/50 overflow-hidden">
                <div className="h-1.5 bg-indigo-600 w-full" />
                <CardContent className="p-6 space-y-6">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-20 h-20 rounded-full bg-indigo-50 border-4 border-white shadow-xl flex items-center justify-center">
                       <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser.manager.name}`} className="w-14 h-14" alt="avatar" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900">{currentUser.manager.name}</h3>
                      <p className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] mt-1">Direct Manager</p>
                    </div>
                  </div>
                  <div className="space-y-3 pt-4 border-t border-slate-50">
                    <a href={`mailto:${currentUser.manager.email}`} className="block">
                      <Button variant="outline" className="w-full border-slate-200 text-slate-600 font-bold">
                         <Mail className="w-4 h-4 mr-2" /> Email Manager
                      </Button>
                    </a>
                    <Link href="/employee/1-1s" className="block">
                      <Button className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-0 font-bold">
                         <MessageSquare className="w-4 h-4 mr-2" /> Start 1:1 Chat
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Org Insights */}
          <section className="space-y-4">
             <h2 className="text-xl font-bold text-slate-800">Team Insights</h2>
             <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <Users className="w-5 h-5 text-indigo-500" />
                  </div>
                  <span className="text-sm font-bold text-slate-900">Collaboration Level</span>
                </div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  Your team has held <span className="font-black text-indigo-600">12 1:1 meetings</span> this month.
                </p>
             </div>
          </section>
        </div>
      </div>
    </div>
  )
}
