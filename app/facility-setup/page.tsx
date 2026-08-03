'use client';
import { useState, useMemo } from 'react';
import { Building2, MapPin, Users, Shield, CheckCircle, ChevronRight, ChevronLeft, Save, Network, Hospital, Layers, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { type SubscriptionTier } from '@/lib/amexan/constitution/capability-engine';
import { registerHierarchyNode, type OrgHierarchyNode } from '@/lib/firebase/orgContext';

const STEPS = [
  { key: 'country', label: 'Country', icon: MapPin },
  { key: 'region', label: 'Region', icon: MapPin },
  { key: 'network', label: 'Network', icon: Network },
  { key: 'hospital', label: 'Hospital', icon: Hospital },
  { key: 'departments', label: 'Departments', icon: Layers },
  { key: 'wards', label: 'Wards & Units', icon: Layers },
  { key: 'users', label: 'Users & Roles', icon: UserPlus },
  { key: 'review', label: 'Review', icon: CheckCircle },
];

const COUNTRIES = [
  { code: 'KE', name: 'Kenya', region: 'East Africa', currency: 'KES', timezone: 'Africa/Nairobi' },
  { code: 'TZ', name: 'Tanzania', region: 'East Africa', currency: 'TZS', timezone: 'Africa/Dar_es_Salaam' },
  { code: 'UG', name: 'Uganda', region: 'East Africa', currency: 'UGX', timezone: 'Africa/Kampala' },
  { code: 'RW', name: 'Rwanda', region: 'East Africa', currency: 'RWF', timezone: 'Africa/Kigali' },
  { code: 'ET', name: 'Ethiopia', region: 'East Africa', currency: 'ETB', timezone: 'Africa/Addis_Ababa' },
  { code: 'GH', name: 'Ghana', region: 'West Africa', currency: 'GHS', timezone: 'Africa/Accra' },
  { code: 'NG', name: 'Nigeria', region: 'West Africa', currency: 'NGN', timezone: 'Africa/Lagos' },
  { code: 'ZA', name: 'South Africa', region: 'Southern Africa', currency: 'ZAR', timezone: 'Africa/Johannesburg' },
];

const REGIONS_BY_COUNTRY: Record<string, { code: string; name: string; type: string }[]> = {
  KE: [
    { code: '01', name: 'Nairobi', type: 'county' },
    { code: '02', name: 'Kisumu', type: 'county' },
    { code: '03', name: 'Mombasa', type: 'county' },
    { code: '04', name: 'Kisii', type: 'county' },
    { code: '05', name: 'Kakamega', type: 'county' },
    { code: '06', name: 'Eldoret', type: 'county' },
    { code: '07', name: 'Nyeri', type: 'county' },
    { code: '08', name: 'Meru', type: 'county' },
  ],
  TZ: [
    { code: '01', name: 'Dar es Salaam', type: 'region' },
    { code: '02', name: 'Dodoma', type: 'region' },
    { code: '03', name: 'Arusha', type: 'region' },
    { code: '04', name: 'Mwanza', type: 'region' },
    { code: '05', name: 'Mbeya', type: 'region' },
  ],
};

const DEPARTMENT_TYPES = [
  { value: 'medical', label: 'Medical', icon: '🏥' },
  { value: 'surgical', label: 'Surgical', icon: '🔪' },
  { value: 'diagnostic', label: 'Diagnostic', icon: '🔬' },
  { value: 'support', label: 'Support', icon: '🛠️' },
  { value: 'administration', label: 'Administration', icon: '📋' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'research', label: 'Research', icon: '🔬' },
];

const WARD_TYPES = [
  { value: 'ward', label: 'Ward' },
  { value: 'icu', label: 'ICU' },
  { value: 'hdu', label: 'HDU' },
  { value: 'nicu', label: 'NICU' },
  { value: 'picu', label: 'PICU' },
  { value: 'theatre', label: 'Theatre' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'lab_unit', label: 'Lab Unit' },
  { value: 'pharmacy_unit', label: 'Pharmacy Unit' },
  { value: 'radiology_unit', label: 'Radiology Unit' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'outpatient', label: 'Outpatient' },
  { value: 'day_surgery', label: 'Day Surgery' },
  { value: 'recovery', label: 'Recovery' },
];

const TEAM_TYPES = [
  { value: 'ward_round', label: 'Ward Round' },
  { value: 'night_shift', label: 'Night Shift' },
  { value: 'emergency_team', label: 'Emergency Team' },
  { value: 'surgical_team', label: 'Surgical Team' },
  { value: 'research_team', label: 'Research Team' },
  { value: 'teaching_team', label: 'Teaching Team' },
  { value: 'quality_team', label: 'Quality Team' },
  { value: 'it_team', label: 'IT Team' },
];

const ROLES = [
  { value: 'organization_admin', label: 'Organization Admin' },
  { value: 'department_head', label: 'Department Head' },
  { value: 'ward_incharge', label: 'Ward In-charge' },
  { value: 'clinician', label: 'Clinician' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'laboratory_technologist', label: 'Lab Technologist' },
  { value: 'pharmacist', label: 'Pharmacist' },
  { value: 'radiographer', label: 'Radiographer' },
  { value: 'theatre_technician', label: 'Theatre Technician' },
  { value: 'pharmacy_technician', label: 'Pharmacy Technician' },
  { value: 'it_support', label: 'IT Support' },
  { value: 'security_guard', label: 'Security Guard' },
  { value: 'records_clerk', label: 'Records Clerk' },
  { value: 'billing_clerk', label: 'Billing Clerk' },
  { value: 'procurement_officer', label: 'Procurement Officer' },
  { value: 'cleaning_staff', label: 'Cleaning Staff' },
  { value: 'porter', label: 'Porter' },
];

const SUBSCRIPTION_TIERS: { value: SubscriptionTier; label: string; description: string; maxUsers: number; price: number }[] = [
  { value: 'starter', label: 'Starter', description: 'Basic EMR, appointments, billing, patients', maxUsers: 10, price: 0 },
  { value: 'professional', label: 'Professional', description: 'Analytics, research, education, AI-assisted, FHIR, PACS, LIS', maxUsers: 50, price: 500 },
  { value: 'enterprise', label: 'Enterprise', description: 'Marketplace, multi-facility, registries, population health, SSO, API', maxUsers: 500, price: 2000 },
  { value: 'national', label: 'National', description: 'White label, custom integrations, priority support, dedicated account manager', maxUsers: 9999, price: 10000 },
];

export default function FacilitySetupPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [setupData, setSetupData] = useState<{
    country: string;
    region: string;
    network: string;
    hospital: { name: string; legalName: string; type: string; registrationNo: string; taxId: string; licenseNo: string; address: Record<string, string>; phone: string; email: string; website: string };
    departments: { name: string; type: string; specialty: string }[];
    wards: { name: string; type: string; capacity: number; departmentName: string }[];
    teams: { name: string; type: string; departmentName: string }[];
    users: { name: string; email: string; phone: string; role: string; departmentName: string; unitName: string; teamName: string }[];
    subscriptionTier: SubscriptionTier;
  }>({
    country: '',
    region: '',
    network: '',
    hospital: { name: '', legalName: '', type: 'hospital', registrationNo: '', taxId: '', licenseNo: '', address: {}, phone: '', email: '', website: '' },
    departments: [{ name: 'Medicine', type: 'medical', specialty: 'Internal Medicine' }],
    wards: [],
    teams: [],
    users: [],
    subscriptionTier: 'starter',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const tierInfo = useMemo(() => SUBSCRIPTION_TIERS.find(t => t.value === setupData.subscriptionTier), [setupData.subscriptionTier]);
  const regions = useMemo(() => REGIONS_BY_COUNTRY[setupData.country] || [], [setupData.country]);

  const goNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1);
  };
  const goPrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const orgId = `org_${setupData.country.toLowerCase()}_${Date.now()}`;
      const hierarchyNode: OrgHierarchyNode = {
        id: orgId,
        name: setupData.hospital.name,
        type: 'hospital',
        parentId: null,
        children: [],
        country: setupData.country,
        region: setupData.region,
        network: setupData.network,
        hospital: setupData.hospital.name,
        department: '',
        ward: '',
        status: 'active',
        createdAt: Date.now(),
      };
      registerHierarchyNode(hierarchyNode);
      setSaved(true);
    } catch (e) {
      console.error('Facility setup error:', e);
    } finally {
      setSaving(false);
    }
  };

  const updateSetupData = <K extends keyof typeof setupData>(key: K, value: typeof setupData[K]) => {
    setSetupData(prev => ({ ...prev, [key]: value }));
  };

  const updateHospital = (field: string, value: string) => {
    setSetupData(prev => ({
      ...prev,
      hospital: { ...prev.hospital, [field]: value },
    }));
  };

  const addDepartment = () => {
    setSetupData(prev => ({
      ...prev,
      departments: [...prev.departments, { name: '', type: 'medical', specialty: '' }],
    }));
  };
  const updateDepartment = (index: number, field: string, value: string) => {
    setSetupData(prev => ({
      ...prev,
      departments: prev.departments.map((d, i) => i === index ? { ...d, [field]: value } : d),
    }));
  };
  const removeDepartment = (index: number) => {
    setSetupData(prev => ({
      ...prev,
      departments: prev.departments.filter((_, i) => i !== index),
    }));
  };

  const addWard = () => {
    setSetupData(prev => ({
      ...prev,
      wards: [...prev.wards, { name: '', type: 'ward', capacity: 0, departmentName: prev.departments[0]?.name || '' }],
    }));
  };
  const updateWard = (index: number, field: string, value: string | number) => {
    setSetupData(prev => ({
      ...prev,
      wards: prev.wards.map((w, i) => i === index ? { ...w, [field]: value } : w),
    }));
  };
  const removeWard = (index: number) => {
    setSetupData(prev => ({
      ...prev,
      wards: prev.wards.filter((_, i) => i !== index),
    }));
  };

  const addTeam = () => {
    setSetupData(prev => ({
      ...prev,
      teams: [...prev.teams, { name: '', type: 'ward_round', departmentName: prev.departments[0]?.name || '' }],
    }));
  };
  const updateTeam = (index: number, field: string, value: string) => {
    setSetupData(prev => ({
      ...prev,
      teams: prev.teams.map((t, i) => i === index ? { ...t, [field]: value } : t),
    }));
  };
  const removeTeam = (index: number) => {
    setSetupData(prev => ({
      ...prev,
      teams: prev.teams.filter((_, i) => i !== index),
    }));
  };

  const addUser = () => {
    setSetupData(prev => ({
      ...prev,
      users: [...prev.users, { name: '', email: '', phone: '', role: 'clinician', departmentName: '', unitName: '', teamName: '' }],
    }));
  };
  const updateUser = (index: number, field: string, value: string) => {
    setSetupData(prev => ({
      ...prev,
      users: prev.users.map((u, i) => i === index ? { ...u, [field]: value } : u),
    }));
  };
  const removeUser = (index: number) => {
    setSetupData(prev => ({
      ...prev,
      users: prev.users.filter((_, i) => i !== index),
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: return renderCountryStep();
      case 1: return renderRegionStep();
      case 2: return renderNetworkStep();
      case 3: return renderHospitalStep();
      case 4: return renderDepartmentsStep();
      case 5: return renderWardsStep();
      case 6: return renderUsersStep();
      case 7: return renderReviewStep();
      default: return null;
    }
  };

  const renderCountryStep = () => (
    <div className="flex flex-col gap-6 animate-fade-in">
      <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#F1F5F9' }}>Select Country</h2>
      <p style={{ fontSize: 13, color: '#64748B' }}>Choose the country where this facility is located.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {COUNTRIES.map(c => (
          <button key={c.code} onClick={() => { updateSetupData('country', c.code); updateSetupData('region', ''); }} style={{
            padding: 16, borderRadius: 8, border: setupData.country === c.code ? '2px solid #2563EB' : '1px solid #334155',
            background: setupData.country === c.code ? 'rgba(37,99,235,0.1)' : 'transparent', cursor: 'pointer', textAlign: 'left',
          }}>
            <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 14 }}>{c.name}</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{c.region}</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{c.currency} · {c.timezone}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderRegionStep = () => (
    <div className="flex flex-col gap-6 animate-fade-in">
      <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#F1F5F9' }}>Select Region</h2>
      <p style={{ fontSize: 13, color: '#64748B' }}>Choose the region/county for this facility.</p>
      {regions.length === 0 ? (
        <div style={{ padding: 24, textAlign: 'center', color: '#64748B' }}>Please select a country first.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {regions.map(r => (
            <button key={r.code} onClick={() => updateSetupData('region', r.code)} style={{
              padding: 16, borderRadius: 8, border: setupData.region === r.code ? '2px solid #2563EB' : '1px solid #334155',
              background: setupData.region === r.code ? 'rgba(37,99,235,0.1)' : 'transparent', cursor: 'pointer', textAlign: 'left',
            }}>
              <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 14 }}>{r.name}</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{r.type}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderNetworkStep = () => (
    <div className="flex flex-col gap-6 animate-fade-in">
      <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#F1F5F9' }}>Network (Optional)</h2>
      <p style={{ fontSize: 13, color: '#64748B' }}>If this facility belongs to a network, select it. Otherwise, skip.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button onClick={() => updateSetupData('network', '')} style={{
          padding: 12, borderRadius: 8, border: setupData.network === '' ? '2px solid #2563EB' : '1px solid #334155',
          background: setupData.network === '' ? 'rgba(37,99,235,0.1)' : 'transparent', cursor: 'pointer', textAlign: 'left',
        }}>
          <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 14 }}>No Network (Standalone)</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Single facility, no parent network</div>
        </button>
        <button onClick={() => updateSetupData('network', 'default')} style={{
          padding: 12, borderRadius: 8, border: setupData.network === 'default' ? '2px solid #2563EB' : '1px solid #334155',
          background: setupData.network === 'default' ? 'rgba(37,99,235,0.1)' : 'transparent', cursor: 'pointer', textAlign: 'left',
        }}>
          <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 14 }}>Create New Network</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Set up a new multi-facility network</div>
        </button>
      </div>
    </div>
  );

  const renderHospitalStep = () => (
    <div className="flex flex-col gap-6 animate-fade-in">
      <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#F1F5F9' }}>Facility Details</h2>
      <p style={{ fontSize: 13, color: '#64748B' }}>Enter the hospital or clinic information.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, color: '#94A3B8' }}>Facility Name *</label>
          <input value={setupData.hospital.name} onChange={e => updateHospital('name', e.target.value)} placeholder="e.g. Kisii Teaching Hospital" style={inputStyle} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, color: '#94A3B8' }}>Legal Name</label>
          <input value={setupData.hospital.legalName} onChange={e => updateHospital('legalName', e.target.value)} placeholder="Legal entity name" style={inputStyle} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, color: '#94A3B8' }}>Facility Type</label>
          <select value={setupData.hospital.type} onChange={e => updateHospital('type', e.target.value)} style={inputStyle}>
            <option value="hospital">Hospital</option>
            <option value="clinic">Clinic</option>
            <option value="laboratory">Laboratory</option>
            <option value="pharmacy">Pharmacy</option>
            <option value="insurance">Insurance</option>
            <option value="training">Training Center</option>
            <option value="ministry">Ministry</option>
            <option value="ngo">NGO</option>
            <option value="university">University</option>
            <option value="research_institute">Research Institute</option>
            <option value="individual_practice">Individual Practice</option>
            <option value="telemedicine_provider">Telemedicine Provider</option>
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, color: '#94A3B8' }}>Subscription Tier</label>
          <select value={setupData.subscriptionTier} onChange={e => updateSetupData('subscriptionTier', e.target.value as SubscriptionTier)} style={inputStyle}>
            {SUBSCRIPTION_TIERS.map(t => (
              <option key={t.value} value={t.value}>{t.label} ({t.maxUsers} users, KES {t.price}/mo)</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, color: '#94A3B8' }}>Registration No.</label>
          <input value={setupData.hospital.registrationNo} onChange={e => updateHospital('registrationNo', e.target.value)} placeholder="Reg number" style={inputStyle} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, color: '#94A3B8' }}>Tax ID</label>
          <input value={setupData.hospital.taxId} onChange={e => updateHospital('taxId', e.target.value)} placeholder="Tax ID" style={inputStyle} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, color: '#94A3B8' }}>License No.</label>
          <input value={setupData.hospital.licenseNo} onChange={e => updateHospital('licenseNo', e.target.value)} placeholder="License number" style={inputStyle} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, color: '#94A3B8' }}>Phone</label>
          <input value={setupData.hospital.phone} onChange={e => updateHospital('phone', e.target.value)} placeholder="+254..." style={inputStyle} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: 'span 2' }}>
          <label style={{ fontSize: 12, color: '#94A3B8' }}>Email</label>
          <input value={setupData.hospital.email} onChange={e => updateHospital('email', e.target.value)} placeholder="admin@hospital.org" style={inputStyle} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: 'span 2' }}>
          <label style={{ fontSize: 12, color: '#94A3B8' }}>Address</label>
          <input value={(setupData.hospital.address as any)?.street || ''} onChange={e => updateHospital('address', { ...(setupData.hospital.address as any), street: e.target.value })} placeholder="Street address" style={inputStyle} />
        </div>
      </div>
      {tierInfo && (
        <div style={{ padding: 12, borderRadius: 8, background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', fontSize: 13, color: '#94A3B8' }}>
          <strong style={{ color: '#F1F5F9' }}>{tierInfo.label}</strong> tier: {tierInfo.description}. Max {tierInfo.maxUsers} users.
        </div>
      )}
    </div>
  );

  const renderDepartmentsStep = () => (
    <div className="flex flex-col gap-6 animate-fade-in">
      <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#F1F5F9' }}>Departments</h2>
      <p style={{ fontSize: 13, color: '#64748B' }}>Add departments for this facility.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {setupData.departments.map((dept, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12, borderRadius: 8, border: '1px solid #334155', background: 'rgba(15,23,42,0.5)' }}>
            <select value={dept.type} onChange={e => updateDepartment(i, 'type', e.target.value)} style={{ ...inputStyle, width: 140 }}>
              {DEPARTMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <input value={dept.name} onChange={e => updateDepartment(i, 'name', e.target.value)} placeholder="Department name" style={{ ...inputStyle, flex: 1 }} />
            <input value={dept.specialty} onChange={e => updateDepartment(i, 'specialty', e.target.value)} placeholder="Specialty" style={{ ...inputStyle, width: 180 }} />
            {setupData.departments.length > 1 && (
              <button onClick={() => removeDepartment(i)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>✕</button>
            )}
          </div>
        ))}
        <button onClick={addDepartment} style={{ padding: '8px 16px', borderRadius: 6, border: '1px dashed #475569', background: 'transparent', color: '#94A3B8', cursor: 'pointer', fontSize: 13, alignSelf: 'flex-start' }}>+ Add Department</button>
      </div>
    </div>
  );

  const renderWardsStep = () => (
    <div className="flex flex-col gap-6 animate-fade-in">
      <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#F1F5F9' }}>Wards, Units & Teams</h2>
      <p style={{ fontSize: 13, color: '#64748B' }}>Configure wards/units and teams for this facility.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>Wards & Units</h3>
        {setupData.wards.map((ward, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12, borderRadius: 8, border: '1px solid #334155', background: 'rgba(15,23,42,0.5)' }}>
            <input value={ward.name} onChange={e => updateWard(i, 'name', e.target.value)} placeholder="Ward name" style={{ ...inputStyle, flex: 1 }} />
            <select value={ward.type} onChange={e => updateWard(i, 'type', e.target.value)} style={{ ...inputStyle, width: 120 }}>
              {WARD_TYPES.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
            </select>
            <input type="number" value={ward.capacity} onChange={e => updateWard(i, 'capacity', parseInt(e.target.value) || 0)} placeholder="Capacity" style={{ ...inputStyle, width: 80 }} />
            <select value={ward.departmentName} onChange={e => updateWard(i, 'departmentName', e.target.value)} style={{ ...inputStyle, width: 160 }}>
              <option value="">Select Dept</option>
              {setupData.departments.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
            </select>
            {setupData.wards.length > 1 && (
              <button onClick={() => removeWard(i)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>✕</button>
            )}
          </div>
        ))}
        <button onClick={addWard} style={{ padding: '8px 16px', borderRadius: 6, border: '1px dashed #475569', background: 'transparent', color: '#94A3B8', cursor: 'pointer', fontSize: 13, alignSelf: 'flex-start' }}>+ Add Ward/Unit</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>Teams</h3>
        {setupData.teams.map((team, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12, borderRadius: 8, border: '1px solid #334155', background: 'rgba(15,23,42,0.5)' }}>
            <input value={team.name} onChange={e => updateTeam(i, 'name', e.target.value)} placeholder="Team name" style={{ ...inputStyle, flex: 1 }} />
            <select value={team.type} onChange={e => updateTeam(i, 'type', e.target.value)} style={{ ...inputStyle, width: 160 }}>
              {TEAM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <select value={team.departmentName} onChange={e => updateTeam(i, 'departmentName', e.target.value)} style={{ ...inputStyle, width: 160 }}>
              <option value="">Select Dept</option>
              {setupData.departments.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
            </select>
            {setupData.teams.length > 1 && (
              <button onClick={() => removeTeam(i)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>✕</button>
            )}
          </div>
        ))}
        <button onClick={addTeam} style={{ padding: '8px 16px', borderRadius: 6, border: '1px dashed #475569', background: 'transparent', color: '#94A3B8', cursor: 'pointer', fontSize: 13, alignSelf: 'flex-start' }}>+ Add Team</button>
      </div>
    </div>
  );

  const renderUsersStep = () => (
    <div className="flex flex-col gap-6 animate-fade-in">
      <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#F1F5F9' }}>Users & Roles</h2>
      <p style={{ fontSize: 13, color: '#64748B' }}>Add initial users and assign roles.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {setupData.users.map((user, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12, borderRadius: 8, border: '1px solid #334155', background: 'rgba(15,23,42,0.5)', flexWrap: 'wrap' }}>
            <input value={user.name} onChange={e => updateUser(i, 'name', e.target.value)} placeholder="Full name" style={{ ...inputStyle, width: 160 }} />
            <input type="email" value={user.email} onChange={e => updateUser(i, 'email', e.target.value)} placeholder="Email" style={{ ...inputStyle, width: 200 }} />
            <input value={user.phone} onChange={e => updateUser(i, 'phone', e.target.value)} placeholder="Phone" style={{ ...inputStyle, width: 140 }} />
            <select value={user.role} onChange={e => updateUser(i, 'role', e.target.value)} style={{ ...inputStyle, width: 180 }}>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <select value={user.departmentName} onChange={e => updateUser(i, 'departmentName', e.target.value)} style={{ ...inputStyle, width: 140 }}>
              <option value="">Dept</option>
              {setupData.departments.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
            </select>
            <select value={user.unitName} onChange={e => updateUser(i, 'unitName', e.target.value)} style={{ ...inputStyle, width: 140 }}>
              <option value="">Ward</option>
              {setupData.wards.map(w => <option key={w.name} value={w.name}>{w.name}</option>)}
            </select>
            <select value={user.teamName} onChange={e => updateUser(i, 'teamName', e.target.value)} style={{ ...inputStyle, width: 140 }}>
              <option value="">Team</option>
              {setupData.teams.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
            </select>
            {setupData.users.length > 1 && (
              <button onClick={() => removeUser(i)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>✕</button>
            )}
          </div>
        ))}
        <button onClick={addUser} style={{ padding: '8px 16px', borderRadius: 6, border: '1px dashed #475569', background: 'transparent', color: '#94A3B8', cursor: 'pointer', fontSize: 13, alignSelf: 'flex-start' }}>+ Add User</button>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="flex flex-col gap-6 animate-fade-in">
      <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#F1F5F9' }}>Review Facility Configuration</h2>
      <p style={{ fontSize: 13, color: '#64748B' }}>Review all settings before saving.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ padding: 16, borderRadius: 8, border: '1px solid #334155', background: 'rgba(15,23,42,0.5)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9', marginBottom: 8 }}>Hierarchy</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94A3B8', flexWrap: 'wrap' }}>
            <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(37,99,235,0.15)', color: '#60A5FA' }}>{setupData.country || '—'}</span>
            <ChevronRight size={14} color="#64748B" />
            <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(37,99,235,0.15)', color: '#60A5FA' }}>{setupData.region || '—'}</span>
            <ChevronRight size={14} color="#64748B" />
            {setupData.network && <><span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(37,99,235,0.15)', color: '#60A5FA' }}>{setupData.network}</span><ChevronRight size={14} color="#64748B" /></>}
            <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>{setupData.hospital.name || '—'}</span>
          </div>
        </div>
        <div style={{ padding: 16, borderRadius: 8, border: '1px solid #334155', background: 'rgba(15,23,42,0.5)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9', marginBottom: 8 }}>Facility</h3>
          <div style={{ fontSize: 13, color: '#94A3B8', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div><strong style={{ color: '#F1F5F9' }}>Name:</strong> {setupData.hospital.name || '—'}</div>
            <div><strong style={{ color: '#F1F5F9' }}>Type:</strong> {setupData.hospital.type}</div>
            <div><strong style={{ color: '#F1F5F9' }}>Tier:</strong> {tierInfo?.label}</div>
            <div><strong style={{ color: '#F1F5F9' }}>Max Users:</strong> {tierInfo?.maxUsers}</div>
            <div><strong style={{ color: '#F1F5F9' }}>Phone:</strong> {setupData.hospital.phone || '—'}</div>
            <div><strong style={{ color: '#F1F5F9' }}>Email:</strong> {setupData.hospital.email || '—'}</div>
          </div>
        </div>
        <div style={{ padding: 16, borderRadius: 8, border: '1px solid #334155', background: 'rgba(15,23,42,0.5)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9', marginBottom: 8 }}>Departments ({setupData.departments.length})</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {setupData.departments.map(d => (
              <span key={d.name} style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.15)', color: '#A78BFA', fontSize: 12 }}>{d.name} ({d.type})</span>
            ))}
          </div>
        </div>
        <div style={{ padding: 16, borderRadius: 8, border: '1px solid #334155', background: 'rgba(15,23,42,0.5)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9', marginBottom: 8 }}>Wards ({setupData.wards.length})</h3>
          {setupData.wards.length === 0 ? (
            <div style={{ fontSize: 13, color: '#64748B' }}>No wards configured</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {setupData.wards.map(w => (
                <span key={w.name} style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(6,182,212,0.15)', color: '#22D3EE', fontSize: 12 }}>{w.name} ({w.type}, cap: {w.capacity})</span>
              ))}
            </div>
          )}
        </div>
        <div style={{ padding: 16, borderRadius: 8, border: '1px solid #334155', background: 'rgba(15,23,42,0.5)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9', marginBottom: 8 }}>Teams ({setupData.teams.length})</h3>
          {setupData.teams.length === 0 ? (
            <div style={{ fontSize: 13, color: '#64748B' }}>No teams configured</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {setupData.teams.map(t => (
                <span key={t.name} style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(245,158,11,0.15)', color: '#FBBF24', fontSize: 12 }}>{t.name} ({t.type})</span>
              ))}
            </div>
          )}
        </div>
        <div style={{ padding: 16, borderRadius: 8, border: '1px solid #334155', background: 'rgba(15,23,42,0.5)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9', marginBottom: 8 }}>Users ({setupData.users.length})</h3>
          {setupData.users.length === 0 ? (
            <div style={{ fontSize: 13, color: '#64748B' }}>No users configured</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {setupData.users.map(u => (
                <div key={u.name} style={{ fontSize: 13, color: '#94A3B8', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ color: '#F1F5F9', fontWeight: 500 }}>{u.name || '—'}</span>
                  <span style={{ padding: '1px 6px', borderRadius: 3, background: 'rgba(59,130,246,0.15)', color: '#60A5FA', fontSize: 11 }}>{u.role}</span>
                  <span style={{ fontSize: 11, color: '#64748B' }}>{u.departmentName} · {u.unitName} · {u.teamName}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in" style={{ fontFamily: "'DM Sans',sans-serif", maxWidth: 900, margin: '0 auto' }}>
      <div>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Facility Setup Wizard</h1>
        <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>Configure your facility hierarchy, departments, wards, and users</p>
      </div>

      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 8 }}>
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === currentStep;
          const isCompleted = i < currentStep;
          return (
            <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isCompleted ? 'rgba(16,185,129,0.2)' : isActive ? 'rgba(37,99,235,0.2)' : 'rgba(51,65,85,0.3)',
                border: isActive ? '2px solid #2563EB' : '1px solid #334155',
                color: isCompleted ? '#10B981' : isActive ? '#60A5FA' : '#64748B',
              }}>
                {isCompleted ? <CheckCircle size={16} /> : <Icon size={16} />}
              </div>
              <span style={{ fontSize: 12, color: isActive ? '#F1F5F9' : '#64748B', fontWeight: isActive ? 600 : 400, whiteSpace: 'nowrap' }}>{step.label}</span>
              {i < STEPS.length - 1 && <div style={{ width: 24, height: 1, background: '#334155', margin: '0 4px' }} />}
            </div>
          );
        })}
      </div>

      <div style={{ padding: 24, borderRadius: 12, border: '1px solid #334155', background: 'rgba(15,23,42,0.5)', minHeight: 400 }}>
        {renderStep()}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16 }}>
        <button onClick={goPrev} disabled={currentStep === 0} style={{
          padding: '10px 20px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#94A3B8', cursor: currentStep === 0 ? 'default' : 'pointer', fontSize: 14,
          opacity: currentStep === 0 ? 0.5 : 1,
        }}>
          <ChevronLeft size={16} style={{ display: 'inline', marginRight: 4 }} /> Previous
        </button>
        {currentStep < STEPS.length - 1 ? (
          <button onClick={goNext} style={{
            padding: '10px 20px', borderRadius: 8, border: 'none', background: '#2563EB', color: '#F1F5F9', cursor: 'pointer', fontSize: 14, fontWeight: 600,
          }}>
            Next <ChevronRight size={16} style={{ display: 'inline', marginLeft: 4 }} />
          </button>
        ) : (
          <button onClick={handleSave} disabled={saving} style={{
            padding: '10px 20px', borderRadius: 8, border: 'none', background: saving ? '#475569' : '#10B981', color: '#F1F5F9', cursor: saving ? 'default' : 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Facility'}
          </button>
        )}
      </div>

      {saved && (
        <div style={{ padding: 16, borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#10B981' }}>
          <CheckCircle size={20} /> Facility setup complete! Your organizational hierarchy has been registered.
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '8px 12px', borderRadius: 6, border: '1px solid #334155', background: '#0F172A', color: '#F1F5F9', fontSize: 13, outline: 'none', width: '100%',
};