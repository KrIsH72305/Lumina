'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  ShieldAlert, 
  Settings2, 
  RefreshCw, 
  User, 
  Mail, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  Loader2,
  Clock,
  RotateCcw,
  Trash2
} from 'lucide-react'

interface EscalationRule {
  id: string
  triggerType: string
  nDays: number
  isActive: boolean
}

interface EscalationLog {
  id: string
  triggerType: string
  employee: { name: string; email: string } | null
  manager: { name: string; email: string } | null
  details: string
  escalationLevel: number
  status: string
  createdAt: string
  resolvedAt: string | null
}

export function EscalationManager() {
  const [rules, setRules] = useState<EscalationRule[]>([])
  const [logs, setLogs] = useState<EscalationLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)

  // Fetch current rules and logs
  const fetchData = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/escalation')
      if (!res.ok) throw new Error('Failed to fetch escalation data')
      const data = await res.json()
      setRules(data.rules)
      setLogs(data.logs)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Update rule configurations
  const handleUpdateRule = async (ruleId: string, nDays: number, isActive: boolean) => {
    try {
      const res = await fetch('/api/admin/escalation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_RULE',
          ruleId,
          nDays,
          isActive
        })
      })

      if (!res.ok) throw new Error('Failed to update rule')
      toast.success('Escalation rule configuration updated!')
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  // Manually evaluate rules
  const handleEvaluateRules = async () => {
    setIsEvaluating(true)
    try {
      const res = await fetch('/api/admin/escalation', {
        method: 'POST',
      })

      if (!res.ok) throw new Error('Failed to evaluate rules')
      const data = await res.json()
      
      if (data.triggeredCount > 0) {
        toast.success(`Rule evaluation complete! Triggered ${data.triggeredCount} new active escalations.`)
      } else {
        toast.info('Rule evaluation complete! No new escalations needed (all active delinquencies already logged).')
      }
      
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsEvaluating(false)
    }
  }

  // Resolve escalation log
  const handleResolveLog = async (logId: string) => {
    try {
      const res = await fetch('/api/admin/escalation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RESOLVE_LOG',
          logId
        })
      })

      if (!res.ok) throw new Error('Failed to resolve escalation log')
      toast.success('Escalation logged as RESOLVED!')
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  // Reset escalation system
  const handleResetSystem = async () => {
    if (!window.confirm('Are you sure you want to reset the escalation system? This will delete all active escalation logs and restore default configurations.')) {
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/escalation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RESET'
        })
      })

      if (!res.ok) throw new Error('Failed to reset escalation system')
      toast.success('Escalation system successfully reset to defaults!')
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const getTriggerLabel = (type: string) => {
    switch (type) {
      case 'EMPLOYEE_GOALS_NOT_SUBMITTED':
        return 'Goal Submission Delinquency'
      case 'MANAGER_GOALS_NOT_APPROVED':
        return 'Overdue Goal Approvals'
      case 'QUARTERLY_CHECKIN_NOT_COMPLETED':
        return 'Outstanding Quarterly Check-ins'
      default:
        return type
    }
  }

  const getLevelBadge = (level: number) => {
    switch (level) {
      case 1:
        return <Badge className="bg-blue-50 text-blue-700 border border-blue-200">Level 1: Employee Alert</Badge>
      case 2:
        return <Badge className="bg-amber-50 text-amber-700 border border-amber-200">Level 2: Manager Escalated</Badge>
      case 3:
        return <Badge className="bg-rose-50 text-rose-700 border border-rose-200 font-bold">Level 3: HR Intervention</Badge>
      default:
        return <Badge>Level {level}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Configure Rules Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-indigo-600" />
            Rule-Based Escalation System
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            Configure triggers, track automated notifications, and review skip-level escalation records.
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData} 
            disabled={isLoading}
            className="border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
            title="Refresh logs"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleResetSystem} 
            disabled={isLoading}
            className="border-rose-200 text-rose-600 font-bold hover:bg-rose-50 hover:text-rose-700 flex items-center gap-1.5 shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reset System
          </Button>
          <Button 
            size="sm" 
            onClick={handleEvaluateRules} 
            disabled={isEvaluating}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 shadow-md shadow-indigo-100"
          >
            {isEvaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
            Evaluate Escalation Rules
          </Button>
        </div>
      </div>

      {/* Rules Config Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {rules.map(rule => (
          <Card key={rule.id} className="shadow-sm bg-white border border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge variant={rule.isActive ? 'default' : 'secondary'} className={rule.isActive ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' : 'bg-slate-100 text-slate-400'}>
                  {rule.isActive ? 'Active' : 'Disabled'}
                </Badge>
                <Settings2 className="w-4 h-4 text-slate-400" />
              </div>
              <CardTitle className="text-base font-bold text-slate-900 mt-2">
                {getTriggerLabel(rule.triggerType)}
              </CardTitle>
              <CardDescription className="text-xs font-medium text-slate-400">
                Triggered for all employees meeting this rule.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-slate-600">Days allowed:</span>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    value={rule.nDays} 
                    onChange={e => {
                      const updatedDays = Number(e.target.value)
                      setRules(rules.map(r => r.id === rule.id ? { ...r, nDays: updatedDays } : r))
                    }}
                    className="w-20 text-center font-bold text-slate-700"
                  />
                  <span className="text-xs font-medium text-slate-400">days</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleUpdateRule(rule.id, rule.nDays, !rule.isActive)}
                  className="flex-1 font-bold text-xs"
                >
                  {rule.isActive ? 'Disable Rule' : 'Enable Rule'}
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handleUpdateRule(rule.id, rule.nDays, rule.isActive)}
                  className="flex-1 bg-slate-950 text-white font-bold text-xs hover:bg-slate-800"
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Escalation Log Section */}
      <Card className="shadow-md bg-white border border-slate-200 overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 py-6">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-indigo-600" />
              Escalation Logs & Notifications
            </CardTitle>
            <CardDescription className="text-xs font-medium text-slate-500">
              Audit trail of rule evaluations, auto-alerts sent, and HR skip-level interventions.
            </CardDescription>
          </div>
          <Badge className="bg-indigo-600 text-white font-bold px-3 py-1">
            {logs.filter(l => l.status === 'PENDING_ACTION').length} Active Alerts
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          {logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400 font-bold border-b border-slate-100">
                    <th className="py-4 px-6">Trigger & Details</th>
                    <th className="py-4 px-6">Escalated Parties</th>
                    <th className="py-4 px-6">Level</th>
                    <th className="py-4 px-6">Timeline</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-5 px-6 max-w-sm">
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            {getTriggerLabel(log.triggerType)}
                          </span>
                          <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                            {log.details}
                          </p>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="space-y-3">
                          {log.employee && (
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-bold">{log.employee.name}</span>
                              <span className="text-slate-400">({log.employee.email})</span>
                            </div>
                          )}
                          {log.manager && (
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-bold text-slate-600">Mgr: {log.manager.name}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        {getLevelBadge(log.escalationLevel)}
                      </td>
                      <td className="py-5 px-6 text-xs text-slate-500 font-medium">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Escalated: {new Date(log.createdAt).toLocaleString()}</span>
                          </div>
                          {log.resolvedAt && (
                            <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Resolved: {new Date(log.resolvedAt).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        {log.status === 'RESOLVED' ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 font-bold">
                            Resolved
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-50 text-rose-700 border border-rose-100 px-3 py-1 font-bold animate-pulse">
                            Pending Action
                          </Badge>
                        )}
                      </td>
                      <td className="py-5 px-6 text-right">
                        {log.status !== 'RESOLVED' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleResolveLog(log.id)}
                            className="text-xs font-bold text-emerald-600 border-emerald-100 hover:bg-emerald-50"
                          >
                            Resolve Alert
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="font-bold text-slate-800 text-lg">System Fully Compliant</h3>
              <p className="text-slate-400 font-medium text-xs max-w-xs mx-auto mt-1 leading-relaxed">
                All goal submissions, manager approvals, and quarterly check-ins are perfectly on track!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
