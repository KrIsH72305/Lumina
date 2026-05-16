'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Send, Download, Loader2 } from 'lucide-react'

export function GoalActions({ totalWeightage, hasDrafts }: { totalWeightage: number, hasDrafts: boolean }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (totalWeightage !== 100) {
      toast.error(`Total weightage must be exactly 100%. Current total: ${totalWeightage}%`)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/goals', {
        method: 'PATCH',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to submit')
      }

      toast.success('Goal sheet submitted for approval!')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExport = () => {
    // Basic CSV Export
    window.location.href = '/api/report'
  }

  return (
    <div className="flex items-center gap-3">
      <Button 
        variant="outline" 
        onClick={handleExport}
        className="border-slate-200 text-slate-600 font-bold"
      >
        <Download className="w-4 h-4 mr-2" /> Export Report
      </Button>
      
      {hasDrafts && (
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-100"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          Submit for Approval
        </Button>
      )}
    </div>
  )
}
