import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, Calendar, CheckCircle, FileText, Plus, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { PipDialog } from '@/components/employee/pip-dialog'

export default async function PIPsPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const pips = await prisma.pip.findMany({
    where: session.user.role === 'ADMIN'
      ? {}
      : {
          OR: [
            { userId: session.user.id },
            { user: { managerId: session.user.id } }
          ]
        },
    include: {
      user: {
        select: { name: true, email: true, managerId: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const reports = await prisma.user.findMany({
    where: session.user.role === 'ADMIN' ? { role: 'EMPLOYEE' } : { managerId: session.user.id },
    select: { id: true, name: true }
  })

  const isManager = session.user.role === 'MANAGER' || session.user.role === 'ADMIN'

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-600 to-rose-400 -mx-8 -mt-8 px-10 py-12 flex items-center justify-between shadow-lg shadow-rose-100 mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="flex flex-col gap-2 relative z-10">
          <h1 className="text-4xl font-black text-white tracking-tight">Performance Improvement</h1>
          <p className="text-rose-50 text-lg font-medium opacity-90">Structured support to help team members reach their full potential.</p>
        </div>
        {isManager && <PipDialog users={reports} />}
      </div>

      {pips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pips.map(pip => (
            <Card key={pip.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
              <div className="h-1.5 bg-rose-500 w-full" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge className={pip.status === 'ACTIVE' ? 'bg-rose-50 text-rose-600 border-rose-100 font-bold' : 'bg-emerald-50 text-emerald-600 border-emerald-100 font-bold'}>
                    {pip.status.replace('_', ' ')}
                  </Badge>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">#{pip.id.substring(0, 8)}</span>
                </div>
                <CardTitle className="text-slate-900 text-xl font-bold">{pip.title}</CardTitle>
                <CardDescription className="text-slate-500 font-medium line-clamp-2 mt-1">
                  {pip.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-sm shadow-inner">
                    {pip.user.name[0]}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-bold text-slate-900 truncate">{pip.user.name}</span>
                    <span className="text-[11px] font-medium text-slate-400 truncate">{pip.user.email}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 font-medium text-sm">
                    <Calendar className="w-4 h-4 text-rose-400" />
                    Ends {new Date(pip.endDate).toLocaleDateString()}
                  </div>
                  <Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50 font-bold">
                    View Details <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 shadow-sm">
          <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-emerald-400" />
          </div>
          <h3 className="text-slate-900 text-2xl font-bold">No active plans</h3>
          <p className="text-slate-500 text-lg max-w-sm mt-2">
            Excellent! There are currently no performance improvement plans in progress.
          </p>
        </div>
      )}

      {/* Info Cards */}
      <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-2xl bg-gradient-to-br from-rose-50 to-white border border-rose-100 space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
            <AlertCircle className="w-6 h-6 text-rose-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900">Purpose of PIPs</h3>
            <p className="text-slate-500 leading-relaxed font-medium">
              A PIP is a formal document used to help an employee whose performance is not meeting expectations. It provides clear, actionable goals and a timeline for success.
            </p>
          </div>
        </div>
        <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
            <CheckCircle className="w-6 h-6 text-indigo-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900">Manager Best Practices</h3>
            <p className="text-slate-500 leading-relaxed font-medium">
              Effective PIPs are collaborative, objective, and supportive. Ensure you schedule weekly check-ins to provide feedback and resources to help the employee improve.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
