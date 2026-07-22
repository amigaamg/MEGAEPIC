'use client';
import { useEffect, useState, useMemo } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { calculateTherapyDay, calculateDoseCompliance, getTherapyDayColor, getDoseComplianceColor } from '@/lib/clinical/tracking/dayTracker';
import { DRUG_DATABASE, getDosingSummary, searchDrugsBasic } from '@/src/data/formulary/drugDatabase';

interface PrescriptionDoc {
  id: string;
  medication: string;
  medicationName?: string;
  dosage: string;
  dose?: any;
  route: string;
  frequency: string;
  startDate?: any;
  endDate?: any;
  status: string;
  active: boolean;
  duration: string;
  indication: string;
  instructions: string;
  doctorName: string;
  createdAt?: any;
  [key: string]: any;
}

interface ScheduleDoc {
  id: string;
  prescriptionId: string;
  patientId: string;
  scheduledTime?: any;
  actualTime?: any;
  doseNumber: number;
  status: string;
  administeredBy?: string;
  [key: string]: any;
}

interface TreatmentSheetProps {
  patientId: string;
  doctorId?: string;
  patientAge?: number;
  patientWeight?: number;
  patientGender?: string;
}

const TIMES = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '00:00', '02:00', '04:00'];

const toDate = (v: any): Date | null => {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v.toDate === 'function') return v.toDate();
  if (typeof v === 'string') return new Date(v);
  if (typeof v === 'number') return new Date(v);
  return null;
};

const getMedName = (rx: PrescriptionDoc): string => rx.medicationName || rx.medication || '';
const getDose = (rx: PrescriptionDoc): string => String(rx.dosage || rx.dose || '');

function getStatusBadgeStyle(sched: { status: string }): React.CSSProperties {
  const map: Record<string, { bg: string; color: string; text: string }> = {
    taken: { bg: '#d1fae5', color: '#065f46', text: '✓ Given' },
    delayed: { bg: '#fef3c7', color: '#92400e', text: '⏰ Late' },
    missed: { bg: '#fee2e2', color: '#991b1b', text: '✗ Missed' },
    pending: { bg: '#f3f4f6', color: '#6b7280', text: '○ Due' },
    held: { bg: '#e0e7ff', color: '#3730a3', text: '⊘ Held' },
    refused: { bg: '#fce7f3', color: '#9d174d', text: '⊘ Refused' },
  };
  const entry = map[sched.status] || map.pending;
  return { background: entry.bg, color: entry.color };
}

