'use client';
import { useState, useMemo } from 'react';
import { Building2, Users, Shield, CheckCircle, ChevronRight, Save, Database, Network, Hospital, Layers, UserPlus, Settings, Lock, LockOpen, Crown, AlertTriangle, RefreshCw, Plus, Trash2, Edit3, Search, Filter } from 'lucide-react';
import { getActiveOrganizationId } from '@/lib/firebase/orgContext';
import { getAllPlans, type SubscriptionTier } from '@/lib/amexan/constitution/capability-engine';

const TIER_COLORS: Record<SubscriptionTier, string> = {
  starter: '#10B981',
  professional: '#3B82F6',
  enterprise: '#8B5CF6',
  national: '#F59E0B',
};

const ROLES = [
  { value: 'organization_admin', label: 'Organization Admin', icon: '🏛️', scope: 'organization' },
  { value: 'department_head', label: 'Department Head', icon: '🏥', scope: 'department' },
  { value: 'ward_incharge', label: 'Ward In-charge', icon: '🏠', scope: 'unit' },
  { value: 'clinician', label: 'Clinician', icon: '👨‍⚕️', scope: 'department' },
  { value: 'nurse', label: 'Nurse', icon: '👩‍⚕️', scope: 'unit' },
  { value: 'laboratory_technologist', label: 'Lab Technologist', icon: '🔬', scope: 'department' },
  { value: 'pharmacist', label: 'Pharmacist', icon: '💊', scope: 'department' },
  { value: 'radiographer', label: 'Radiographer', icon: '📷', scope: 'department' },
  { value: 'theatre_technician', label: 'Theatre Technician', icon: '🏥', scope: 'department' },
  { value: 'pharmacy_technician', label: 'Pharmacy Technician', icon: '💊', scope: 'department' },
  { value: 'it_support', label: 'IT Support', icon: '💻', scope: 'organization' },
  { value: 'security_guard', label: 'Security Guard', icon: '🛡️', scope: 'organization' },
  { value: 'records_clerk', label: 'Records Clerk', icon: '📋', scope: 'organization' },
  { value: 'billing_clerk', label: 'Billing Clerk', icon: '💰', scope: 'organization' },
  { value: 'procurement_officer', label: 'Procurement Officer', icon: '📦', scope: 'organization' },
  { value: 'cleaning_staff', label: 'Cleaning Staff', icon: '🧹', scope: 'organization' },
  { value: 'porter', label: 'Porter', icon: '🚚', scope: 'organization' },
];

const DEPARTMENT_TYPES = [
  { value: 'medical', label: 'Medical', icon: '🏥' },
  { value: 'surgical', label: 'Surgical', icon: '🔪' },
  { value: 'diagnostic', label: 'Diagnostic', icon: '🔬' },
  { value: 'support', label: 'Support', icon: '🛠️' },
  { value: 'administration', label: 'Administration', icon: '📋' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'research', label: 'Research', icon: '🔬' },
];

