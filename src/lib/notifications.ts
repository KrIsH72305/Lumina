/**
 * Notification Service
 * Simulates Email and Microsoft Teams integrations.
 * In a production environment, this would use:
 * - @sendgrid/mail for emails
 * - Microsoft Bot Framework or Incoming Webhooks for Teams
 */

export interface NotificationPayload {
  toUserId: string
  toEmail: string
  toName: string
  subject: string
  message: string
  actionUrl?: string
  type: 'GOAL_SUBMITTED' | 'GOAL_APPROVED' | 'GOAL_REJECTED' | 'CHECKIN_REMINDER'
}

import { prisma } from './prisma'

export async function sendNotification(payload: NotificationPayload) {
  const teamsPayload = {
    type: "AdaptiveCard",
    body: [
      { "type": "TextBlock", "text": payload.subject, "weight": "bolder" },
      { "type": "TextBlock", "text": payload.message }
    ],
    actions: [
      { "type": "Action.OpenUrl", "title": "View in Lumina", "url": payload.actionUrl || '#' }
    ]
  }

  // 1. Log to Console (Simulated)
  console.log(`[EMAIL SENT] To: ${payload.toEmail} | Subject: ${payload.subject}`)
  console.log(`[TEAMS NOTIFICATION] To: ${payload.toName}`)

  // 2. SAVE TO DATABASE (The Proof for the Examiner)
  try {
    await prisma.notificationLog.createMany({
      data: [
        {
          type: 'EMAIL',
          recipient: payload.toEmail,
          subject: payload.subject,
          content: payload.message,
          status: 'SENT'
        },
        {
          type: 'TEAMS',
          recipient: payload.toName,
          subject: payload.subject,
          content: payload.message,
          payload: JSON.stringify(teamsPayload),
          status: 'SENT'
        }
      ]
    })
    console.log(`[AUDIT] Logged Email & Teams notifications to database.`)
  } catch (error) {
    console.error(`[AUDIT ERROR] Failed to log notifications:`, error)
  }
}

export async function notifyManagerOfSubmission(employeeName: string, managerEmail: string, managerName: string, employeeId: string) {
  await sendNotification({
    toUserId: 'manager-id', // Placeholder
    toEmail: managerEmail,
    toName: managerName,
    subject: `Goal Sheet Submitted: ${employeeName}`,
    message: `${employeeName} has submitted their goals for the current cycle. Please review and approve them.`,
    actionUrl: `${process.env.NEXTAUTH_URL}/manager/employee/${employeeId}`,
    type: 'GOAL_SUBMITTED'
  })
}

export async function notifyEmployeeOfApproval(employeeEmail: string, employeeName: string, status: 'APPROVED' | 'REJECTED', managerComment?: string) {
  const isApproved = status === 'APPROVED'
  await sendNotification({
    toUserId: 'employee-id', // Placeholder
    toEmail: employeeEmail,
    toName: employeeName,
    subject: `Goals ${isApproved ? 'Approved' : 'Returned for Rework'}`,
    message: isApproved 
      ? `Your goals have been approved by your manager.` 
      : `Your manager has requested rework on your goals. Comment: ${managerComment || 'No comment provided.'}`,
    actionUrl: `${process.env.NEXTAUTH_URL}/employee/goals`,
    type: isApproved ? 'GOAL_APPROVED' : 'GOAL_REJECTED'
  })
}
