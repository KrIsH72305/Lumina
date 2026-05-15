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

export function OneOnOneDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = useState('')
  const [talkingPoints, setTalkingPoints] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!date) return toast.error('Please select a date')

    setIsLoading(true)

    try {
      const res = await fetch('/api/1-1s', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, talkingPoints }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to schedule 1:1')
      }

      toast.success('1:1 Scheduled!')
      setOpen(false)
      setDate('')
      setTalkingPoints('')
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
          <Button variant="secondary" className="bg-white text-purple-700 hover:bg-gray-50 border-0 font-medium">
            <Plus className="w-4 h-4 mr-2" /> Schedule 1:1
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule a 1:1</DialogTitle>
          <DialogDescription>
            Set up a sync with your manager and add initial talking points.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="talkingPoints">Talking Points</Label>
            <Textarea
              id="talkingPoints"
              placeholder="What would you like to discuss?"
              value={talkingPoints}
              onChange={(e) => setTalkingPoints(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Scheduling...' : 'Schedule Sync'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
