'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { ChevronLeft, Save, Send, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ReviewFormPage() {
  const router = useRouter()
  const params = useParams()
  const reviewId = params.id

  const [review, setReview] = useState<any>(null)
  const [content, setContent] = useState<any>({ strengths: '', improvements: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function fetchReview() {
      try {
        const res = await fetch(`/api/reviews/${reviewId}`)
        const data = await res.json().catch(() => null)
        
        if (!res.ok || !data) {
          console.error('DEBUG: API Error', res.status, data)
          throw new Error(data?.message || 'Failed to fetch review')
        }
        
        console.log('DEBUG: API Data', data)
        setReview(data)
        if (data.content) {
          try {
            setContent(JSON.parse(data.content))
          } catch (e) {
            setContent({ text: data.content })
          }
        }
      } catch (error: any) {
        toast.error(error.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchReview()
  }, [reviewId])

  async function handleSubmit(status: 'PENDING' | 'SUBMITTED') {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: JSON.stringify(content),
          status
        })
      })

      if (!res.ok) throw new Error('Failed to update review')

      toast.success(status === 'SUBMITTED' ? 'Review submitted!' : 'Draft saved!')
      if (status === 'SUBMITTED') {
        router.push('/employee/reviews')
        router.refresh()
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <div className="p-8 text-slate-500 font-medium">Loading review...</div>
  if (!review) return <div className="p-8 text-slate-500 font-medium">Review not found.</div>

  const isReadOnly = review.status === 'SUBMITTED'

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-6">
        <Link href="/employee/reviews">
          <Button variant="outline" size="icon" className="rounded-full border-slate-200 hover:bg-white hover:border-indigo-300 text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex flex-col">
          <h1 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
            {review.type === 'SELF' ? 'Self Reflection' : `Review for ${review.reviewee.name}`}
          </h1>
          <p className="text-lg text-slate-400 font-medium">{review.cycle.name}</p>
        </div>
      </div>

      <Card className="bg-white border-slate-200 shadow-xl rounded-2xl overflow-hidden">
        <div className="h-2 bg-indigo-600 w-full" />
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-2xl font-bold text-slate-900">Performance Assessment</CardTitle>
          <CardDescription className="text-slate-500 text-base font-medium mt-2">
            {review.type === 'SELF' 
              ? 'Reflect on your achievements, challenges, and growth opportunities during this period.'
              : `Provide constructive, specific feedback to help ${review.reviewee.name} continue their development.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-10">
          <div className="space-y-4">
            <Label htmlFor="strengths" className="text-lg font-bold text-slate-800">Key Accomplishments & Strengths</Label>
            <p className="text-sm text-slate-400">What went well? Highlight specific projects and their impact.</p>
            <Textarea
              id="strengths"
              className="bg-slate-50 border-slate-200 text-slate-900 min-h-[180px] focus:ring-indigo-500/20 focus:border-indigo-400 rounded-xl p-4 text-base leading-relaxed font-medium"
              placeholder="List specific projects, outcomes, or positive behaviors..."
              value={content.strengths}
              onChange={(e) => setContent({ ...content, strengths: e.target.value })}
              readOnly={isReadOnly}
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="improvements" className="text-lg font-bold text-slate-800">Areas for Growth & Development</Label>
            <p className="text-sm text-slate-400">What could have gone better? Where is there room for improvement?</p>
            <Textarea
              id="improvements"
              className="bg-slate-50 border-slate-200 text-slate-900 min-h-[180px] focus:ring-indigo-500/20 focus:border-indigo-400 rounded-xl p-4 text-base leading-relaxed font-medium"
              placeholder="What skills need focus? What challenges were faced?"
              value={content.improvements}
              onChange={(e) => setContent({ ...content, improvements: e.target.value })}
              readOnly={isReadOnly}
            />
          </div>

          {!isReadOnly && (
            <div className="flex items-center justify-end gap-4 pt-8 border-t border-slate-100">
              <Button 
                variant="ghost" 
                className="text-slate-500 hover:text-indigo-600 font-bold px-6"
                onClick={() => handleSubmit('PENDING')}
                disabled={isSubmitting}
              >
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
              <Button 
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 px-8 font-bold"
                onClick={() => handleSubmit('SUBMITTED')}
                disabled={isSubmitting}
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Review
              </Button>
            </div>
          )}
          
          {isReadOnly && (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-base font-bold flex items-center gap-3 shadow-sm">
              <CheckCircle className="w-6 h-6" />
              This review has been submitted and is now read-only.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
