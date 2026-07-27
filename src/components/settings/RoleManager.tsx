'use client';
import React, { useState, useMemo } from 'react';
import type { Role, Permission, ResourceType, Action, AmxUid } from '@/lib/amexan/constitution/types';
import { registerRole, getAllRoles, deleteRole } from '@/lib/amexan/authz/rbac';

const RESOURCE_GROUPS: { label: string; resources: ResourceType[] }[] = [
  { label: 'Clinical', resources: ['patient', 'encounter', 'prescription', 'lab_order', 'imaging_order', 'clinical_note', 'discharge_summary', 'discharge', 'referral', 'consent', 'vitals', 'observations', 'assessment', 'care_plan'] },
  { label: 'Administrative', resources: ['staff', 'department', 'organization', 'finance', 'admin', 'system_config', 'audit_log', 'reports', 'schedule', 'hr', 'training', 'quality'] },
  { label: 'Operations', resources: ['inventory', 'pharmacy', 'theatre', 'blood_bank', 'telemedicine'] },
  { label: 'Governance', resources: ['research_data', 'ai_insights', 'view_analytics', 'manage_staff', 'manage_org', 'manage_roles', 'view_finance'] },
];

const ACTIONS: Action[] = ['create', 'read', 'update', 'delete', 'approve', 'sign', 'audit', 'prescribe', 'discharge', 'admin'];

const DEFAULT_PERMISSIONS: Permission[] = [
  { resource: 'patient', actions: ['create', 'read', 'update'], scope: { type: 'global' }, deny: false },
  { resource: 'encounter', actions: ['create', 'read', 'update'], scope: { type: 'global' }, deny: false },
  { resource: 'clinical_note', actions: ['create', 'read', 'update', 'sign'], scope: { type: 'global' }, deny: false },
];

