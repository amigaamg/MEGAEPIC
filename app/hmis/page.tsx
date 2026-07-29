'use client';
import { useRouter } from 'next/navigation';

const BOOKS = [
  { icon: '🏥', title: 'Hospital Model', desc: 'Health system hierarchy, departments, wards, rooms, beds, resources', book: 'I', href: '/hmis/hospital', color: '#06B6D4' },
  { icon: '👥', title: 'User Model', desc: 'Actor roles, permissions, sessions, task assignments', book: 'II', href: '/hmis/users', color: '#8B5CF6' },
  { icon: '🆔', title: 'Identity', desc: 'AMXUID, patient/clinician identifiers, biometrics, verification', book: 'III', href: '/hmis/identity', color: '#EC4899' },
  { icon: '🔄', title: 'Encounter Lifecycle', desc: '17-state state machine, transitions, timing, triage, stats', book: 'IV', href: '/hmis/encounters', color: '#F59E0B' },
  { icon: '✅', title: 'Task Engine', desc: '30+ task types, escalation, dependencies, completion proof', book: 'V', href: '/hmis/tasks', color: '#10B981' },
  { icon: '🔔', title: 'Notifications', desc: 'Multi-channel: in-app, SMS, email, push, WhatsApp, pager', book: 'VI', href: '/hmis/notifications', color: '#EF4444' },
  { icon: '📋', title: 'Orders Engine', desc: 'Lab, imaging, meds, procedures, referrals — unified lifecycle', book: 'VII', href: '/hmis/orders', color: '#3B82F6' },
  { icon: '📊', title: 'Results Engine', desc: 'Specimen-to-acknowledgement, critical flags, delta checks', book: 'VIII', href: '/hmis/results', color: '#14B8A6' },
  { icon: '🔧', title: 'Resource Management', desc: 'Equipment lifecycle, maintenance, calibration, utilization', book: 'IX', href: '/hmis/resources', color: '#F97316' },
  { icon: '💊', title: 'Pharmacy Engine', desc: 'Drug master, interactions, inventory, MAR, prescriptions', book: 'X', href: '/hmis/pharmacy', color: '#22D3EE' },
  { icon: '🔬', title: 'Laboratory Engine', desc: 'Specimen workflow, QC, test profiles, reference ranges', book: 'XI', href: '/hmis/laboratory', color: '#A855F7' },
  { icon: '📡', title: 'Radiology Engine', desc: 'Imaging request→report, PACS study model, structured reporting', book: 'XII', href: '/hmis/radiology', color: '#06B6D4' },
  { icon: '🏨', title: 'Theatre Engine', desc: 'WHO checklist, operation notes, theatre availability, surgery', book: 'XIII', href: '/hmis/theatre', color: '#EAB308' },
  { icon: '💰', title: 'Billing Engine', desc: 'Charge capture, invoices, M-Pesa, insurance claims, split pay', book: 'XV', href: '/hmis/billing', color: '#34D399' },
  { icon: '📅', title: 'Scheduling', desc: 'Appointments, resource scheduling, shift management, calendar', book: 'XVI', href: '/hmis/scheduling', color: '#0EA5E9' },
  { icon: '📨', title: 'Referrals', desc: 'Inter/intra-facility referral workflows with full lifecycle', book: 'XVII', href: '/hmis/referrals', color: '#D946EF' },
  { icon: '🌍', title: 'Public Health', desc: 'Disease surveillance, immunization, outbreak management', book: 'XVIII', href: '/hmis/public-health', color: '#15803D' },
  { icon: '🔬', title: 'Research', desc: 'Clinical trial management, studies, enrollment, data collection', book: 'XIX', href: '/hmis/research', color: '#6D28D9' },
  { icon: '📝', title: 'Audit', desc: 'Hash-chained immutable audit, chain verification, anomaly detection', book: 'XX', href: '/hmis/audit', color: '#F472B6' },
  { icon: '🔗', title: 'Integration', desc: 'FHIR, HL7, DICOM, custom adapters for interoperability', book: 'XXI', href: '/hmis/integration', color: '#2563EB' },
  { icon: '📴', title: 'Offline', desc: 'Offline data sync, conflict resolution, local storage management', book: 'XXII', href: '/hmis/offline', color: '#78716C' },
  { icon: '⚡', title: 'Event Bus', desc: 'Event-driven architecture, pub/sub, WebSocket management', book: 'XXIII', href: '/hmis/events', color: '#EAB308' },
  { icon: '📈', title: 'Analytics', desc: 'Reporting, dashboards, BI, data warehouse, predictive models', book: 'XXIV', href: '/hmis/analytics', color: '#22C55E' },
];

export default function HMISHubPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 700, color: '#F1F5F9' }}>
          HMIS Console
        </h1>
        <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
          AMEXAN Hospital Management Information System — 15 constitutional books
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {BOOKS.map(book => (
          <div
            key={book.book}
            onClick={() => router.push(book.href)}
            style={{
              padding: 20, borderRadius: 12,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>{book.icon}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#F1F5F9', fontFamily: "'DM Sans',sans-serif" }}>{book.title}</div>
                <div style={{ fontSize: 10, color: book.color, fontFamily: "'Syne',sans-serif" }}>Book {book.book}</div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5, fontFamily: "'DM Sans',sans-serif" }}>{book.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
