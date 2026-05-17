import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Helper to calculate difference in days
const getDaysDifference = (dateA: Date, dateB: Date) => {
  const diffTime = Math.abs(dateB.getTime() - dateA.getTime())
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return new Response('Unauthorized', { status: 401 })
    }

    const rules = await prisma.escalationRule.findMany()
    const logs = await prisma.escalationLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        employee: {
          select: { id: true, name: true, email: true }
        },
        manager: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json({ rules, logs })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { action } = body

    if (action === 'RESOLVE_LOG') {
      const { logId } = body
      const updatedLog = await prisma.escalationLog.update({
        where: { id: logId },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date()
        }
      })
      return NextResponse.json({ success: true, log: updatedLog })
    }

    if (action === 'UPDATE_RULE') {
      const { ruleId, nDays, isActive } = body
      const updatedRule = await prisma.escalationRule.update({
        where: { id: ruleId },
        data: {
          nDays: parseInt(nDays),
          isActive
        }
      })
      return NextResponse.json({ success: true, rule: updatedRule })
    }

    if (action === 'RESET') {
      await prisma.escalationLog.deleteMany()
      
      await prisma.escalationRule.updateMany({
        where: { id: 'rule-employee-goals-not-submitted' },
        data: { nDays: 5, isActive: true }
      })
      await prisma.escalationRule.updateMany({
        where: { id: 'rule-manager-goals-not-approved' },
        data: { nDays: 3, isActive: true }
      })
      await prisma.escalationRule.updateMany({
        where: { id: 'rule-quarterly-checkin-not-completed' },
        data: { nDays: 7, isActive: true }
      })

      await prisma.notificationLog.deleteMany({
        where: {
          OR: [
            { subject: { contains: 'Goal Setting Deadline' } },
            { subject: { contains: 'Goals Pending Submission' } },
            { subject: { contains: 'Goal Submission Delinquent' } },
            { subject: { contains: 'Pending Goal Approvals' } },
            { subject: { contains: 'Goal Approvals for' } },
            { subject: { contains: 'Critical Overdue Goal Approvals' } },
            { subject: { contains: 'Quarterly Check-in' } },
          ]
        }
      })

      return NextResponse.json({ success: true })
    }

    return new Response('Invalid action', { status: 400 })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return new Response('Unauthorized', { status: 401 })
    }

    const rules = await prisma.escalationRule.findMany({ where: { isActive: true } })
    const today = new Date()
    const activeCycle = await prisma.cycle.findFirst({
      where: {
        isActive: true,
        windowOpen: { lte: today },
        windowClose: { gte: today }
      }
    })
    const employees = await prisma.user.findMany({
      where: { role: 'EMPLOYEE' },
      include: {
        manager: true,
        goals: {
          include: { checkIns: true }
        }
      }
    })

    let triggeredCount = 0

    for (const rule of rules) {
      // 1. Trigger: EMPLOYEE_GOALS_NOT_SUBMITTED
      if (rule.triggerType === 'EMPLOYEE_GOALS_NOT_SUBMITTED' && activeCycle && activeCycle.phase === 'GOAL_SETTING') {
        const daysElapsed = getDaysDifference(activeCycle.windowOpen, today)
        if (daysElapsed >= rule.nDays) {
          // Determine escalation level
          let level = 1
          if (daysElapsed >= rule.nDays + 4) level = 3
          else if (daysElapsed >= rule.nDays + 2) level = 2

          for (const emp of employees) {
            // Check if employee has submitted goals (status PENDING_APPROVAL or APPROVED sum = 100)
            const submittedWeight = emp.goals
              .filter(g => g.status === 'PENDING_APPROVAL' || g.status === 'APPROVED')
              .reduce((sum, g) => sum + g.weightage, 0)

            if (submittedWeight < 100) {
              // Check if we already logged this level
              const existingLog = await prisma.escalationLog.findFirst({
                where: {
                  employeeId: emp.id,
                  triggerType: rule.triggerType,
                  escalationLevel: level,
                  status: 'PENDING_ACTION'
                }
              })

              if (!existingLog) {
                const details = `${emp.name} has not finalized/submitted goals (Current progress: ${submittedWeight}% weightage submitted). Goal Setting cycle opened ${daysElapsed} days ago.`
                
                await prisma.escalationLog.create({
                  data: {
                    triggerType: rule.triggerType,
                    employeeId: emp.id,
                    managerId: emp.managerId,
                    details,
                    escalationLevel: level,
                    status: 'PENDING_ACTION'
                  }
                })

                // Create Auto-Notification
                let recipient = emp.email
                let subject = `[Action Required] Goal Setting Deadline Exceeded`
                let content = `Dear ${emp.name},\n\nYour goal setting window opened ${daysElapsed} days ago and your goals have not been fully submitted. Please complete goal planning immediately.`
                
                if (level === 2 && emp.manager) {
                  recipient = `${emp.email}, ${emp.manager.email}`
                  subject = `[Escalation Level 2] Action Required: ${emp.name}'s Goals Pending Submission`
                  content = `Dear ${emp.manager.name},\n\nYour team member ${emp.name} has not submitted their goals. This is an escalated alert (Level 2). Please follow up with them immediately.`
                } else if (level === 3) {
                  recipient = `hr@lumina.corp, ${emp.manager?.email || ''}`
                  subject = `[Escalation Level 3 - Skip-level/HR] Critical Alert: ${emp.name} Goal Submission Delinquent`
                  content = `Dear HR and Skip-Level Management,\n\n${emp.name} has exceeded the goal setting window by ${daysElapsed} days with outstanding goals. Skip-level review is requested.`
                }

                await prisma.notificationLog.create({
                  data: {
                    type: 'EMAIL',
                    recipient,
                    subject,
                    content,
                    status: 'SENT'
                  }
                })

                triggeredCount++
              }
            }
          }
        }
      }

      // 2. Trigger: MANAGER_GOALS_NOT_APPROVED
      if (rule.triggerType === 'MANAGER_GOALS_NOT_APPROVED') {
        for (const emp of employees) {
          const pendingGoals = emp.goals.filter(g => g.status === 'PENDING_APPROVAL')
          if (pendingGoals.length > 0) {
            // Check the oldest pending goal's submission date
            const oldestPending = pendingGoals.reduce((oldest, current) => {
              return current.updatedAt < oldest.updatedAt ? current : oldest
            }, pendingGoals[0])

            const daysElapsed = getDaysDifference(oldestPending.updatedAt, today)
            if (daysElapsed >= rule.nDays) {
              let level = 1
              if (daysElapsed >= rule.nDays + 4) level = 3
              else if (daysElapsed >= rule.nDays + 2) level = 2

              const existingLog = await prisma.escalationLog.findFirst({
                where: {
                  employeeId: emp.id,
                  triggerType: rule.triggerType,
                  escalationLevel: level,
                  status: 'PENDING_ACTION'
                }
              })

              if (!existingLog) {
                const details = `Manager has not approved goals submitted by ${emp.name} (${daysElapsed} days elapsed since submission).`
                
                await prisma.escalationLog.create({
                  data: {
                    triggerType: rule.triggerType,
                    employeeId: emp.id,
                    managerId: emp.managerId,
                    details,
                    escalationLevel: level,
                    status: 'PENDING_ACTION'
                  }
                })

                let recipient = emp.manager?.email || 'hr@lumina.corp'
                let subject = `[Action Required] Pending Goal Approvals for ${emp.name}`
                let content = `Dear Manager,\n\nYou have pending goals from ${emp.name} submitted ${daysElapsed} days ago requiring your review and approval.`

                if (level === 2 && emp.manager) {
                  recipient = `${emp.manager.email}, hr@lumina.corp`
                  subject = `[Escalation Level 2] Action Required: Goal Approvals for ${emp.name} Overdue`
                  content = `Dear Manager and Skip-Level,\n\nThe approval for ${emp.name}'s goals is outstanding for ${daysElapsed} days. This is a Level 2 Escalation.`
                } else if (level === 3) {
                  recipient = `hr@lumina.corp`
                  subject = `[Escalation Level 3 - HR] Critical Overdue Goal Approvals for ${emp.name}`
                  content = `Dear HR Administration,\n\nManager review for ${emp.name}'s goals is overdue by ${daysElapsed} days. Immediate administrative intervention required.`
                }

                await prisma.notificationLog.create({
                  data: {
                    type: 'EMAIL',
                    recipient,
                    subject,
                    content,
                    status: 'SENT'
                  }
                })

                triggeredCount++
              }
            }
          }
        }
      }

      // 3. Trigger: QUARTERLY_CHECKIN_NOT_COMPLETED
      if (rule.triggerType === 'QUARTERLY_CHECKIN_NOT_COMPLETED' && activeCycle && activeCycle.phase.startsWith('CHECK_IN')) {
        const daysRemaining = getDaysDifference(today, activeCycle.windowClose)
        const isPastWindow = today > activeCycle.windowClose
        
        // Trigger if we are close to the closing window or past it
        if (daysRemaining <= rule.nDays || isPastWindow) {
          let level = 1
          if (isPastWindow) level = 3
          else if (daysRemaining <= 2) level = 2

          // Map cycle phase to quarter
          let quarter = 'Q1'
          if (activeCycle.phase === 'CHECK_IN_Q2') quarter = 'Q2'
          else if (activeCycle.phase === 'CHECK_IN_Q3') quarter = 'Q3'
          else if (activeCycle.phase === 'CHECK_IN_Q4') quarter = 'Q4_ANNUAL'

          for (const emp of employees) {
            const approvedGoals = emp.goals.filter(g => g.status === 'APPROVED')
            if (approvedGoals.length > 0) {
              // Check if all approved goals have a check-in for this quarter
              const missingCheckIn = approvedGoals.some(g => {
                return !g.checkIns.some(c => c.quarter === quarter)
              })

              if (missingCheckIn) {
                const existingLog = await prisma.escalationLog.findFirst({
                  where: {
                    employeeId: emp.id,
                    triggerType: rule.triggerType,
                    escalationLevel: level,
                    status: 'PENDING_ACTION'
                  }
                })

                if (!existingLog) {
                  const details = `${emp.name} has missing quarterly check-ins for ${quarter}. Active cycle window closes in ${daysRemaining} days (or is closed).`
                  
                  await prisma.escalationLog.create({
                    data: {
                      triggerType: rule.triggerType,
                      employeeId: emp.id,
                      managerId: emp.managerId,
                      details,
                      escalationLevel: level,
                      status: 'PENDING_ACTION'
                    }
                  })

                  let recipient = emp.email
                  let subject = `[Reminder] Missing Quarterly Check-in (${quarter})`
                  let content = `Dear ${emp.name},\n\nYou have not completed quarterly check-ins for all your approved goals. The window is closing in ${daysRemaining} days. Please complete immediately.`

                  if (level === 2 && emp.manager) {
                    recipient = `${emp.email}, ${emp.manager.email}`
                    subject = `[Escalation Level 2] Action Required: ${emp.name} Quarterly Check-in Outstanding`
                    content = `Dear ${emp.manager.name},\n\nYour team member ${emp.name} has outstanding quarterly check-ins. The window closes in ${daysRemaining} days.`
                  } else if (level === 3) {
                    recipient = `hr@lumina.corp, ${emp.manager?.email || ''}`
                    subject = `[Escalation Level 3 - HR] Critical Outstanding Quarterly Check-ins: ${emp.name}`
                    content = `Dear HR and Skip-level,\n\n${emp.name} failed to submit quarterly check-ins before the closing deadline. HR resolution is required.`
                  }

                  await prisma.notificationLog.create({
                    data: {
                      type: 'EMAIL',
                      recipient,
                      subject,
                      content,
                      status: 'SENT'
                    }
                  })

                  triggeredCount++
                }
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, triggeredCount })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
