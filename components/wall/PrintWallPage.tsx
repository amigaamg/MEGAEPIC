'use client';
// app/patients/[patientId]/wall/print/page.tsx
// Renders a clean, paginated, print-ready version of the patient wall
// Accessible via window.open() from PDFExportBar
// Use @media print or browser Print to PDF

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  collection, query, where, orderBy, getDocs, limit, doc, getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TOOL_CONFIGS } from '@/lib/diseaseTools';

const fmtDate = (ts:any) => { if(!ts)return'—'; const d=ts?.toDate?ts.toDate():new Date(ts); return d.toLocaleDateString('en-KE',{day:'numeric',month:'long',year:'numeric'}); };
const fmtDateTime = (ts:any) => { if(!ts)return'—'; const d=ts?.toDate?ts.toDate():new Date(ts); return `${d.toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'})} ${d.toLocaleTimeString('en-KE',{hour:'2-digit',minute:'2-digit'})}`; };

interface PrintProps { params: { patientId: string } }

export default function PrintWallPage({ params }: PrintProps) {
  const searchParams = useSearchParams();
  const sections     = searchParams?.get('sections')?.split(',') || ['all'];
  const doctorId     = searchParams?.get('doctor') || '';
  const patientId    = params.patientId;
  const includeAll   = sections.includes('all');
  const has = (k:string) => includeAll || sections.includes(k);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [
        patientSnap, notesSnap, rxSnap, labsSnap,
        imagingSnap, referralsSnap, assignmentsSnap, readingsSnap,
      ] = await Promise.all([
        getDoc(doc(db,'patients',patientId)),
        getDocs(query(collection(db,'clinicalNotes'),      where('patientId','==',patientId), orderBy('createdAt','desc'), limit(50))),
        getDocs(query(collection(db,'prescriptions'),      where('patientId','==',patientId), orderBy('createdAt','desc'), limit(50))),
        getDocs(query(collection(db,'labOrders'),          where('patientId','==',patientId), orderBy('createdAt','desc'), limit(30))),
        getDocs(query(collection(db,'imagingOrders'),      where('patientId','==',patientId), orderBy('createdAt','desc'), limit(20))),
        getDocs(query(collection(db,'referrals'),          where('patientId','==',patientId), orderBy('createdAt','desc'), limit(20))),
        getDocs(query(collection(db,'toolAssignments'),    where('patientId','==',patientId), where('active','==',true))),
        getDocs(query(collection(db,'toolReadings'),       where('patientId','==',patientId), orderBy('recordedAt','desc'), limit(200))),
      ]);

      setData({
        patient:     patientSnap.exists() ? { id:patientSnap.id, ...patientSnap.data() } : null,
        notes:       notesSnap.docs.map(d=>({id:d.id,...d.data()})),
        prescriptions: rxSnap.docs.map(d=>({id:d.id,...d.data()})),
        labs:        labsSnap.docs.map(d=>({id:d.id,...d.data()})),
        imaging:     imagingSnap.docs.map(d=>({id:d.id,...d.data()})),
        referrals:   referralsSnap.docs.map(d=>({id:d.id,...d.data()})),
        assignments: assignmentsSnap.docs.map(d=>({id:d.id,...d.data()})),
        readings:    readingsSnap.docs.map(d=>({id:d.id,...d.data()})),
      });
      setLoading(false);
    }
    load();
  }, [patientId]);

  useEffect(() => {
    if (!loading && data) {
      setTimeout(() => window.print(), 800);
    }
  }, [loading, data]);

  if (loading) return <div style={{ padding:40, textAlign:'center', fontFamily:'Georgia,serif' }}>Loading patient record…</div>;
  if (!data?.patient) return <div style={{ padding:40 }}>Patient not found.</div>;

  const { patient, notes, prescriptions, labs, imaging, referrals, assignments, readings } = data;

  const initials = patient.name?.split(' ').map((w:string)=>w[0]).join('').slice(0,2) || 'PT';

  return (
    <>
      <style>{printCSS}</style>
      <div className="print-root">

        {/* ── LETTERHEAD ── */}
        <div className="letterhead">
          <div className="lh-left">
            <div className="amexan-logo">amexan <span>Health</span></div>
            <div className="lh-sub">Comprehensive Clinical Record</div>
            <div className="lh-date">Generated: {fmtDateTime(new Date())}</div>
          </div>
          <div className="lh-right">
            <div className="lh-facility">Amexan Clinical System</div>
            <div className="lh-facility-sub">Nairobi, Kenya</div>
            <div className="lh-facility-sub">www.amexan.health</div>
          </div>
        </div>

        {/* ── PATIENT IDENTITY ── */}
        {has('identity') && (
          <section className="section">
            <h2 className="section-title">Patient Identity</h2>
            <div className="id-grid">
              <div className="id-card">
                <div className="id-avatar">{initials}</div>
                <div className="id-main">
                  <div className="id-name">{patient.name}</div>
                  <div className="id-meta">{patient.gender} · {patient.dob ? `DOB: ${fmtDate(patient.dob)}` : ''}</div>
                  <div className="id-meta">{patient.phone} · {patient.location}</div>
                  <div className="id-meta">ID: {patient.id?.slice(0,14).toUpperCase()}</div>
                </div>
              </div>
              <div className="detail-table">
                {[
                  ['Blood group', patient.bloodGroup],
                  ['Height', patient.height ? `${patient.height} cm` : '—'],
                  ['Weight / BMI', patient.weight ? `${patient.weight} kg / BMI ${patient.bmi}` : '—'],
                  ['Insurance', patient.insurance],
                  ['Next of kin', patient.nextOfKin],
                  ['Primary doctor', patient.primaryDoctorName],
                  ['Specialty', patient.primaryDoctorSpec],
                  ['Facility', patient.primaryDoctorFacility],
                ].map(([l,v]) => (
                  <div key={l as string} className="detail-row">
                    <span className="detail-label">{l}</span>
                    <span className="detail-value">{v || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="row-wrap">
              <div className="subsection-title">Active conditions</div>
              <div className="tag-row">
                {patient.conditions?.map((c:string) => <span key={c} className="tag-cond">{c}</span>)}
              </div>
              <div className="subsection-title" style={{ marginTop:8 }}>Allergies</div>
              <div className="tag-row">
                {patient.allergies?.map((a:string) => <span key={a} className="tag-allergy">⚠ {a}</span>)}
                {!patient.allergies?.length && <span className="no-data">None recorded</span>}
              </div>
            </div>
          </section>
        )}

        {/* ── CLINICAL NOTES ── */}
        {has('notes') && notes.length > 0 && (
          <section className="section page-break">
            <h2 className="section-title">Clinical Notes</h2>
            {notes.map((n:any) => (
              <div key={n.id} className="note-block">
                <div className="note-header">
                  <span className="note-type">{n.type?.toUpperCase()}</span>
                  {n.tags?.map((t:string) => <span key={t} className="note-tag">{t}</span>)}
                  {n.private && <span className="note-private">🔒 Private</span>}
                  <span className="note-date">{fmtDateTime(n.createdAt)} · Dr. {n.doctorName}</span>
                </div>
                {n.type === 'soap' ? (
                  <div className="soap-grid">
                    {[['S — Subjective',n.content?.subjective],['O — Objective',n.content?.objective],['A — Assessment',n.content?.assessment],['P — Plan',n.content?.plan]].map(([k,v]) => v ? (
                      <div key={k as string} className="soap-box">
                        <div className="soap-label">{k}</div>
                        <div className="soap-content">{v}</div>
                      </div>
                    ) : null)}
                  </div>
                ) : (
                  <div className="note-text">{n.content?.text}</div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* ── MONITORING TRENDS ── */}
        {has('monitoring') && assignments.length > 0 && (
          <section className="section page-break">
            <h2 className="section-title">Monitoring Trends</h2>
            {assignments.map((a:any) => {
              const cfg = TOOL_CONFIGS[a.toolType];
              const toolReadings = readings.filter((r:any) => r.assignmentId === a.id).slice(0, 20);
              if (!cfg || !toolReadings.length) return null;
              return (
                <div key={a.id} className="monitoring-block">
                  <div className="monitoring-title">{cfg.icon} {cfg.name}</div>
                  <div className="monitoring-sub">Frequency: {a.frequency || cfg.frequency} · Total readings: {toolReadings.length}</div>
                  <table className="readings-table">
                    <thead>
                      <tr><th>Date & time</th><th>Reading</th><th>Status</th><th>Dr. note</th></tr>
                    </thead>
                    <tbody>
                      {toolReadings.map((r:any) => {
                        const val = a.toolType === 'bp_monitor'
                          ? `${r.data?.systolic}/${r.data?.diastolic} mmHg`
                          : cfg.chartFields?.[0] ? `${r.data?.[cfg.chartFields[0]]} ${cfg.chartRef?.unit||''}` : '—';
                        return (
                          <tr key={r.id}>
                            <td>{fmtDateTime(r.recordedAt)}</td>
                            <td className="mono">{val}</td>
                            <td>{r.triage?.label || 'Normal'}</td>
                            <td>{r.doctorNote || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </section>
        )}

        {/* ── PRESCRIPTIONS ── */}
        {has('prescriptions') && prescriptions.length > 0 && (
          <section className="section page-break">
            <h2 className="section-title">Prescriptions</h2>
            <table className="data-table">
              <thead>
                <tr><th>Medication</th><th>Dosage</th><th>Frequency</th><th>Route</th><th>Indication</th><th>Status</th><th>Started</th></tr>
              </thead>
              <tbody>
                {prescriptions.map((p:any) => (
                  <tr key={p.id} style={{ opacity: p.active ? 1 : .6, textDecoration: p.active ? 'none' : 'line-through' }}>
                    <td className="bold">{p.medication}</td>
                    <td>{p.dosage}</td>
                    <td>{p.frequency}</td>
                    <td>{p.route}</td>
                    <td>{p.indication}</td>
                    <td className={p.active ? 'status-ok' : 'status-stopped'}>{p.active ? 'Active' : 'Stopped'}</td>
                    <td>{fmtDate(p.startDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {prescriptions.filter((p:any) => p.warnings).length > 0 && (
              <div className="warnings-block">
                <div className="warnings-title">⚠ Drug warnings & contraindications</div>
                {prescriptions.filter((p:any) => p.warnings).map((p:any) => (
                  <div key={p.id} className="warning-item">{p.medication}: {p.warnings}</div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── LABS ── */}
        {has('labs') && labs.length > 0 && (
          <section className="section page-break">
            <h2 className="section-title">Laboratory Orders & Results</h2>
            {labs.map((l:any) => (
              <div key={l.id} className="lab-block">
                <div className="lab-header">
                  <span className="lab-priority">{l.priority?.toUpperCase()}</span>
                  {l.fasting && <span className="lab-fasting">FASTING</span>}
                  <span className="lab-status">{l.status}</span>
                  <span className="lab-date">{fmtDate(l.createdAt)} · Dr. {l.doctorName}</span>
                </div>
                <div className="tests-row">{l.tests?.join(' · ')}</div>
                {l.clinicalInfo && <div className="lab-clinical">{l.clinicalInfo}</div>}
                {l.results?.length > 0 && (
                  <table className="results-table">
                    <thead><tr><th>Test</th><th>Value</th><th>Unit</th><th>Range</th><th>Flag</th></tr></thead>
                    <tbody>
                      {l.results.map((r:any,i:number) => (
                        <tr key={i}>
                          <td>{r.test}</td>
                          <td className={`mono ${r.flag==='H'?'flag-high':r.flag==='L'?'flag-low':''}`}>{r.value}</td>
                          <td>{r.unit}</td>
                          <td>{r.range}</td>
                          <td>{r.flag}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </section>
        )}

        {/* ── IMAGING ── */}
        {has('imaging') && imaging.length > 0 && (
          <section className="section page-break">
            <h2 className="section-title">Imaging Orders</h2>
            {imaging.map((im:any) => (
              <div key={im.id} className="imaging-block">
                <div className="imaging-header">
                  <span className="bold">{im.modality} — {im.region}</span>
                  {im.contrast && <span className="contrast-badge">+Contrast</span>}
                  <span className={`priority-badge priority-${im.priority}`}>{im.priority?.toUpperCase()}</span>
                  <span className="imaging-date">{fmtDate(im.createdAt)} · Dr. {im.doctorName}</span>
                </div>
                <div className="imaging-indication">Indication: {im.indication}</div>
                {im.report && (
                  <div className="imaging-report">
                    <div className="report-label">Radiology Report</div>
                    <div className="report-text">{im.report}</div>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* ── REFERRAL LETTER ── */}
        {has('referral') && referrals.length > 0 && (
          <section className="section page-break">
            <h2 className="section-title">Referral Letters</h2>
            {referrals.map((r:any) => (
              <div key={r.id} className="referral-letter">
                <div className="referral-to">
                  <div className="to-label">To: The Specialist</div>
                  <div className="to-specialty">{r.specialty} Department</div>
                  {r.toDoctorName && <div className="to-doctor">Attn: Dr. {r.toDoctorName}</div>}
                </div>
                <div className="referral-meta">
                  Date: {fmtDate(r.createdAt)} · Urgency: <span className={`urgency-${r.urgency}`}>{r.urgency?.toUpperCase()}</span>
                </div>
                <div className="referral-body">
                  <div className="referral-subject">Re: {patient.name} — {r.reason}</div>
                  <div className="referral-text">
                    Dear Colleague,<br/><br/>
                    I am writing to refer my patient, <strong>{patient.name}</strong> ({patient.gender}, {patient.dob}),
                    for specialist review by the {r.specialty} department.<br/><br/>
                    <strong>Reason for referral:</strong> {r.reason}<br/><br/>
                    <strong>Clinical summary:</strong> {r.clinicalSummary}<br/><br/>
                    <strong>Current medications:</strong> {prescriptions.filter((p:any)=>p.active).map((p:any)=>`${p.medication} ${p.dosage}`).join(', ')}<br/><br/>
                    <strong>Allergies:</strong> {patient.allergies?.join(', ') || 'NKDA'}<br/><br/>
                    Yours sincerely,<br/>
                    <strong>Dr. {r.fromDoctorName}</strong><br/>
                    {patient.primaryDoctorSpec}
                  </div>
                </div>
                <div className="referral-sig">
                  <div className="sig-line" />
                  <div className="sig-name">Dr. {r.fromDoctorName}</div>
                  <div className="sig-date">{fmtDate(r.createdAt)}</div>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* ── FOOTER ── */}
        <div className="print-footer">
          <div>Amexan Clinical Record · {patient.name} · {patient.id?.slice(0,14).toUpperCase()}</div>
          <div>Generated: {fmtDateTime(new Date())} · Confidential — for clinical use only</div>
        </div>

      </div>
    </>
  );
}

const printCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@400;500;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  body { background: #fff; color: #1a202c; font-family: 'DM Sans', sans-serif; font-size: 11pt; line-height: 1.6; }
  
  .print-root { max-width: 800px; margin: 0 auto; padding: 32px; background: #fff; }

  @media print {
    .print-root { max-width: 100%; padding: 16mm 20mm; }
    @page { margin: 15mm 20mm; size: A4; }
  }

  /* Letterhead */
  .letterhead { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 16px; border-bottom: 2.5px solid #0d1b2a; margin-bottom: 24px; }
  .amexan-logo { font-family: 'DM Sans', sans-serif; font-size: 22pt; font-weight: 800; color: #0d1b2a; letter-spacing: -1px; }
  .amexan-logo span { color: #0aaa76; font-weight: 300; }
  .lh-sub { font-size: 9pt; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }
  .lh-date { font-size: 9pt; color: #94a3b8; margin-top: 2px; }
  .lh-right { text-align: right; }
  .lh-facility { font-size: 11pt; font-weight: 700; }
  .lh-facility-sub { font-size: 9pt; color: #64748b; margin-top: 2px; }

  /* Sections */
  .section { margin-bottom: 28px; }
  .section-title { font-family: 'Lora', serif; font-size: 14pt; font-weight: 600; color: #0d1b2a; border-bottom: 1px solid #e2e9f3; padding-bottom: 6px; margin-bottom: 14px; }
  .page-break { page-break-before: auto; }
  @media print { .page-break { page-break-before: always; } }

  /* Identity */
  .id-grid { display: grid; grid-template-columns: auto 1fr; gap: 20px; margin-bottom: 14px; }
  .id-card { display: flex; gap: 12px; align-items: flex-start; }
  .id-avatar { width: 52px; height: 52px; border-radius: 50%; background: #0d1b2a; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 18pt; font-weight: 800; flex-shrink: 0; }
  .id-name { font-size: 16pt; font-weight: 800; color: #0d1b2a; }
  .id-meta { font-size: 9pt; color: #64748b; margin-top: 2px; }
  .detail-table { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; }
  .detail-row { display: flex; gap: 6px; font-size: 9.5pt; border-bottom: 0.5px solid #f1f5f9; padding: 3px 0; }
  .detail-label { color: #64748b; min-width: 100px; flex-shrink: 0; }
  .detail-value { color: #0d1b2a; font-weight: 600; }
  .subsection-title { font-size: 9pt; font-weight: 800; color: #8fa3bd; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px; }
  .tag-row { display: flex; flex-wrap: wrap; gap: 4px; }
  .tag-cond { font-size: 9pt; padding: 2px 9px; border-radius: 99px; background: #fef2f2; color: #dc2626; border: 0.5px solid #fecaca; font-weight: 600; }
  .tag-allergy { font-size: 9pt; padding: 2px 9px; border-radius: 99px; background: #fef2f2; color: #ef4444; border: 0.5px solid #fca5a5; font-weight: 700; }
  .no-data { font-size: 9pt; color: #94a3b8; }

  /* Notes */
  .note-block { border: 1px solid #e2e9f3; border-radius: 8px; margin-bottom: 12px; overflow: hidden; }
  .note-header { background: #f8fafc; padding: 8px 12px; display: flex; gap: 6px; flex-wrap: wrap; align-items: center; border-bottom: 1px solid #e2e9f3; font-size: 9pt; }
  .note-type { background: #eff6ff; color: #1d4ed8; padding: 2px 7px; border-radius: 99px; font-weight: 800; font-size: 8pt; }
  .note-tag { background: #f0fdf4; color: #166534; padding: 2px 7px; border-radius: 99px; font-size: 8pt; font-weight: 600; }
  .note-private { background: #fef2f2; color: #ef4444; padding: 2px 7px; border-radius: 99px; font-size: 8pt; font-weight: 700; }
  .note-date { margin-left: auto; color: #64748b; }
  .soap-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 10px 12px; }
  .soap-box { background: #f8fafc; border-radius: 6px; padding: 8px 10px; }
  .soap-label { font-size: 8.5pt; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 4px; }
  .soap-content { font-size: 9.5pt; color: #334155; line-height: 1.6; }
  .note-text { padding: 10px 12px; font-size: 10pt; color: #334155; line-height: 1.6; }
  .row-wrap { margin-top: 8px; }

  /* Tables */
  .data-table, .readings-table, .results-table { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin-top: 8px; }
  .data-table th, .readings-table th, .results-table th { background: #f8fafc; color: #64748b; font-weight: 700; text-align: left; padding: 7px 10px; border-bottom: 1.5px solid #e2e9f3; font-size: 8.5pt; text-transform: uppercase; letter-spacing: .3px; }
  .data-table td, .readings-table td, .results-table td { padding: 7px 10px; border-bottom: 0.5px solid #f1f5f9; color: #0d1b2a; vertical-align: top; }
  .mono { font-family: 'Courier New', monospace; font-weight: 700; }
  .bold { font-weight: 700; }
  .status-ok { color: #10b981; font-weight: 700; }
  .status-stopped { color: #94a3b8; }
  .flag-high { color: #ef4444; }
  .flag-low { color: #f97316; }

  /* Monitoring */
  .monitoring-block { margin-bottom: 16px; border: 1px solid #e2e9f3; border-radius: 8px; overflow: hidden; }
  .monitoring-title { padding: 8px 12px; background: #f8fafc; font-size: 12pt; font-weight: 800; color: #0d1b2a; border-bottom: 1px solid #e2e9f3; }
  .monitoring-sub { padding: 4px 12px 8px; font-size: 9pt; color: #64748b; border-bottom: 1px solid #e2e9f3; background: #f8fafc; }

  /* Labs */
  .lab-block { border: 1px solid #e2e9f3; border-radius: 8px; margin-bottom: 12px; overflow: hidden; }
  .lab-header { padding: 8px 12px; background: #f8fafc; display: flex; gap: 8px; align-items: center; border-bottom: 1px solid #e2e9f3; font-size: 9pt; flex-wrap: wrap; }
  .lab-priority { font-weight: 800; color: #f97316; text-transform: uppercase; font-size: 8pt; }
  .lab-fasting { background: #fffbeb; color: #b45309; padding: 1px 6px; border-radius: 99px; font-size: 8pt; font-weight: 700; }
  .lab-status { background: #eff6ff; color: #1d4ed8; padding: 1px 6px; border-radius: 99px; font-size: 8pt; font-weight: 600; }
  .lab-date { margin-left: auto; color: #64748b; }
  .tests-row { padding: 8px 12px; font-size: 9.5pt; font-weight: 600; color: #0d1b2a; }
  .lab-clinical { padding: 0 12px 8px; font-size: 9pt; color: #64748b; font-style: italic; }

  /* Imaging */
  .imaging-block { border: 1px solid #e2e9f3; border-radius: 8px; margin-bottom: 10px; padding: 12px; }
  .imaging-header { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 6px; font-size: 10pt; }
  .contrast-badge { font-size: 8pt; background: #faf5ff; color: #7e22ce; padding: 1px 6px; border-radius: 99px; font-weight: 700; }
  .priority-badge { font-size: 8pt; font-weight: 700; padding: 1px 6px; border-radius: 99px; }
  .priority-routine { background: #f0fdf4; color: #166534; }
  .priority-urgent { background: #fffbeb; color: #854d0e; }
  .priority-emergency { background: #fef2f2; color: #991b1b; }
  .imaging-date { margin-left: auto; font-size: 9pt; color: #64748b; }
  .imaging-indication { font-size: 9pt; color: #64748b; font-style: italic; margin-bottom: 6px; }
  .imaging-report { background: #f0fdf4; border-radius: 6px; padding: 8px 10px; margin-top: 8px; }
  .report-label { font-size: 8.5pt; font-weight: 800; color: #166534; margin-bottom: 4px; text-transform: uppercase; letter-spacing: .3px; }
  .report-text { font-size: 9.5pt; color: #334155; line-height: 1.6; }

  /* Warnings */
  .warnings-block { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 10px 12px; margin-top: 10px; }
  .warnings-title { font-size: 9pt; font-weight: 800; color: #991b1b; margin-bottom: 6px; }
  .warning-item { font-size: 9pt; color: #7f1d1d; margin-bottom: 3px; }

  /* Referral letter */
  .referral-letter { border: 1.5px solid #e2e9f3; border-radius: 8px; padding: 16px 20px; margin-bottom: 16px; }
  .referral-to { margin-bottom: 10px; }
  .to-label { font-size: 9pt; color: #64748b; text-transform: uppercase; letter-spacing: .5px; }
  .to-specialty { font-size: 13pt; font-weight: 800; color: #0d1b2a; }
  .to-doctor { font-size: 10pt; color: #0d1b2a; margin-top: 2px; }
  .referral-meta { font-size: 9pt; color: #64748b; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid #e2e9f3; }
  .referral-subject { font-size: 11pt; font-weight: 700; color: #0d1b2a; margin-bottom: 12px; }
  .referral-text { font-size: 10pt; color: #334155; line-height: 1.8; }
  .urgency-urgent { color: #f97316; font-weight: 800; }
  .urgency-emergency { color: #ef4444; font-weight: 800; }
  .urgency-routine { color: #10b981; font-weight: 800; }
  .referral-sig { margin-top: 24px; }
  .sig-line { width: 180px; border-top: 1px solid #0d1b2a; margin-bottom: 6px; }
  .sig-name { font-size: 11pt; font-weight: 700; }
  .sig-date { font-size: 9pt; color: #64748b; }

  /* Footer */
  .print-footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e2e9f3; font-size: 8pt; color: #94a3b8; display: flex; justify-content: space-between; }
  @media print { .print-footer { position: fixed; bottom: 10mm; left: 20mm; right: 20mm; border-top: 0.5pt solid #e2e9f3; } }
`;