export default function FacilityAdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'roles' | 'departments' | 'wards' | 'permissions' | 'sync'>('overview');
  const [search, setSearch] = useState('');
  const orgId = getActiveOrganizationId();

  const tierInfo = useMemo(() => {
    const plans = getAllPlans();
    return plans[0];
  }, []);

  const stats = useMemo(() => ({
    totalUsers: 15,
    activeUsers: 12,
    totalDepartments: 28,
    totalWards: 36,
    totalTeams: 13,
    totalRoles: 18,
    pendingApprovals: 3,
  }), []);

  return (
    <div className="flex flex-col gap-6 animate-fade-in" style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Facility Administration</h1>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>Centralized admin for org hierarchy, users, roles, and HMIS-EMR sync</p>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>Facility Active</span>
          <span style={{ fontSize: 10, color: '#64748B' }}>{orgId}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#3B82F6' },
          { label: 'Active Users', value: stats.activeUsers, icon: CheckCircle, color: '#10B981' },
          { label: 'Departments', value: stats.totalDepartments, icon: Layers, color: '#8B5CF6' },
          { label: 'Wards', value: stats.totalWards, icon: Hospital, color: '#06B6D4' },
          { label: 'Teams', value: stats.totalTeams, icon: Network, color: '#F59E0B' },
          { label: 'Roles', value: stats.totalRoles, icon: Shield, color: '#EF4444' },
          { label: 'Pending', value: stats.pendingApprovals, icon: AlertTriangle, color: '#F97316' },
        ].map((stat) => (
          <div key={stat.label} style={{ padding: 16, borderRadius: 8, border: '1px solid #334155', background: 'rgba(15,23,42,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <stat.icon size={18} color={stat.color} />
              <span style={{ fontSize: 12, color: '#64748B' }}>{stat.label}</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#F1F5F9', marginTop: 4 }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #334155', paddingBottom: 8 }}>
        {[
          { key: 'overview', label: 'Overview', icon: Building2 },
          { key: 'users', label: 'Users', icon: Users },
          { key: 'roles', label: 'Roles', icon: Shield },
          { key: 'departments', label: 'Departments', icon: Layers },
          { key: 'wards', label: 'Wards', icon: Hospital },
          { key: 'permissions', label: 'Permissions', icon: Lock },
          { key: 'sync', label: 'HMIS-EMR Sync', icon: Database },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} style={{
            padding: '8px 16px', borderRadius: 6, border: 'none',
            background: activeTab === tab.key ? 'rgba(37,99,235,0.15)' : 'transparent',
            color: activeTab === tab.key ? '#60A5FA' : '#64748B',
            cursor: 'pointer', fontSize: 13, fontWeight: activeTab === tab.key ? 600 : 400,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: 24, borderRadius: 12, border: '1px solid #334155', background: 'rgba(15,23,42,0.5)', minHeight: 400 }}>
        {renderTab()}
      </div>
    </div>
  );

  function renderTab() {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'users': return renderUsers();
      case 'roles': return renderRoles();
      case 'departments': return renderDepartments();
      case 'wards': return renderWards();
      case 'permissions': return renderPermissions();
      case 'sync': return renderSync();
      default: return null;
    }
  }

  function renderOverview() {
    return (
      <div className="flex flex-col gap-6">
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#F1F5F9' }}>Organization Overview</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ padding: 16, borderRadius: 8, border: '1px solid #334155', background: 'rgba(15,23,42,0.5)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9', marginBottom: 8 }}>Hierarchy</h3>
            <div style={{ fontSize: 13, color: '#94A3B8', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(37,99,235,0.15)', color: '#60A5FA', fontSize: 11 }}>Country</span>
                <ChevronRight size={12} color="#64748B" />
                <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(37,99,235,0.15)', color: '#60A5FA', fontSize: 11 }}>Region</span>
                <ChevronRight size={12} color="#64748B" />
                <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(16,185,129,0.15)', color: '#10B981', fontSize: 11 }}>Hospital</span>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: '#64748B' }}>
                <strong>Org ID:</strong> {orgId}<br />
                <strong>Tier:</strong> {tierInfo?.tier || 'starter'}<br />
                <strong>Max Users:</strong> {tierInfo?.maxUsersPerOrg || 10}
              </div>
            </div>
          </div>
          <div style={{ padding: 16, borderRadius: 8, border: '1px solid #334155', background: 'rgba(15,23,42,0.5)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9', marginBottom: 8 }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Add User', 'Create Department', 'Assign Role', 'Sync HMIS-EMR', 'View Audit Log'].map((action) => (
                <button key={action} style={{
                  padding: '8px 12px', borderRadius: 6, border: '1px solid #334155',
                  background: 'transparent', color: '#94A3B8', cursor: 'pointer', fontSize: 13,
                  textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <Plus size={12} /> {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderUsers() {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#F1F5F9' }}>Users</h2>
          <button style={{
            padding: '6px 12px', borderRadius: 6, border: 'none', background: '#2563EB', color: '#F1F5F9', cursor: 'pointer', fontSize: 12, fontWeight: 600,
          }}>+ Add User</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { name: 'Dr. Wanjiku', role: 'Clinician', department: 'Medicine', status: 'active', tier: 'professional' },
            { name: 'Nurse Achieng', role: 'Nurse', department: 'Medicine', status: 'active', tier: 'starter' },
            { name: 'Lab Tech Kipchoge', role: 'Lab Technologist', department: 'Laboratory', status: 'active', tier: 'professional' },
            { name: 'Pharmacist Wanjala', role: 'Pharmacist', department: 'Pharmacy', status: 'active', tier: 'professional' },
            { name: 'Admin Kibet', role: 'Organization Admin', department: 'Administration', status: 'active', tier: 'enterprise' },
            { name: 'Dr. Mwangi', role: 'Emergency Physician', department: 'Emergency', status: 'active', tier: 'professional' },
          ].map((user) => (
            <div key={user.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8, border: '1px solid #334155', background: 'rgba(15,23,42,0.5)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(37,99,235,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60A5FA', fontWeight: 600, fontSize: 14 }}>
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#F1F5F9' }}>{user.name}</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>{user.role} · {user.department}</div>
              </div>
              <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(16,185,129,0.15)', color: '#10B981', fontSize: 11 }}>{user.status}</span>
              <span style={{ padding: '2px 8px', borderRadius: 4, background: `${TIER_COLORS[user.tier]}22`, color: TIER_COLORS[user.tier], fontSize: 11 }}>{user.tier}</span>
              <button style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #334155', background: 'transparent', color: '#94A3B8', cursor: 'pointer', fontSize: 11 }}>Edit</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderRoles() {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#F1F5F9' }}>Roles & Permissions</h2>
          <button style={{
            padding: '6px 12px', borderRadius: 6, border: 'none', background: '#2563EB', color: '#F1F5F9', cursor: 'pointer', fontSize: 12, fontWeight: 600,
          }}>+ Create Role</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ROLES.map((role) => (
            <div key={role.value} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8, border: '1px solid #334155', background: 'rgba(15,23,42,0.5)' }}>
              <span style={{ fontSize: 20 }}>{role.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#F1F5F9' }}>{role.label}</div>
                <div style={{ fontSize: 11, color: '#64748B' }}>Scope: {role.scope}</div>
              </div>
              <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(37,99,235,0.15)', color: '#60A5FA', fontSize: 11 }}>{role.scope}</span>
              <button style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #334155', background: 'transparent', color: '#94A3B8', cursor: 'pointer', fontSize: 11 }}>Edit</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderDepartments() {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#F1F5F9' }}>Departments</h2>
          <button style={{
            padding: '6px 12px', borderRadius: 6, border: 'none', background: '#2563EB', color: '#F1F5F9', cursor: 'pointer', fontSize: 12, fontWeight: 600,
          }}>+ Add Department</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {DEPARTMENT_TYPES.map((dt) => (
            <div key={dt.value} style={{ padding: 16, borderRadius: 8, border: '1px solid #334155', background: 'rgba(15,23,42,0.5)', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{dt.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{dt.label}</div>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>{dt.value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderWards() {
    return (
      <div className="flex flex-col gap-6">
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#F1F5F9' }}>Wards & Units</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {['Medical Ward I', 'Medical Ward II', 'Surgical Ward', 'Pediatric Ward', 'OBG Ward', 'ICU', 'HDU', 'Emergency Bay', 'Outpatient Clinic', 'Main Theatre', 'Lab Unit', 'Pharmacy Unit', 'Radiology Unit'].map((ward) => (
            <div key={ward} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, borderRadius: 6, border: '1px solid #334155', background: 'rgba(15,23,42,0.3)' }}>
              <span style={{ fontSize: 14, color: '#F1F5F9', fontWeight: 500 }}>{ward}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: '#64748B' }}>Active</span>
              <button style={{ padding: '2px 8px', borderRadius: 4, border: '1px solid #334155', background: 'transparent', color: '#94A3B8', cursor: 'pointer', fontSize: 11 }}>Manage</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderPermissions() {
    return (
      <div className="flex flex-col gap-6">
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#F1F5F9' }}>Permission Matrix</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', color: '#94A3B8', fontWeight: 600 }}>Resource</th>
                <th style={{ padding: '8px 12px', textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}>Create</th>
                <th style={{ padding: '8px 12px', textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}>Read</th>
                <th style={{ padding: '8px 12px', textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}>Update</th>
                <th style={{ padding: '8px 12px', textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}>Delete</th>
                <th style={{ padding: '8px 12px', textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}>Admin</th>
              </tr>
            </thead>
            <tbody>
              {['patient', 'encounter', 'clinical_note', 'prescription', 'lab_order', 'imaging_order', 'vitals', 'schedule', 'billing', 'department', 'unit', 'team', 'user', 'role', 'settings'].map((resource) => (
                <tr key={resource} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '8px 12px', color: '#F1F5F9' }}>{resource}</td>
                  {['create', 'read', 'update', 'delete', 'admin'].map((action) => (
                    <td key={action} style={{ padding: '8px 12px', textAlign: 'center' }}>
                      <LockOpen size={14} color="#10B981" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderSync() {
    return (
      <div className="flex flex-col gap-6">
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#F1F5F9' }}>HMIS-EMR Sync</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ padding: 16, borderRadius: 8, border: '1px solid #334155', background: 'rgba(15,23,42,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <CheckCircle size={16} color="#10B981" />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>Sync Status: Active</span>
            </div>
            <div style={{ fontSize: 12, color: '#64748B', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              <div>Last Sync: 2 min ago</div>
              <div>Direction: Bidirectional</div>
              <div>Conflicts: 0</div>
              <div>Total Synced: 1,247</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{
              padding: '8px 16px', borderRadius: 6, border: 'none', background: '#2563EB', color: '#F1F5F9', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            }}>Run Full Sync</button>
            <button style={{
              padding: '8px 16px', borderRadius: 6, border: '1px solid #334155', background: 'transparent', color: '#94A3B8', cursor: 'pointer', fontSize: 13,
            }}>View Sync Log</button>
            <button style={{
              padding: '8px 16px', borderRadius: 6, border: '1px solid #334155', background: 'transparent', color: '#94A3B8', cursor: 'pointer', fontSize: 13,
            }}>Configure</button>
          </div>
        </div>
      </div>
    );
  }
}