'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Goal = {
  id: string;
  employeeId: string;
  thrustArea: string;
  title: string;
  description: string | null;
  uomType: string;
  target: number;
  weightage: number;
  status: string;
  lockedAt: Date | null;
  isShared: boolean;
  primaryOwnerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function GoalReviewClient({ employeeId, initialGoals }: { employeeId: string, initialGoals: Goal[] }) {
  const router = useRouter()
  const [goals, setGoals] = useState(initialGoals)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reworkComment, setReworkComment] = useState('')

  const handleInlineEdit = (id: string, field: 'target' | 'weightage', value: string) => {
    const numValue = Number(value)
    if (isNaN(numValue)) return

    setGoals(goals.map(g => g.id === id ? { ...g, [field]: numValue } : g))
  }

  const handleAction = async (action: 'APPROVE' | 'REWORK') => {
    if (action === 'REWORK' && !reworkComment.trim()) {
      toast.error('Rework comment is required')
      return
    }

    const totalWeightage = goals.reduce((sum, g) => sum + g.weightage, 0)
    if (action === 'APPROVE' && totalWeightage !== 100) {
      toast.error(`Total weightage must be exactly 100% to approve. Currently: ${totalWeightage}%`)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/goals/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          goals,
          action,
          reworkComment: action === 'REWORK' ? reworkComment : undefined
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Action failed')
      }

      toast.success(action === 'APPROVE' ? 'Goals approved successfully' : 'Goals sent back for rework')
      router.push('/manager')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isAllApproved = goals.length > 0 && goals.every(g => g.status === 'APPROVED')
  const totalWeightage = goals.reduce((sum, g) => sum + g.weightage, 0)

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border-gray-200">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title & Area</TableHead>
                <TableHead>Measurement</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Weightage (%)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {goals.map((goal) => (
                <TableRow key={goal.id}>
                  <TableCell>
                    <div className="font-medium">{goal.title}</div>
                    <div className="text-xs text-gray-500">{goal.thrustArea}</div>
                  </TableCell>
                  <TableCell>{goal.uomType}</TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      value={goal.target}
                      onChange={(e) => handleInlineEdit(goal.id, 'target', e.target.value)}
                      disabled={isAllApproved || goal.status === 'APPROVED'}
                      className="w-24 h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      value={goal.weightage}
                      onChange={(e) => handleInlineEdit(goal.id, 'weightage', e.target.value)}
                      disabled={isAllApproved || goal.status === 'APPROVED'}
                      className="w-20 h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant={goal.status === 'APPROVED' ? 'default' : goal.status === 'REWORK' ? 'destructive' : 'secondary'}>
                      {goal.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {goals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    This employee has not created any goals yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {goals.length > 0 && (
            <div className="mt-4 flex justify-end">
              <div className="text-sm font-medium">
                Total Weightage: <span className={totalWeightage === 100 ? 'text-green-600' : 'text-red-600'}>{totalWeightage}%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {!isAllApproved && goals.length > 0 && (
        <Card className="shadow-sm border-gray-200">
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Rework Comment (Required for Return)</label>
              <Textarea 
                placeholder="Explain what needs to be changed..." 
                value={reworkComment}
                onChange={(e) => setReworkComment(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Button 
                onClick={() => handleAction('APPROVE')} 
                disabled={isSubmitting || totalWeightage !== 100}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve All & Lock
              </Button>
              <Button 
                variant="destructive"
                onClick={() => handleAction('REWORK')} 
                disabled={isSubmitting || !reworkComment.trim()}
              >
                Return for Rework
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
