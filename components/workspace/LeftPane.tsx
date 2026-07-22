'use client'

import type { PaneProps } from '@/lib/amexan/workspace'
import { Users, Clock, AlertTriangle, ListTodo, Bell } from 'lucide-react'

export default function LeftPane({ session, onNavigate }: PaneProps) {
  const items = getPaneItems(session.assignmentType)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--surface-border)' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{session.assignmentTitle || 'Workspace'}</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginTop: 2 }}>
          {session.departmentName} · {session.location}
        </span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 8 }}>
        {items.map((section, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '4px 8px', marginBottom: 4 }}>
              {section.label}
              {section.count !== undefined && (
                <span style={{ marginLeft: 6, background: 'var(--sky-50)', color: 'var(--primary)', borderRadius: 8, padding: '0 6px', fontSize: 10, fontWeight: 700 }}>
                  {section.count}
                </span>
              )}
            </div>
            {section.items.map((item, j) => (
              <button key={j} onClick={() => item.action && onNavigate(item.action)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 10px', borderRadius: 8, border: 'none',
                  background: item.active ? 'var(--sky-50)' : 'transparent',
                  color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left',
                  fontSize: 12, fontFamily: 'var(--font-sans)',
                  borderLeft: item.active ? '3px solid var(--primary)' : '3px solid transparent',
                }}>
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontWeight: 500, display: 'block' }}>{item.label}</span>
                  {item.subtitle && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.subtitle}</span>}
                </div>
                {item.badge && (
                  <span style={{
                    minWidth: 18, height: 18, borderRadius: 9,
                    background: item.badgeColor ?? 'var(--sky-50)',
                    color: item.badgeColor ? 'white' : 'var(--primary)',
                    fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

interface PaneSection {
  label: string;
  count?: number;
  items: {
    label: string;
    icon: string;
    action: string;
    badge?: number;
    badgeColor?: string;
    subtitle?: string;
    active: boolean;
  }[];
}

function getPaneItems(assignmentType: string): PaneSection[] {
  const common = {
    ward_round: {
      sections: [
        { label: 'Ward Patients', icon: '🛏️', action: '/workflow/queue', count: 12 },
        { label: 'Task Board', icon: '📋', action: '/workflow/tasks', count: 5 },
        { label: 'Escalations', icon: '🔔', action: '/workflow/escalation', count: 2 },
      ],
    },
    clinic: {
      sections: [
        { label: 'Clinic Queue', icon: '👥', action: '/workflow/queue', count: 8 },
        { label: 'Pending Results', icon: '🧪', action: '/results', count: 3 },
      ],
    },
    emergency_call: {
      sections: [
        { label: 'Resus Bays', icon: '🚨', action: '/workflow/queue', count: 4 },
        { label: 'Critical Alerts', icon: '⚠️', action: '/alerts', count: 1 },
      ],
    },
    icu_duty: {
      sections: [
        { label: 'ICU Beds', icon: '💓', action: '/workflow/queue', count: 6 },
        { label: 'Ventilator Alerts', icon: '🔬', action: '/alerts', count: 2 },
      ],
    },
  }

  const config = common[assignmentType as keyof typeof common] ?? common.clinic

  return [
    ...config.sections.map(s => ({
      label: s.label,
      count: s.count,
      items: [{
        label: s.label, icon: s.icon, action: s.action, badge: s.count, badgeColor: undefined, subtitle: undefined, active: false,
      }],
    })),
    {
      label: 'Quick Actions',
      items: [
        { label: 'New Patient Note', icon: '📝', action: '/notes/new', subtitle: undefined, badge: undefined, active: false },
        { label: 'Order Lab', icon: '🧪', action: '/lab/order', subtitle: undefined, badge: undefined, active: false },
        { label: 'Write Prescription', icon: '💊', action: '/prescribe', subtitle: undefined, badge: undefined, active: false },
      ],
    },
  ]
}
