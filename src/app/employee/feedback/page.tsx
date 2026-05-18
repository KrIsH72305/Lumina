'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { MessageSquareHeart, Star, Send, Users, ChevronRight, MessageSquarePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FeedbackDialog } from '@/components/employee/feedback-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

export default function FeedbackPage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState('received')
  const [received, setReceived] = useState<any[]>([])
  const [given, setGiven] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') redirect('/')
    if (status === 'authenticated') {
      fetchData()
    }
  }, [status])

  async function fetchData() {
    setIsLoading(true)
    try {
      const [resRec, resGiven, resUsers] = await Promise.all([
        fetch('/api/feedback/received'),
        fetch('/api/feedback/given'),
        fetch('/api/users')
      ])

      const [dataRec, dataGiven, dataUsers] = await Promise.all([
        resRec.json(),
        resGiven.json(),
        resUsers.json()
      ])

      setReceived(dataRec)
      setGiven(dataGiven)
      setUsers(dataUsers.filter((u: any) => u.id !== session?.user.id))
    } catch (error) {
      console.error('Error fetching feedback:', error)
      toast.error('Failed to load feedback')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) return <div className="p-8 text-slate-500 font-medium">Loading workspace...</div>

  return (
    <div className="flex flex-col min-h-full pb-20">
      {/* Premium Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 -mx-0 px-10 py-16 flex items-center justify-between shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl border-2 border-white/30 text-white flex items-center justify-center shadow-2xl">
            <MessageSquareHeart className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-white tracking-tight">Feedback Hub</h1>
            <p className="text-rose-50 text-lg font-medium opacity-90">Give praise, request insights, and grow together.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <Button 
            variant="outline" 
            className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 font-bold px-6 h-12 shadow-sm"
            onClick={() => toast.info("Request feedback feature coming soon!")}
          >
            <MessageSquarePlus className="w-4 h-4 mr-2" /> Request Feedback
          </Button>
          <FeedbackDialog users={users} />
        </div>
      </div>

      <div className="p-10 max-w-5xl mx-auto w-full space-y-10">
        <Tabs defaultValue="received" className="w-full" onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-8">
            <TabsList className="bg-slate-100 p-1 rounded-2xl">
              <TabsTrigger value="received" className="rounded-xl px-8 py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm transition-all">
                Received <Badge className="ml-2 bg-rose-50 text-rose-600 border-0">{received.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="given" className="rounded-xl px-8 py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm transition-all">
                Given <Badge className="ml-2 bg-slate-200 text-slate-600 border-0">{given.length}</Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="received" className="mt-0">
            {received.length === 0 ? (
               <Card className="border-2 border-dashed border-slate-200 bg-white p-20 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                    <Star className="w-8 h-8 text-slate-200" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">No feedback received yet</h3>
                  <p className="text-slate-400 mt-2 max-w-sm font-medium">Request feedback from your peers or manager to jumpstart your growth journey.</p>
               </Card>
            ) : (
              <div className="grid gap-6">
                {received.map(item => (
                  <Card key={item.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
                    <CardContent className="p-8 flex gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${item.fromUser.name}`} className="w-10 h-10" alt="avatar" />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                             <h4 className="font-bold text-slate-900 text-lg">{item.fromUser.name}</h4>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                          <Badge className="bg-rose-50 text-rose-600 border-rose-100 font-bold px-3 py-1">
                            {item.visibility === 'PUBLIC' ? 'Public Praise' : 'Private to Manager'}
                          </Badge>
                        </div>
                        <p className="text-slate-600 text-lg leading-relaxed font-medium italic">"{item.content}"</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="given" className="mt-0">
            {given.length === 0 ? (
               <Card className="border-2 border-dashed border-slate-200 bg-white p-20 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                    <Send className="w-8 h-8 text-slate-200" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">You haven't given feedback yet</h3>
                  <p className="text-slate-400 mt-2 max-w-sm font-medium">Recognize a teammate's hard work today!</p>
               </Card>
            ) : (
              <div className="grid gap-6">
                {given.map(item => (
                  <Card key={item.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden opacity-90">
                    <CardContent className="p-8 flex gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${item.toUser.name}`} className="w-10 h-10" alt="avatar" />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                             <h4 className="font-bold text-slate-900 text-lg">Sent to {item.toUser.name}</h4>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                          <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 font-bold px-3 py-1 uppercase">
                            Sent
                          </Badge>
                        </div>
                        <p className="text-slate-500 text-lg leading-relaxed font-medium italic">"{item.content}"</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
