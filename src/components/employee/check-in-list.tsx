'use client'

import { useState } from 'react'
import { Goal, CheckIn } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type GoalWithCheckIns = Goal & { checkIns: CheckIn[] }

export function CheckInList({ goals, currentQuarter }: { goals: GoalWithCheckIns[], currentQuarter: string }) {
  const router = useRouter()
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)
  
  // Form states
  const [actualAchievement, setActualAchievement] = useState<number | ''>('')
  const [goalStatus, setGoalStatus] = useState<string>('ON_TRACK')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSave = async (goalId: string) => {
    if (actualAchievement === '') {
      toast.error('Please enter actual achievement')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/check-ins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalId,
          quarter: currentQuarter,
          actualAchievement: Number(actualAchievement),
          goalStatus,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to save check-in')
      }

      toast.success('Check-in saved successfully')
      setEditingGoalId(null)
      setActualAchievement('')
      setGoalStatus('ON_TRACK')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (goals.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          You don't have any approved goals to check in yet.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {goals.map(goal => {
        const checkIn = goal.checkIns.find(c => c.quarter === currentQuarter)
        const isEditing = editingGoalId === goal.id

        return (
          <Card key={goal.id} className="shadow-sm">
            <CardHeader className="pb-3 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{goal.title}</CardTitle>
                  <p className="text-sm text-gray-500">{goal.thrustArea} | Weightage: {goal.weightage}%</p>
                </div>
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={() => {
                    setEditingGoalId(goal.id)
                    setActualAchievement(checkIn ? checkIn.actualAchievement : '')
                    setGoalStatus(checkIn ? checkIn.goalStatus : 'ON_TRACK')
                  }}>
                    {checkIn ? 'Edit Check-in' : 'Add Check-in'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <span className="block text-gray-500">Target</span>
                  <span className="font-semibold">{goal.target} {goal.uomType}</span>
                </div>
                {checkIn && !isEditing && (
                  <>
                    <div>
                      <span className="block text-gray-500">Actual Achievement</span>
                      <span className="font-semibold">{checkIn.actualAchievement}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500">Progress Score</span>
                      <span className="font-semibold text-blue-600">{checkIn.progressScore}%</span>
                    </div>
                    <div>
                      <span className="block text-gray-500">Status</span>
                      <span className="font-semibold">{checkIn.goalStatus.replace('_', ' ')}</span>
                    </div>
                  </>
                )}
              </div>

              {isEditing && (
                <div className="bg-gray-50 p-4 rounded-md border mt-4">
                  <h4 className="font-medium mb-4">{currentQuarter} Check-in</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Actual Achievement</label>
                      <Input 
                        type="number" 
                        value={actualAchievement}
                        onChange={(e) => setActualAchievement(e.target.value === '' ? '' : Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Goal Status</label>
                      <Select value={goalStatus} onValueChange={setGoalStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                          <SelectItem value="ON_TRACK">On Track</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleSave(goal.id)} disabled={isSubmitting}>
                      Save Check-in
                    </Button>
                    <Button variant="outline" onClick={() => setEditingGoalId(null)} disabled={isSubmitting}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
