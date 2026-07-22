'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getDoc } from 'firebase/firestore';
import {
  listDepartments, createDepartment, updateDepartment, deleteDepartment,
  listOrgMembers, addOrgMember, updateOrgMember, removeOrgMember,
  listEmployments, createEmployment,
  listRoles, createOrgRole,
  getOrganization, updateOrganization,
  type OrgMemberRecord,
} from '@/lib/amexan/constitution/firestoreService';
import type { Department, Employment, Role, Organization } from '@/lib/amexan';
import { C } from '@/lib/colors';

export default function OrganizationAdminPage() {
  const { session, can } = useAuth();
  const router = useRouter();

  const [org, setOrg] = useState<Organization | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [members, setMembers] = useState<OrgMemberRecord[]>([]);
  const [employments, setEmployments] = useState<Employment[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [tab, setTab] = useState<'departments' | 'staff' | 'roles' | 'settings'>('departments');
  const [loading, setLoading] = useState(true);

  const orgId = session.currentOrganization?.id;

  const loadData = useCallback(async () => {
    if (!orgId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [orgData, depts, mems, emps, rls] = await Promise.all([
        getOrganization(orgId),
        listDepartments(orgId),
        listOrgMembers(orgId),
        listEmployments(orgId),
        listRoles(orgId),
      ]);
      setOrg(orgData);
      setDepartments(depts);
      setMembers(mems);
      setEmployments(emps);
      setRoles(rls);
    } catch (err) {
      console.error('Failed to load organization data', err);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => { loadData(); }, [loadData]);

  const canManage = can('manage_org', 'update') || can('manage_staff', 'update');

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.panel, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <p style={{ color: C.textLight, fontSize: 14 }}>Loading organization...</p>
      </div>
    );
  }

  if (!orgId || !org) {
    return (
      <div style={{ minHeight: '100vh', background: C.panel, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: C.navy }}>No Organization Selected</p>
          <p style={{ fontSize: 13, color: C.textLight, marginTop: 4 }}>You need to belong to an organization to access this page.</p>
          <button onClick={() => router.push('/dashboard')} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'departments' as const, label: 'Departments', count: departments.length },
    { id: 'staff' as const, label: 'Staff', count: members.length },
    { id: 'roles' as const, label: 'Roles', count: roles.length },
    { id: 'settings' as const, label: 'Settings' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.panel, fontFamily: "'Inter', system-ui, sans-serif", color: C.text }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>

      {/* Header */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textLight, padding: 4 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: C.navy, margin: 0 }}>{org.name}</h1>
          <p style={{ fontSize: 11, color: C.textLight, margin: 0 }}>Organization Administration</p>
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: C.textLight }}>Level {org.level} &middot; {org.type}</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${C.border}`, padding: '0 24px', background: C.white }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: '12px 20px', border: 'none', borderBottom: `2px solid ${tab === t.id ? C.sky : 'transparent'}`,
              background: 'transparent', color: tab === t.id ? C.sky : C.textLight, fontSize: 13, fontWeight: 500,
              cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif", transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
            }}>
            {t.label}
            {t.count !== undefined && (
              <span style={{ background: C.panel, color: C.textLight, borderRadius: 10, padding: '0 8px', fontSize: 11, fontWeight: 600 }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={{ padding: 24 }}>
        {tab === 'departments' && (
          <DepartmentsPanel
            orgId={orgId}
            departments={departments}
            onUpdate={loadData}
            canManage={canManage}
          />
        )}
        {tab === 'staff' && (
          <StaffPanel
            orgId={orgId}
            members={members}
            employments={employments}
            roles={roles}
            onUpdate={loadData}
            canManage={canManage}
          />
        )}
        {tab === 'roles' && (
          <RolesPanel
            orgId={orgId}
            roles={roles}
            onUpdate={loadData}
            canManage={canManage}
          />
        )}
        {tab === 'settings' && (
          <SettingsPanel
            org={org}
            onUpdate={loadData}
            canManage={can('manage_org', 'update')}
          />
        )}
      </div>
    </div>
  );
}

// ── Departments Panel ─────────────────────────────────────────────────────────

function DepartmentsPanel({ orgId, departments, onUpdate, canManage }: any) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState('other');

  async function handleCreate() {
    if (!name.trim() || !code.trim()) return;
    await createDepartment(orgId, { name: name.trim(), code: code.trim().toUpperCase(), type, status: 'active', wards: [], clinics: [], theatres: [], units: [], organizationId: orgId } as any);
    setName(''); setCode(''); setType('other'); setShowForm(false);
    onUpdate();
  }

  async function handleDelete(deptId: string) {
    if (!confirm('Delete this department? This cannot be undone.')) return;
    await deleteDepartment(orgId, deptId);
    onUpdate();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: C.navy, margin: 0 }}>Departments & Units</h2>
        {canManage && (
          <button onClick={() => setShowForm(!showForm)}
            style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {showForm ? 'Cancel' : '+ Add Department'}
          </button>
        )}
      </div>

      {showForm && canManage && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.textLight, display: 'block', marginBottom: 4 }}>Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Emergency" style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1, minWidth: 100 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.textLight, display: 'block', marginBottom: 4 }}>Code</label>
            <input value={code} onChange={e => setCode(e.target.value)} placeholder="ER" style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <button onClick={handleCreate} disabled={!name.trim() || !code.trim()}
            style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: C.sky, color: C.navy, fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: (!name.trim() || !code.trim()) ? 0.5 : 1 }}>
            Create
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {departments.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: C.textLight, fontSize: 13 }}>
            No departments yet. Add your first department to get started.
          </div>
        )}
        {departments.map(dept => (
          <div key={dept.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: C.navy }}>{dept.name}</div>
                <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>Code: {dept.code}</div>
              </div>
              {canManage && (
                <button onClick={() => handleDelete(dept.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.red, padding: 4 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                </button>
              )}
            </div>
            <div style={{ fontSize: 11, color: C.textLight, marginTop: 8 }}>
              <span style={{ background: C.panel, padding: '2px 8px', borderRadius: 4 }}>{dept.type}</span>
              <span style={{ marginLeft: 8 }}>{dept.wards?.length || 0} wards</span>
              <span style={{ marginLeft: 8 }}>{dept.clinics?.length || 0} clinics</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Staff Panel ───────────────────────────────────────────────────────────────

function StaffPanel({ orgId, members, employments, roles, onUpdate, canManage }: any) {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [roleId, setRoleId] = useState('');

  async function handleAdd() {
    if (!email.trim() || !displayName.trim()) return;
    const selectedRole = roles.find((r: Role) => r.id === roleId);
    await addOrgMember(orgId, {
      userId: email.trim().replace(/[^a-zA-Z0-9]/g, '_'),
      email: email.trim(),
      displayName: displayName.trim(),
      roleId: roleId || 'staff',
      roleName: selectedRole?.name ?? 'Staff',
      departmentIds: [],
      isActive: true,
      joinedAt: Date.now(),
    });
    setEmail(''); setDisplayName(''); setRoleId('');
    setShowForm(false);
    onUpdate();
  }

  async function handleToggleActive(userId: string, current: boolean) {
    await updateOrgMember(orgId, userId, { isActive: !current });
    onUpdate();
  }

  async function handleRemove(userId: string) {
    if (!confirm('Remove this member from the organization?')) return;
    await removeOrgMember(orgId, userId);
    onUpdate();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: C.navy, margin: 0 }}>Staff Members</h2>
        {canManage && (
          <button onClick={() => setShowForm(!showForm)}
            style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {showForm ? 'Cancel' : '+ Add Member'}
          </button>
        )}
      </div>

      {showForm && canManage && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.textLight, display: 'block', marginBottom: 4 }}>Name</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Full name" style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.textLight, display: 'block', marginBottom: 4 }}>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ minWidth: 120 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.textLight, display: 'block', marginBottom: 4 }}>Role</label>
            <select value={roleId} onChange={e => setRoleId(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none', background: C.white }}>
              <option value="">Staff</option>
              {roles.map((r: Role) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <button onClick={handleAdd} disabled={!email.trim() || !displayName.trim()}
            style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: C.sky, color: C.navy, fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: (!email.trim() || !displayName.trim()) ? 0.5 : 1 }}>
            Add
          </button>
        </div>
      )}

      <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        {members.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: C.textLight, fontSize: 13 }}>
            No staff members yet.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.panel }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.textLight }}>Name</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.textLight }}>Email</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.textLight }}>Role</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.textLight }}>Status</th>
                {canManage && <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: C.textLight }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.userId} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 500 }}>{m.displayName}</td>
                  <td style={{ padding: '10px 16px', fontSize: 12, color: C.textLight }}>{m.email}</td>
                  <td style={{ padding: '10px 16px', fontSize: 12 }}>
                    <span style={{ background: C.skyLight, color: C.sky, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500 }}>{m.roleName}</span>
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 12 }}>
                    <span style={{ color: m.isActive ? C.green : C.red }}>{m.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  {canManage && (
                    <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                      <button onClick={() => handleToggleActive(m.userId, m.isActive)} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer', marginRight: 6, color: C.textLight }}>
                        {m.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => handleRemove(m.userId)} style={{ background: 'none', border: `1px solid ${C.red}30`, borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer', color: C.red }}>
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Roles Panel ───────────────────────────────────────────────────────────────

function RolesPanel({ orgId, roles, onUpdate, canManage }: any) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  async function handleCreate() {
    if (!name.trim()) return;
    await createOrgRole(orgId, {
      name: name.trim(),
      description: description.trim(),
      type: 'organization',
      permissions: [],
      isAssignable: true,
      createdBy: '' as any,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    setName(''); setDescription(''); setShowForm(false);
    onUpdate();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: C.navy, margin: 0 }}>Roles & Permissions</h2>
        {canManage && (
          <button onClick={() => setShowForm(!showForm)}
            style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {showForm ? 'Cancel' : '+ Create Role'}
          </button>
        )}
      </div>

      {showForm && canManage && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.textLight, display: 'block', marginBottom: 4 }}>Role Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Senior Nurse" style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 2, minWidth: 200 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.textLight, display: 'block', marginBottom: 4 }}>Description</label>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Role description" style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <button onClick={handleCreate} disabled={!name.trim()}
            style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: C.sky, color: C.navy, fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: !name.trim() ? 0.5 : 1 }}>
            Create Role
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {roles.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: C.textLight, fontSize: 13 }}>
            No custom roles yet. Create roles to define permission sets.
          </div>
        )}
        {roles.map(role => (
          <div key={role.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: C.navy }}>{role.name}</div>
            <div style={{ fontSize: 12, color: C.textLight, marginTop: 4 }}>{role.description || 'No description'}</div>
            <div style={{ fontSize: 11, color: C.textLight, marginTop: 8 }}>
              <span style={{ background: C.panel, padding: '2px 8px', borderRadius: 4 }}>{role.type}</span>
              <span style={{ marginLeft: 8 }}>{role.permissions?.length || 0} permissions</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Settings Panel ────────────────────────────────────────────────────────────

function SettingsPanel({ org, onUpdate, canManage }: any) {
  const [name, setName] = useState(org?.name || '');
  const [phone, setPhone] = useState(org?.phone || '');

  async function handleSave() {
    if (!org) return;
    await updateOrganization(org.id, { name: name.trim(), phone: phone.trim() });
    onUpdate();
    alert('Settings saved');
  }

  if (!org) return null;

  return (
    <div>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: C.navy, margin: '0 0 16px' }}>Organization Settings</h2>

      <div style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.textLight, display: 'block', marginBottom: 4 }}>Organization Name</label>
            <input value={name} onChange={e => setName(e.target.value)} disabled={!canManage} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none', boxSizing: 'border-box', background: canManage ? C.white : C.panel }} />
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.textLight, display: 'block', marginBottom: 4 }}>Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} disabled={!canManage} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none', boxSizing: 'border-box', background: canManage ? C.white : C.panel }} />
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: C.textLight }}>
            <div><strong>Type:</strong> {org.type}</div>
            <div style={{ marginTop: 4 }}><strong>Level:</strong> {org.level}</div>
            <div style={{ marginTop: 4 }}><strong>Registration:</strong> {org.registrationNumber}</div>
            <div style={{ marginTop: 4 }}><strong>Status:</strong> {org.status}</div>
          </div>
          {canManage && (
            <button onClick={handleSave} disabled={!name.trim()}
              style={{ marginTop: 16, padding: '8px 20px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: !name.trim() ? 0.5 : 1 }}>
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