export function TreatmentSheet({ patientId, doctorId, patientAge, patientWeight, patientGender }: TreatmentSheetProps) {
  const [prescriptions, setPrescriptions] = useState<PrescriptionDoc[]>([]);
  const [schedules, setSchedules] = useState<ScheduleDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [stopping, setStopping] = useState<string | null>(null);
  const [expandedDrug, setExpandedDrug] = useState<string | null>(null);
  const [customDrugSearch, setCustomDrugSearch] = useState('');
  const [showCustomDrugInput, setShowCustomDrugInput] = useState(false);

  useEffect(() => {
    if (!patientId) return;
    const q = query(
      collection(db, 'prescriptions'),
      where('patientId', '==', patientId),
      where('active', '==', true),
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: PrescriptionDoc[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as PrescriptionDoc));
      list.sort((a, b) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0));
      setPrescriptions(list);
      setLoading(false);
    }, (err) => {
      console.error('TreatmentSheet load error:', err);
      setLoading(false);
    });
    return unsub;
  }, [patientId]);

  useEffect(() => {
    if (!patientId) return;
    const q = query(
      collection(db, 'medicationSchedules'),
      where('patientId', '==', patientId),
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: ScheduleDoc[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as ScheduleDoc));
      list.sort((a, b) => (a.scheduledTime?.toMillis?.() || 0) - (b.scheduledTime?.toMillis?.() || 0));
      setSchedules(list);
    });
    return unsub;
  }, [patientId]);

  const handleStop = async (id: string) => {
    setStopping(id);
    try {
      await updateDoc(doc(db, 'prescriptions', id), {
        active: false,
        status: 'stopped',
        endDate: serverTimestamp(),
        updatedAt: serverTimestamp(),
        stoppedBy: doctorId || 'unknown',
      });
    } catch (err) {
      console.error('Failed to stop prescription:', err);
    } finally {
      setStopping(null);
    }
  };

  const handleUpdateDose = async (rx: PrescriptionDoc, field: string, value: string) => {
    try {
      await updateDoc(doc(db, 'prescriptions', rx.id), {
        [field]: value,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to update:', err);
    }
  };

  const activeRx = prescriptions.filter(p => p.active !== false && p.status !== 'stopped');

  const customDrugResults = useMemo(() => {
    if (customDrugSearch.length < 2) return [];
    return searchDrugsBasic(customDrugSearch);
  }, [customDrugSearch]);

  if (loading) {
    return (
      <div className="text-xs text-gray-400 italic p-2">Loading treatment sheet...</div>
    );
  }

  const today = new Date();

  return (
    <div className="space-y-3">
      {/* Custom Drug Quick-Add Bar */}
      <div style={{ background: '#f0fdf9', border: '1px solid #d1fae5', borderRadius: 10, padding: '8px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Drug Database Lookup
          </div>
          <button
            onClick={() => setShowCustomDrugInput(!showCustomDrugInput)}
            style={{
              fontSize: 10, padding: '4px 10px', borderRadius: 6, border: '1px solid #d1fae5',
              background: showCustomDrugInput ? '#d1fae5' : '#fff', color: '#065f46', cursor: 'pointer', fontWeight: 600,
            }}
          >
            {showCustomDrugInput ? 'Close' : 'Search Drugs'}
          </button>
        </div>
        {showCustomDrugInput && (
          <div style={{ marginTop: 8 }}>
            <input
              value={customDrugSearch}
              onChange={e => setCustomDrugSearch(e.target.value)}
              placeholder="Search drug name, brand, or class..."
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid #d1fae5',
                fontSize: 12, outline: 'none', background: '#fff',
              }}
            />
            {customDrugResults.length > 0 && (
              <div style={{ marginTop: 6, maxHeight: 160, overflow: 'auto', border: '1px solid #d1fae5', borderRadius: 8, background: '#fff' }}>
                {customDrugResults.map(d => (
                  <div
                    key={d.id}
                    onClick={() => {
                      setCustomDrugSearch(d.name);
                      setShowCustomDrugInput(false);
                    }}
                    style={{
                      padding: '8px 12px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer',
                      fontSize: 11, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f0fdf9')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{d.name}</div>
                      <div style={{ color: '#6b7280', fontSize: 10 }}>{d.drugClass}</div>
                    </div>
                    <div style={{ fontSize: 10, color: '#065f46', background: '#d1fae5', padding: '2px 8px', borderRadius: 4 }}>
                      {d.therapeuticCategory}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {customDrugSearch && customDrugResults.length === 0 && (
              <div style={{ marginTop: 6, padding: '8px 12px', background: '#fffbeb', borderRadius: 8, fontSize: 11, color: '#92400e', border: '1px solid #fde68a' }}>
                "{customDrugSearch}" not found in database. You can type the drug name manually when prescribing.
              </div>
            )}
          </div>
        )}
      </div>

      {/* No active prescriptions */}
      {activeRx.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '24px 16px', background: '#f9fafb', borderRadius: 12,
          border: '2px dashed #e5e7eb', color: '#9ca3af', fontSize: 12,
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>💊</div>
          No active prescriptions. Use the dose calculator above to prescribe.
        </div>
      )}

      {/* Active Prescriptions - Enhanced Card View */}
      {activeRx.map((rx, i) => {
        const rxSchedules = schedules.filter(s => s.prescriptionId === rx.id);
        const therapyDay = calculateTherapyDay(rx.startDate, rx.duration);
        const doseCompliance = calculateDoseCompliance(rxSchedules);
        const todaySchedules = rxSchedules.filter(s => {
          const d = toDate(s.scheduledTime);
          return d && d.toDateString() === today.toDateString();
        });
        const medName = getMedName(rx);
        const doseVal = getDose(rx);
        const drugInfo = DRUG_DATABASE[medName.toLowerCase().replace(/\s+/g, '_')]
          || searchDrugsBasic(medName)[0];

        return (
          <div
            key={rx.id}
            style={{
              background: '#fff', borderRadius: 12, border: `1px solid ${therapyDay.status === 'completed' ? '#d1fae5' : '#e5e7eb'}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden',
            }}
          >
            {/* Medication Header */}
            <div
              onClick={() => setExpandedDrug(expandedDrug === rx.id ? null : rx.id)}
              style={{
                padding: '12px 16px', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'space-between',
                borderBottom: expandedDrug === rx.id ? '1px solid #f3f4f6' : 'none',
                background: therapyDay.status === 'in_progress' ? '#fafdff' : '#fff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                {/* Day Badge */}
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  minWidth: 44, padding: '4px 8px', borderRadius: 8,
                  background: getTherapyDayColor(therapyDay.status) + '18',
                  border: `1.5px solid ${getTherapyDayColor(therapyDay.status)}`,
                }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: getTherapyDayColor(therapyDay.status) }}>
                    {therapyDay.label}
                  </span>
                  {therapyDay.totalDays > 0 && (
                    <span style={{ fontSize: 8, color: '#6b7280', textTransform: 'uppercase', fontWeight: 700 }}>
                      {therapyDay.status === 'completed' ? 'Done' : 'Day'}
                    </span>
                  )}
                </div>

                {/* Med Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{medName}</span>
                    {drugInfo && (
                      <span style={{
                        fontSize: 9, padding: '1px 6px', borderRadius: 4,
                        background: '#e0f2fe', color: '#0369a1', fontWeight: 600,
                      }}>
                        {drugInfo.drugClass.split('(')[0]?.trim() || drugInfo.drugClass}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>
                    <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{doseVal}</span>
                    {' · '}{rx.route}{' · '}{rx.frequency}
                    {rx.indication && <span> · <span style={{ color: '#3b82f6' }}>{rx.indication}</span></span>}
                  </div>
                  {rx.doctorName && (
                    <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>
                      Dr. {rx.doctorName} · {toDate(rx.startDate)?.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) || ''}
                    </div>
                  )}
                </div>
              </div>

              {/* Right side: Compliance + Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                {/* Compliance indicator */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 40 }}>
                  <span style={{
                    fontSize: 14, fontWeight: 800,
                    color: getDoseComplianceColor(doseCompliance.status),
                  }}>
                    {doseCompliance.compliancePercentage}%
                  </span>
                  <span style={{ fontSize: 8, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>
                    Adherence
                  </span>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); handleStop(rx.id); }}
                  disabled={stopping === rx.id}
                  style={{
                    padding: '4px 10px', borderRadius: 6, border: 'none',
                    background: '#fee2e2', color: '#dc2626', fontSize: 10,
                    fontWeight: 600, cursor: 'pointer', opacity: stopping === rx.id ? 0.5 : 1,
                  }}
                >
                  {stopping === rx.id ? '...' : 'Stop'}
                </button>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedDrug === rx.id && (
              <div style={{ padding: '12px 16px', background: '#fafcfd' }}>
                {/* Therapy Progress Bar */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 600 }}>
                      Therapy Progress: {therapyDay.status === 'completed' ? 'Complete' : `Day ${therapyDay.currentDay} of ${therapyDay.totalDays}`}
                    </span>
                    <span style={{ fontSize: 10, color: therapyDay.percentage >= 80 ? '#059669' : therapyDay.percentage >= 50 ? '#d97706' : '#dc2626', fontWeight: 700 }}>
                      {therapyDay.percentage}%
                    </span>
                  </div>
                  <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 3,
                      width: `${therapyDay.percentage}%`,
                      background: therapyDay.percentage >= 80 ? '#10b981' : therapyDay.percentage >= 50 ? '#f59e0b' : '#ef4444',
                      transition: 'width 0.5s',
                    }} />
                  </div>
                </div>

                {/* Dose Schedule for Today */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                    Today's Doses ({todaySchedules.length})
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {todaySchedules.length > 0 ? todaySchedules.map(s => {
                      const st = toDate(s.scheduledTime);
                      const statusStyle = getStatusBadgeStyle(s);
                      const isLate = s.status === 'delayed';
                      return (
                        <div
                          key={s.id}
                          style={{
                            padding: '4px 10px', borderRadius: 6, fontSize: 10,
                            fontWeight: 600, ...statusStyle,
                            display: 'flex', alignItems: 'center', gap: 4,
                            border: isLate ? '1px solid #fcd34d' : '1px solid transparent',
                          }}
                        >
                          <span>{st?.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) || '—'}</span>
                          <span style={{ fontWeight: 400 }}>·</span>
                          <span>#{s.doseNumber || '?'}</span>
                          <span>·</span>
                          <span>{statusStyle.color === '#065f46' ? '✓' : statusStyle.color === '#92400e' ? '⏰' : statusStyle.color === '#991b1b' ? '✗' : '○'}</span>
                        </div>
                      );
                    }) : (
                      <span style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic' }}>No doses scheduled for today</span>
                    )}
                  </div>
                </div>

                {/* Administration Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
                  <SummaryBox label="Given" value={String(doseCompliance.totalGiven)} color="#10b981" />
                  <SummaryBox label="Missed" value={String(doseCompliance.totalMissed)} color="#ef4444" />
                  <SummaryBox label="Pending" value={String(doseCompliance.totalPending)} color="#f59e0b" />
                  <SummaryBox label="Total" value={String(doseCompliance.totalScheduled)} color="#6b7280" />
                </div>

                {/* Last Dose Info & Next Due */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#6b7280', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>Last given:</span>{' '}
                    {doseCompliance.lastGivenAt
                      ? doseCompliance.lastGivenAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })
                      : 'Not yet administered'}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600 }}>Next due:</span>{' '}
                    {doseCompliance.nextDueAt
                      ? doseCompliance.nextDueAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </div>
                </div>

                {/* Drug Database Info */}
                {drugInfo && (
                  <div style={{
                    marginTop: 8, padding: '8px 12px', background: '#f0f9ff', borderRadius: 8,
                    border: '1px solid #bae6fd', fontSize: 10, color: '#075985',
                  }}>
                    <div style={{ fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', fontSize: 9, letterSpacing: '0.05em' }}>
                      📋 Dosing Reference
                    </div>
                    <div>{getDosingSummary(drugInfo.id, rx.route)}</div>
                    {drugInfo.dosing.renalAdjustment && drugInfo.dosing.renalAdjustment !== 'No adjustment needed' && (
                      <div style={{ marginTop: 2, color: '#dc2626' }}>⚠ {drugInfo.dosing.renalAdjustment}</div>
                    )}
                    {drugInfo.monitoring.length > 0 && (
                      <div style={{ marginTop: 2, color: '#6b7280' }}>
                        Monitor: {drugInfo.monitoring.slice(0, 3).join(', ')}
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Dose Edit */}
                <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#6b7280' }}>Quick Edit:</span>
                  <input
                    defaultValue={doseVal}
                    onBlur={e => handleUpdateDose(rx, 'dosage', e.target.value)}
                    placeholder="Dose"
                    style={{
                      padding: '4px 8px', borderRadius: 6, border: '1px solid #d1d5db',
                      fontSize: 11, width: 80, fontFamily: 'monospace', outline: 'none',
                    }}
                  />
                  <input
                    defaultValue={rx.frequency}
                    onBlur={e => handleUpdateDose(rx, 'frequency', e.target.value)}
                    placeholder="Freq"
                    style={{
                      padding: '4px 8px', borderRadius: 6, border: '1px solid #d1d5db',
                      fontSize: 11, width: 80, outline: 'none',
                    }}
                  />
                  <input
                    defaultValue={rx.route}
                    onBlur={e => handleUpdateDose(rx, 'route', e.target.value)}
                    placeholder="Route"
                    style={{
                      padding: '4px 8px', borderRadius: 6, border: '1px solid #d1d5db',
                      fontSize: 11, width: 70, outline: 'none',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Treatment Chart (T-Sheet) - Enhanced with administration status */}
      {activeRx.length > 0 && (
        <div style={{
          background: '#fff', border: '2px dashed #d1d5db', borderRadius: 12, padding: 12,
        }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Treatment Chart (T-Sheet)
            </div>
            <div style={{ fontSize: 8, color: '#9ca3af' }}>
              Patient: {patientId?.slice(0, 8)}... | Date: {today.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 9, borderCollapse: 'collapse', minWidth: 600 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'left', fontWeight: 700, color: '#6b7280', fontSize: 8 }}>
                    #
                  </th>
                  <th style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'left', fontWeight: 700, color: '#6b7280', fontSize: 8 }}>
                    Medication
                  </th>
                  <th style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'left', fontWeight: 700, color: '#6b7280', fontSize: 8 }}>
                    Dose
                  </th>
                  <th style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 700, color: '#6b7280', fontSize: 8 }}>
                    Route
                  </th>
                  <th style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 700, color: '#6b7280', fontSize: 8 }}>
                    Freq
                  </th>
                  <th style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 700, color: '#6b7280', fontSize: 8 }}>
                    Day
                  </th>
                  {TIMES.map(t => (
                    <th key={t} style={{ padding: 4, border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 700, color: '#6b7280', fontSize: 7 }}>
                      {t}
                    </th>
                  ))}
                  <th style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 700, color: '#6b7280', fontSize: 8 }}>
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeRx.map((rx, idx) => {
                  const rxScheds = schedules.filter(s => s.prescriptionId === rx.id);
                  const dayInfo = calculateTherapyDay(rx.startDate, rx.duration);
                  const compliance = calculateDoseCompliance(rxScheds);

                  const getTimeSlotStatus = (time: string): { status: string; time: Date | null } => {
                    const [h, m] = time.split(':').map(Number);
                    const slotScheds = rxScheds.filter(s => {
                      const st = toDate(s.scheduledTime);
                      if (!st) return false;
                      return st.getHours() === h && st.getMinutes() === m
                        && st.toDateString() === today.toDateString();
                    });
                    if (slotScheds.length === 0) {
                      return { status: '—', time: null };
                    }
                    const latest = slotScheds[slotScheds.length - 1];
                    return { status: latest.status, time: toDate(latest.actualTime) || toDate(latest.scheduledTime) };
                  };

                  return (
                    <tr key={rx.id} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                      <td style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'center', color: '#9ca3af', fontSize: 8 }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: 6, border: '1px solid #e5e7eb', fontWeight: 600, color: '#111827', fontSize: 9 }}>
                        {getMedName(rx)}
                      </td>
                      <td style={{ padding: 6, border: '1px solid #e5e7eb', color: '#374151', fontFamily: 'monospace', fontSize: 8 }}>
                        {getDose(rx)}
                      </td>
                      <td style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'center', color: '#6b7280', fontSize: 8 }}>
                        {rx.route}
                      </td>
                      <td style={{ padding: 6, border: '1px solid #e5e7eb', textAlign: 'center', color: '#6b7280', fontSize: 8 }}>
                        {rx.frequency}
                      </td>
                      <td style={{
                        padding: 6, border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 700, fontSize: 9,
                        color: getTherapyDayColor(dayInfo.status),
                      }}>
                        {dayInfo.label}
                      </td>
                      {TIMES.map(t => {
                        const slot = getTimeSlotStatus(t);
                        let display = '';
                        let bg = 'transparent';
                        let color = '#d1d5db';
                        if (slot.status === 'taken') { display = '✓'; bg = '#d1fae5'; color = '#065f46'; }
                        else if (slot.status === 'delayed') { display = '⏰'; bg = '#fef3c7'; color = '#92400e'; }
                        else if (slot.status === 'missed') { display = '✗'; bg = '#fee2e2'; color = '#dc2626'; }
                        else if (slot.status === 'pending') { display = '·'; bg = '#f3f4f6'; color = '#9ca3af'; }
                        else { display = ''; bg = 'transparent'; color = '#e5e7eb'; }
                        return (
                          <td key={t} style={{
                            padding: 3, border: '1px solid #e5e7eb', textAlign: 'center',
                            background: bg, color, fontSize: 10, fontWeight: 700,
                          }}>
                            {display}
                          </td>
                        );
                      })}
                      <td style={{
                        padding: 6, border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 700, fontSize: 10,
                        color: getDoseComplianceColor(compliance.status),
                      }}>
                        {compliance.compliancePercentage}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6, fontSize: 8, color: '#9ca3af', flexWrap: 'wrap' }}>
            <span><span style={{ color: '#065f46', fontWeight: 700 }}>✓</span> = Administered</span>
            <span><span style={{ color: '#92400e', fontWeight: 700 }}>⏰</span> = Late</span>
            <span><span style={{ color: '#dc2626', fontWeight: 700 }}>✗</span> = Missed</span>
            <span><span style={{ color: '#9ca3af' }}>·</span> = Due</span>
            <span style={{ marginLeft: 'auto' }}>Signature: _______________</span>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ textAlign: 'center', background: '#fff', borderRadius: 8, padding: '6px 4px', border: `1px solid ${color}30` }}>
      <div style={{ fontSize: 16, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 8, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</div>
    </div>
  );
}
