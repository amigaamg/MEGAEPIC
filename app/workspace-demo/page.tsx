'use client'

import { WorkspaceShell } from '@/components/workspace'
import type { WorkspaceSession } from '@/lib/amexan/workspace'

const DEMO_SESSION: WorkspaceSession = {
  identity: '' as any,
  organizationId: 'org_1',
  organizationName: 'AMEXAN Teaching Hospital',
  departmentId: 'dept_1',
  departmentName: 'Internal Medicine',
  shiftType: 'morning',
  assignmentType: 'ward_round',
  assignmentTitle: 'Morning Ward Round',
  location: 'Ward 3A',
  role: 'doctor',
  position: 'Registrar',
  permissions: ['read', 'write', 'prescribe'],
}

export default function WorkspaceDemoPage() {
  return (
    <WorkspaceShell session={DEMO_SESSION}>
      <div style={{ padding: 24 }}>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🩺</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>Ward Round Workspace</h2>
          <p style={{ fontSize: 13, margin: 0 }}>Left pane: patient queue · Center: active patient · Right: AI context</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Press <strong>Ctrl+K</strong> for command palette</p>
        </div>
      </div>
    </WorkspaceShell>
  )
}
