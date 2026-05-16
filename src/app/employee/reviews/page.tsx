export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, ClipboardList, CheckCircle2, Clock, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function ReviewsPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const reviews = await prisma.review.findMany({
    where: {
      OR: [
        { revieweeId: session.user.id },
        { reviewerId: session.user.id }
      ]
    },
    include: {
      cycle: true,
      reviewee: { select: { name: true } },
      reviewer: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  const activeReviews = reviews.filter(r => r.status === 'PENDING')
  const completedReviews = reviews.filter(r => r.status === 'SUBMITTED')

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-400 -mx-8 -mt-8 px-10 py-12 flex flex-col gap-2 shadow-lg shadow-amber-100 mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <h1 className="text-4xl font-black text-white tracking-tight relative z-10">Performance Reviews</h1>
        <p className="text-amber-50 text-lg font-medium opacity-90 relative z-10">Manage assessments and view your performance history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Active Tasks</h2>
            </div>
            
            {activeReviews.length > 0 ? (
              <div className="grid gap-4">
                {activeReviews.map(review => (
                  <Card key={review.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                    <div className="h-1 bg-indigo-500 w-full" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="space-y-1">
                        <CardTitle className="text-slate-900 text-xl font-bold">
                          {review.type === 'SELF' ? 'Self Reflection' : `${review.type.charAt(0) + review.type.slice(1).toLowerCase()} Review`}
                        </CardTitle>
                        <CardDescription className="text-slate-500 font-medium">
                          Cycle: {review.cycle.name}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100 px-3 py-1">
                        Action Required
                      </Badge>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between pt-4">
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-4 h-4 text-indigo-400" />
                          Due {new Date(review.cycle.endDate).toLocaleDateString()}
                        </div>
                        {review.type !== 'SELF' && (
                          <div className="px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-100">
                            For: {review.reviewee.name}
                          </div>
                        )}
                      </div>
                      <Link href={`/employee/reviews/${review.id}`}>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 px-6">
                          Write Review <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 shadow-sm">
                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-slate-900 text-2xl font-bold">All caught up!</h3>
                <p className="text-slate-500 text-lg max-w-sm mt-2">
                  You've completed all your current review tasks. Great job!
                </p>
              </div>
            )}
          </section>

          {/* History */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-slate-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Completed Reviews</h2>
            </div>
            
            <div className="grid gap-3">
              {completedReviews.map(review => (
                <div key={review.id} className="flex items-center justify-between p-5 rounded-xl bg-white border border-slate-200 group hover:border-indigo-200 hover:bg-indigo-50/10 transition-all shadow-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-base font-bold text-slate-800">
                      {review.cycle.name} — {review.type === 'SELF' ? 'Self Reflection' : 'Manager Assessment'}
                    </span>
                    <span className="text-sm text-slate-400 font-medium">
                      Submitted on {new Date(review.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Link href={`/employee/reviews/${review.id}`}>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 px-4">
                      View Results
                    </Button>
                  </Link>
                </div>
              ))}
              {completedReviews.length === 0 && (
                <p className="text-slate-400 italic text-sm text-center py-4">No completed reviews yet.</p>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Sidebar */}
        <div className="space-y-8">
          <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 border-none shadow-xl text-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Review Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 opacity-90 leading-relaxed">
              <p className="font-medium">Performance reviews are for growth and transparency.</p>
              <ul className="space-y-3">
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 mt-2 shrink-0" />
                  <span>Be specific and objective with examples</span>
                </li>
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 mt-2 shrink-0" />
                  <span>Focus on impact and behaviors, not personality</span>
                </li>
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 mt-2 shrink-0" />
                  <span>Highlight achievements and specific growth areas</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 text-lg font-bold">Help & Resources</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-500 space-y-4">
              <p className="text-sm">Need help writing effective feedback? Check out our Lumina University courses.</p>
              <Button variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 font-bold">
                Feedback Best Practices
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
