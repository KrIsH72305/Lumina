'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Megaphone, Loader2 } from 'lucide-react'

export function AdminPushKpi() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
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
      setFormData({ title: '', description: '', thrustArea: 'Operations', uomType: 'NUMERIC_MAX', target: 0 })
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
              <label className="text-xs font-bold text-indigo-700 uppercase">Thrust Area</label>
              <Select value={formData.thrustArea} onValueChange={v => setFormData({ ...formData, thrustArea: v })}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select Area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Customer Success">Customer Success</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-indigo-700 uppercase">Measurement Type</label>
              <Select value={formData.uomType} onValueChange={v => setFormData({ ...formData, uomType: v })}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NUMERIC_MAX">Maximize (e.g. Revenue, &gt; is better)</SelectItem>
                  <SelectItem value="NUMERIC_MIN">Minimize (e.g. Cost, &lt; is better)</SelectItem>
                  <SelectItem value="TIMELINE">Timeline (Date based)</SelectItem>
                  <SelectItem value="ZERO">Zero (e.g. Safety Incidents)</SelectItem>
                </SelectContent>
              </Select>
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

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-indigo-700 uppercase">Description (Optional)</label>
              <Textarea
                placeholder="Provide more context for this goal..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="bg-white min-h-[80px]"
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
