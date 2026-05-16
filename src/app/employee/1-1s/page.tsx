import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { MessageSquare, Calendar, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OneOnOneDialog } from '@/components/employee/one-on-one-dialog'

export default async function OneOnOnesPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'EMPLOYEE') {
    redirect('/')
  }

  // Get current user and manager
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { manager: true }
  })

  const managerId = currentUser?.managerId

  // Fetch OneOnOnes
  const meetings = managerId ? await prisma.oneOnOne.findMany({
    where: { employeeId: session.user.id, managerId: managerId },
    orderBy: { date: 'desc' }
  }) : []

  return (
    <div className="flex flex-col min-h-full">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-500 to-fuchsia-400 px-8 py-10 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shadow-sm">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">1:1 Meetings</h1>
            <p className="text-purple-50 mt-1">Sync with {currentUser?.manager?.name || 'your manager'}</p>
          </div>
        </div>
        <OneOnOneDialog />
      </div>

      <div className="flex-1 bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Meeting History</h2>
            </div>
            
            {meetings.length === 0 ? (
              <div className="py-16 text-center">
                <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No 1:1 meetings scheduled.</p>
                <p className="text-gray-400 text-sm mt-1">Click the button above to schedule your first sync.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {meetings.map((meeting) => (
                  <div key={meeting.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900">Sync with {currentUser?.manager?.name}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1 font-medium">
                          <Calendar className="w-3 h-3" /> {new Date(meeting.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">View Notes</Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Talking Points</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{meeting.talkingPoints || 'No talking points added.'}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Action Items</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{meeting.actionItems || 'No action items recorded.'}</p>
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
