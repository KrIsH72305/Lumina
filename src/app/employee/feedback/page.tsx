import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { MessageSquareHeart, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FeedbackDialog } from '@/components/employee/feedback-dialog'

export default async function FeedbackPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'EMPLOYEE') {
    redirect('/')
  }

  // Fetch Feedback Received
  const feedbackReceived = await prisma.feedback.findMany({
    where: { toUserId: session.user.id },
    include: { fromUser: true },
    orderBy: { createdAt: 'desc' }
  })

  // Fetch all users to give feedback to (excluding self)
  const users = await prisma.user.findMany({
    where: { id: { not: session.user.id } },
    select: { id: true, name: true }
  })

  return (
    <div className="flex flex-col min-h-full">
      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-400 px-8 py-10 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shadow-sm">
            <MessageSquareHeart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Feedback</h1>
            <p className="text-rose-50 mt-1">Continuous performance and peer praise</p>
          </div>
        </div>
        <div className="flex gap-3">
          <FeedbackDialog users={users} />
          <Button variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0 font-medium backdrop-blur-sm">
            Request Feedback
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-6">
              <h2 className="font-bold text-gray-900 border-b-2 border-rose-500 pb-5 -mb-5">Received</h2>
              <h2 className="font-medium text-gray-500 hover:text-gray-900 cursor-pointer pb-5 -mb-5">Given</h2>
            </div>
            
            {feedbackReceived.length === 0 ? (
              <div className="py-20 text-center">
                <Star className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-900 font-bold text-lg">No feedback received yet</p>
                <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">
                  Feedback helps you grow. Don't wait for review season—request feedback from your peers or manager today.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {feedbackReceived.map((feedback) => (
                  <div key={feedback.id} className="p-6 hover:bg-slate-50 transition-colors flex gap-4">
                     <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0 overflow-hidden border border-gray-200">
                      <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${feedback.fromUser.name}`} alt="avatar" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{feedback.fromUser.name}</h3>
                        <span className="text-gray-400 text-sm">•</span>
                        <span className="text-sm text-gray-500">{new Date(feedback.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-rose-600 font-medium uppercase tracking-wider mt-1 mb-3">
                        {feedback.visibility === 'PUBLIC' ? 'Public Praise' : 'Private Feedback'}
                      </p>
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                        {feedback.content}
                      </p>
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
