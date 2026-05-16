'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Megaphone, Loader2 } from 'lucide-react'

export function AdminPushKpi() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    thrustArea: 'Operations',
    uomType: 'NUMERIC_MAX',
    target: 0,
  })

  const handlePush = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const res = await fetch('/api/admin/push-kpi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Failed to push KPI')

      toast.success('Departmental KPI pushed to all employees!')
      setFormData({ title: '', thrustArea: 'Operations', uomType: 'NUMERIC_MAX', target: 0 })
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="shadow-lg border-indigo-100 bg-indigo-50/30">
      <CardHeader>
        <CardTitle className="text-indigo-900 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-indigo-600" />
          Push Departmental KPI
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePush} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-indigo-700 uppercase">KPI Title</label>
              <Input 
                placeholder="e.g. Org-wide Safety Compliance" 
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-indigo-700 uppercase">Target</label>
              <Input 
                type="number"
                value={formData.target}
                onChange={e => setFormData({ ...formData, target: Number(e.target.value) })}
                required
                className="bg-white"
              />
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Push to All Employees
          </Button>
          <p className="text-[10px] text-indigo-400 font-medium italic text-center">
            * This goal will appear in all employee draft lists. They can adjust weightage but title/target will be fixed.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