export function RoleManager() {
  const [roles, setRoles] = useState<Role[]>(() => getAllRoles());
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const selectedRole = useMemo(() => roles.find(r => r.id === selectedRoleId) || null, [roles, selectedRoleId]);
  const filteredRoles = useMemo(() => {
    if (!search) return roles;
    const q = search.toLowerCase();
    return roles.filter(r => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
  }, [roles, search]);

  const refreshRoles = () => setRoles([...getAllRoles()]);

  const handleCreate = () => {
    if (!newRoleName.trim()) return;
    const role: Role = {
      id: `role_${Date.now()}`,
      name: newRoleName.trim(),
      description: newRoleDesc.trim() || `${newRoleName.trim()} role`,
      type: 'custom',
      permissions: [...DEFAULT_PERMISSIONS],
      isAssignable: true,
      createdBy: 'current_user' as AmxUid,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    registerRole(role);
    setShowCreate(false);
    setNewRoleName('');
    setNewRoleDesc('');
    refreshRoles();
    setSelectedRoleId(role.id);
  };

  const handleDelete = (roleId: string) => {
    deleteRole(roleId);
    if (selectedRoleId === roleId) setSelectedRoleId(null);
    setDeleteConfirm(null);
    refreshRoles();
  };

  const handlePermissionToggle = (resource: ResourceType, action: Action, deny: boolean) => {
    if (!selectedRole) return;
    const idx = selectedRole.permissions.findIndex(
      p => p.resource === resource && p.deny === deny
    );
    let updated: Permission[];

    if (deny) {
      if (idx >= 0) {
        updated = selectedRole.permissions.filter((_, i) => i !== idx);
      } else {
        updated = [...selectedRole.permissions, { resource, actions: [action], scope: { type: 'global' }, deny: true }];
      }
    } else {
      if (idx >= 0) {
        const existing = selectedRole.permissions[idx];
        if (existing.actions.includes(action)) {
          const filtered = existing.actions.filter(a => a !== action);
          if (filtered.length === 0) {
            updated = selectedRole.permissions.filter((_, i) => i !== idx);
          } else {
            updated = selectedRole.permissions.map((p, i) => i === idx ? { ...p, actions: filtered } : p);
          }
        } else {
          updated = selectedRole.permissions.map((p, i) => i === idx ? { ...p, actions: [...p.actions, action] } : p);
        }
      } else {
        updated = [...selectedRole.permissions, { resource, actions: [action], scope: { type: 'global' }, deny: false }];
      }
    }

    const updatedRole = { ...selectedRole, permissions: updated, updatedAt: Date.now() };
    registerRole(updatedRole);
    refreshRoles();
  };

  const hasPermission = (resource: ResourceType, action: Action): boolean => {
    if (!selectedRole) return false;
    const denies = selectedRole.permissions.filter(p => p.resource === resource && p.deny);
    for (const d of denies) if (d.actions.includes(action) || d.actions.includes('admin')) return false;
    const grants = selectedRole.permissions.filter(p => p.resource === resource && !p.deny);
    for (const g of grants) if (g.actions.includes(action) || g.actions.includes('admin')) return true;
    return false;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Role Management</h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Configure roles, permissions, and access control</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="btn-primary text-xs">
          + New Role
        </button>
      </div>

      {showCreate && (
        <div className="card p-4 border">
          <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Create New Role</h4>
          <div className="flex flex-col gap-3">
            <input
              value={newRoleName}
              onChange={e => setNewRoleName(e.target.value)}
              placeholder="Role name (e.g. Surgeon, Nurse, Admin)"
              className="w-full px-3 py-2 text-sm border rounded-lg"
              style={{ borderColor: 'var(--surface-border)', color: 'var(--text-primary)', background: 'var(--input-bg, white)' }}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
            <input
              value={newRoleDesc}
              onChange={e => setNewRoleDesc(e.target.value)}
              placeholder="Description (optional)"
              className="w-full px-3 py-2 text-sm border rounded-lg"
              style={{ borderColor: 'var(--surface-border)', color: 'var(--text-primary)', background: 'var(--input-bg, white)' }}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowCreate(false)} className="btn-secondary text-xs">Cancel</button>
              <button onClick={handleCreate} disabled={!newRoleName.trim()}
                className="btn-primary text-xs" style={{ opacity: newRoleName.trim() ? 1 : 0.5 }}>Create Role</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        <div className="w-72 flex-shrink-0">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search roles..."
            className="w-full px-3 py-2 text-sm border rounded-lg mb-3"
            style={{ borderColor: 'var(--surface-border)', color: 'var(--text-primary)', background: 'var(--input-bg, white)' }}
          />
          <div className="card overflow-hidden">
            {filteredRoles.length === 0 && (
              <div className="p-4 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                {search ? 'No matching roles' : 'No roles defined. Create your first role above.'}
              </div>
            )}
            <div className="divide-y" style={{ borderColor: 'var(--surface-border)' }}>
              {filteredRoles.map(role => (
                <div key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className="flex items-center justify-between px-4 py-3 cursor-pointer transition-colors text-sm"
                  style={{
                    background: selectedRoleId === role.id ? 'var(--sky-50)' : 'transparent',
                    borderBottom: '1px solid var(--surface-border)',
                    color: selectedRoleId === role.id ? 'var(--sky-700)' : 'var(--text-primary)',
                  }}
                  onMouseEnter={e => { if (selectedRoleId !== role.id) e.currentTarget.style.background = 'var(--surface-hover)'; }}
                  onMouseLeave={e => { if (selectedRoleId !== role.id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium truncate">{role.name}</span>
                    <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{role.description}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{
                      background: role.type === 'system' ? 'var(--purple-bg)' : role.type === 'organization' ? 'var(--blue-bg)' : 'var(--sky-50)',
                      color: role.type === 'system' ? 'var(--purple)' : role.type === 'organization' ? 'var(--blue)' : 'var(--sky-600)',
                    }}>
                      {role.type}
                    </span>
                    <button onClick={e => { e.stopPropagation(); setDeleteConfirm(role.id); }}
                      className="text-xs ml-1 px-1.5 py-0.5 rounded hover-bg-red-50"
                      style={{ color: 'var(--text-muted)' }}
                      title="Delete role">
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {!selectedRole ? (
            <div className="card p-8 text-center">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Select a role from the list to edit its permissions</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedRole.name}</h4>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{selectedRole.description}</p>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-full" style={{
                    background: 'var(--blue-bg)', color: 'var(--blue)',
                  }}>
                    {selectedRole.permissions.length} permission rules
                  </span>
                </div>
              </div>

              <div className="card overflow-hidden">
                <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--surface-border)' }}>
                  <h5 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Permissions Matrix</h5>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                        <th className="text-left px-4 py-2 font-medium" style={{ color: 'var(--text-muted)', minWidth: 140 }}>Resource</th>
                        {ACTIONS.map(action => (
                          <th key={action} className="text-center px-2 py-2 font-medium capitalize" style={{ color: 'var(--text-muted)', minWidth: 64 }}>
                            {action.replace(/_/g, ' ')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {RESOURCE_GROUPS.map(group => (
                        <React.Fragment key={group.label}>
                          <tr style={{ background: 'var(--surface-elevated)' }}>
                            <td className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }} colSpan={ACTIONS.length + 1}>
                              {group.label}
                            </td>
                          </tr>
                          {group.resources.map(resource => (
                            <tr key={resource} className="hover" style={{ borderBottom: '1px solid var(--surface-border)' }}>
                              <td className="px-4 py-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                                {resource.replace(/_/g, ' ')}
                              </td>
                              {ACTIONS.map(action => {
                                const granted = hasPermission(resource, action);
                                return (
                                  <td key={action} className="text-center px-2 py-2">
                                    <input
                                      type="checkbox"
                                      checked={granted}
                                      onChange={() => handlePermissionToggle(resource, action, false)}
                                      className="rounded border-gray-300 cursor-pointer"
                                      style={{ accentColor: 'var(--primary)' }}
                                    />
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setDeleteConfirm(null)}>
          <div className="card p-6 max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Delete Role?</h4>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
              This will remove the role and unassign it from all users. This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary text-xs">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
