import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Mail, MessageSquare, Terminal, ShieldCheck } from 'lucide-react'

export default async function AdminLogsPage() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN')) {
    redirect('/')
  }

  const logs = await prisma.notificationLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  })

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 -mx-8 -mt-8 px-10 py-12 flex items-center justify-between shadow-xl mb-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
            <ShieldCheck className="w-10 h-10 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Integration Audit Logs</h1>
            <p className="text-slate-400 font-medium">Visual proof of Email & Microsoft Teams integrations</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-emerald-50/50 border-emerald-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-900">ACTIVE</div>
            <p className="text-xs text-emerald-600 font-medium mt-1">Simulated via Database & Console logging</p>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50/50 border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-blue-700 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Teams Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-blue-900">ACTIVE</div>
            <p className="text-xs text-blue-600 font-medium mt-1">Adaptive Cards generated & logged</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50/50 border-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-purple-700 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4" /> Auth Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-purple-900">ENTRA ID</div>
            <p className="text-xs text-purple-600 font-medium mt-1">Azure AD Provider configured</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>All automated events triggered by system actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Payload Proof</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Badge variant="outline" className={log.type === 'TEAMS' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}>
                      {log.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{log.recipient}</TableCell>
                  <TableCell className="text-slate-500">{log.subject}</TableCell>
                  <TableCell className="text-xs text-slate-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {log.payload ? (
                      <details className="text-[10px] font-mono bg-slate-50 p-2 rounded cursor-pointer">
                        <summary className="text-blue-600 font-bold">View Card JSON</summary>
                        <pre className="mt-2 overflow-x-auto">{JSON.stringify(JSON.parse(log.payload), null, 2)}</pre>
                      </details>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Standard Email</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-400 italic">
                    No notifications triggered yet. Submit or Approve goals to see logs.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
