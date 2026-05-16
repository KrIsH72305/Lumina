'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function PipDialog({ users }: { users: { id: string, name: string }[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [endDate, setEndDate] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId || !title || !endDate) return toast.error('Please fill in all required fields')

    setIsLoading(true)

    try {
      const res = await fetch('/api/pips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, title, description, endDate, startDate: new Date().toISOString() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to create PIP')
      }

      toast.success('PIP Created!')
      setOpen(false)
      setUserId('')
      setTitle('')
      setDescription('')
      setEndDate('')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200 font-bold px-6">
            <Plus className="w-4 h-4 mr-2" /> Create PIP
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[450px] bg-white border-none shadow-2xl rounded-2xl p-0 overflow-hidden">
        <div className="h-2 bg-rose-500 w-full" />
        <div className="p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">Create PIP</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium pt-1">
              Start a Performance Improvement Plan for a team member.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-6 pt-8">
            <div className="space-y-2">
              <Label htmlFor="userId" className="text-sm font-bold text-slate-700">Select Employee</Label>
              <Select onValueChange={setUserId} value={userId} required>
                <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl h-11 focus:ring-rose-500/20">
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id} className="text-slate-700 font-medium">{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-bold text-slate-700">Plan Title</Label>
              <Input
                id="title"
                placeholder="e.g. Communication Performance Plan"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl h-11 focus:ring-rose-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-bold text-slate-700">Target End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl h-11 focus:ring-rose-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-bold text-slate-700">Objectives & Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the performance gap and the desired outcomes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px] bg-slate-50 border-slate-200 text-slate-900 rounded-xl focus:ring-rose-500/20"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-8 shadow-lg shadow-rose-200">
                {isLoading ? 'Creating...' : 'Launch PIP'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
