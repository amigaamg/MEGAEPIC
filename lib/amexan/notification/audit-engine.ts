import { type NotificationAudit } from './types'

const auditLog: NotificationAudit[] = []

export function auditNotification(
  notification: { id: string; userId: string; organizationId: string; title: string; category: string },
  action: string,
  userId: string,
  organizationId: string,
): NotificationAudit {
  const auditEntry: NotificationAudit = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    notificationId: notification.id,
    action,
    userId,
    organizationId,
    timestamp: Date.now(),
    details: {
      title: notification.title,
      category: notification.category,
    },
  }

  auditLog.push(auditEntry)
  return auditEntry
}

export function getAuditLog(notificationId?: string): NotificationAudit[] {
  if (notificationId) {
    return auditLog.filter(a => a.notificationId === notificationId)
  }
  return [...auditLog]
}

export function getAuditLogByUser(userId: string): NotificationAudit[] {
  return auditLog.filter(a => a.userId === userId)
}

export function getAuditLogByOrganization(orgId: string): NotificationAudit[] {
  return auditLog.filter(a => a.organizationId === orgId)
}

export function getAuditLogByAction(action: string): NotificationAudit[] {
  return auditLog.filter(a => a.action === action)
}

export function clearAuditLog(): void {
  auditLog.length = 0
}

export default {
  auditNotification,
  getAuditLog,
  getAuditLogByUser,
  getAuditLogByOrganization,
  getAuditLogByAction,
  clearAuditLog,
}