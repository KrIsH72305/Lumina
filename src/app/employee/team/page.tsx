import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Mail } from 'lucide-react'

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

  // Get teammates (users sharing the same manager)
  const teammates = currentUser?.managerId ? await prisma.user.findMany({
    where: { managerId: currentUser.managerId, id: { not: session.user.id } }
  }) : []

  return (
    <div className="flex flex-col min-h-full">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-400 px-8 py-10 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shadow-sm">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">My Team</h1>
            <p className="text-blue-50 mt-1">Connect with your peers and manager</p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Manager Section */}
          {currentUser?.manager && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Manager</h2>
              <Card className="max-w-md overflow-hidden hover:shadow-md transition-shadow border-gray-200">
                <CardContent className="p-0 flex items-center">
                  <div className="w-24 h-24 bg-indigo-50 flex items-center justify-center shrink-0 border-r border-gray-100">
                     <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser.manager.name}`} className="w-16 h-16" alt="avatar" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-lg">{currentUser.manager.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <Mail className="w-3 h-3" /> {currentUser.manager.email}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Peers Section */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Peers ({teammates.length})</h2>
            {teammates.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-500 text-sm">No peers found in your team.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teammates.map(member => (
                  <Card key={member.id} className="overflow-hidden hover:shadow-md transition-shadow border-gray-200">
                    <CardContent className="p-0 flex items-center">
                      <div className="w-20 h-20 bg-slate-50 flex items-center justify-center shrink-0 border-r border-gray-100">
                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${member.name}`} className="w-12 h-12" alt="avatar" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 truncate">
                          <Mail className="w-3 h-3" /> {member.email}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  )
}
