'use client';
import { useState, useCallback } from 'react';

// ── Row types for each monitoring sheet ──────────────────────
interface SpO2Row { time: string; spo2: string; flowRate: string; device: string; target: string; notes: string }
interface FeverRow { time: string; temp: string; hr: string; rr: string; interventions: string }
interface RespRow { time: string; rr: string; spo2: string; indrawing: string; grunting: string; flaring: string; retractions: string; accessory: string }
interface FluidRow { time: string; inputType: string; inputVol: string; outputType: string; outputVol: string; net: string }
interface NeuroRow { time: string; avpu: string; pupilR: string; pupilL: string; limbR: string; limbL: string; glucose: string; notes: string }

function emptyRow<T>(defaults: T): () => T {
  let i = 0;
  return () => {
    i++;
    return { ...defaults, time: `${String(8 + i).padStart(2, '0')}:00` };
  };
}

const newSpO2Row = emptyRow<SpO2Row>({ time: '08:00', spo2: '', flowRate: '', device: '', target: '', notes: '' });
const newFeverRow = emptyRow<FeverRow>({ time: '08:00', temp: '', hr: '', rr: '', interventions: '' });
const newRespRow = emptyRow<RespRow>({ time: '08:00', rr: '', spo2: '', indrawing: '', grunting: '', flaring: '', retractions: '', accessory: '' });
const newFluidRow = emptyRow<FluidRow>({ time: '08:00', inputType: '', inputVol: '', outputType: '', outputVol: '', net: '' });
const newNeuroRow = emptyRow<NeuroRow>({ time: '08:00', avpu: '', pupilR: '', pupilL: '', limbR: '', limbL: '', glucose: '', notes: '' });

interface MonitoringSheetsProps {
  diagnosisId: string;
  diagnosisName: string;
  severity: string;
}

export function MonitoringSheets({ diagnosisId, diagnosisName, severity }: MonitoringSheetsProps) {
  const [spo2Rows, setSpO2Rows] = useState<SpO2Row[]>([newSpO2Row()]);
  const [feverRows, setFeverRows] = useState<FeverRow[]>([newFeverRow()]);
  const [respRows, setRespRows] = useState<RespRow[]>([newRespRow()]);
  const [fluidRows, setFluidRows] = useState<FluidRow[]>([newFluidRow()]);
  const [neuroRows, setNeuroRows] = useState<NeuroRow[]>([newNeuroRow()]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    spo2: false, fever: false, resp: false, fluid: false, neuro: false,
  });

  const isSevere = severity === 'severe' || severity === 'critical';
  const isRespiratory = ['pneumonia', 'asthma', 'bronchiolitis', 'croup', 'epiglottitis', 'foreign_body_aspiration', 'tb', 'pleural_effusion', 'empyema', 'pneumothorax'].includes(diagnosisId);
  const isInfectious = isRespiratory || ['malaria', 'meningitis', 'sepsis'].includes(diagnosisId);

  const sheets = [
    { key: 'spo2', label: 'SpO₂ / Oxygen Weaning', show: isRespiratory || isSevere },
    { key: 'fever', label: 'Fever Chart', show: isInfectious },
    { key: 'resp', label: 'Respiratory Monitoring', show: isRespiratory },
    { key: 'fluid', label: 'Fluid Balance Chart', show: isSevere || diagnosisId === 'gastroenteritis' },
    { key: 'neuro', label: 'Neurological Observations', show: isSevere },
  ].filter(s => s.show);

  const toggleSheet = (key: string) => setExpanded(p => ({ ...p, [key]: !p[key] }));

  const addRow = useCallback((sheet: string) => {
    switch (sheet) {
      case 'spo2': setSpO2Rows(p => [...p, newSpO2Row()]); break;
      case 'fever': setFeverRows(p => [...p, newFeverRow()]); break;
      case 'resp': setRespRows(p => [...p, newRespRow()]); break;
      case 'fluid': setFluidRows(p => [...p, newFluidRow()]); break;
      case 'neuro': setNeuroRows(p => [...p, newNeuroRow()]); break;
    }
  }, []);

  if (sheets.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-[9px] text-gray-400 italic">
        Monitoring tools relevant to: {diagnosisName} ({severity})
      </p>

      {sheets.map(sheet => {
        const isExp = expanded[sheet.key] !== false;
        return (
          <div key={sheet.key} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <button onClick={() => toggleSheet(sheet.key)}
              className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{sheet.label}</span>
              <span className={`text-gray-400 transition-transform text-xs ${isExp ? 'rotate-180' : ''}`}>▾</span>
            </button>

            {isExp && (
              <div className="px-3 pb-3">
                {sheet.key === 'spo2' && (
                  <div>
                    <p className="text-[8px] text-gray-400 mb-1">Target: neonates 91–95% | infants/children ≥90% | severe: ≥88%</p>
                    <MonitoringTable headers={['Time', 'SpO₂ (%)', 'FiO₂ / Flow', 'Device', 'Target', 'Notes']}>
                      {spo2Rows.map((row, i) => (
                        <tr key={i}>
                          <td><input value={row.time} onChange={e => { const r = [...spo2Rows]; r[i] = { ...r[i], time: e.target.value }; setSpO2Rows(r); }} className="mon-input w-14" /></td>
                          <td><input value={row.spo2} onChange={e => { const r = [...spo2Rows]; r[i] = { ...r[i], spo2: e.target.value }; setSpO2Rows(r); }} className="mon-input w-12" /></td>
                          <td><input value={row.flowRate} onChange={e => { const r = [...spo2Rows]; r[i] = { ...r[i], flowRate: e.target.value }; setSpO2Rows(r); }} className="mon-input w-16" /></td>
                          <td>
                            <select value={row.device} onChange={e => { const r = [...spo2Rows]; r[i] = { ...r[i], device: e.target.value }; setSpO2Rows(r); }} className="mon-input w-20 text-[9px]">
                              <option value="">—</option>
                              <option value="Nasal cannula">Nasal cannula</option>
                              <option value="Face mask">Face mask</option>
                              <option value="NRB mask">NRB mask</option>
                              <option value="Hood">Hood</option>
                              <option value="CPAP">CPAP</option>
                              <option value="Ventilator">Ventilator</option>
                            </select>
                          </td>
                          <td><input value={row.target} onChange={e => { const r = [...spo2Rows]; r[i] = { ...r[i], target: e.target.value }; setSpO2Rows(r); }} className="mon-input w-14" placeholder="≥90%" /></td>
                          <td><input value={row.notes} onChange={e => { const r = [...spo2Rows]; r[i] = { ...r[i], notes: e.target.value }; setSpO2Rows(r); }} className="mon-input w-24" /></td>
                        </tr>
                      ))}
                    </MonitoringTable>
                    <AddRowButton onClick={() => addRow('spo2')} />
                  </div>
                )}

                {sheet.key === 'fever' && (
                  <div>
                    <p className="text-[8px] text-gray-400 mb-1">Record temperature, HR, RR, and any antipyretic given</p>
                    <MonitoringTable headers={['Time', 'Temp (°C)', 'HR', 'RR', 'Interventions']}>
                      {feverRows.map((row, i) => (
                        <tr key={i}>
                          <td><input value={row.time} onChange={e => { const r = [...feverRows]; r[i] = { ...r[i], time: e.target.value }; setFeverRows(r); }} className="mon-input w-14" /></td>
                          <td><input value={row.temp} onChange={e => { const r = [...feverRows]; r[i] = { ...r[i], temp: e.target.value }; setFeverRows(r); }} className="mon-input w-12" /></td>
                          <td><input value={row.hr} onChange={e => { const r = [...feverRows]; r[i] = { ...r[i], hr: e.target.value }; setFeverRows(r); }} className="mon-input w-12" /></td>
                          <td><input value={row.rr} onChange={e => { const r = [...feverRows]; r[i] = { ...r[i], rr: e.target.value }; setFeverRows(r); }} className="mon-input w-12" /></td>
                          <td><input value={row.interventions} onChange={e => { const r = [...feverRows]; r[i] = { ...r[i], interventions: e.target.value }; setFeverRows(r); }} className="mon-input w-32" placeholder="Paracetamol, tepid sponging..." /></td>
                        </tr>
                      ))}
                    </MonitoringTable>
                    <AddRowButton onClick={() => addRow('fever')} />
                  </div>
                )}

                {sheet.key === 'resp' && (
                  <div>
                    <p className="text-[8px] text-gray-400 mb-1">Monitor respiratory distress signs hourly</p>
                    <MonitoringTable headers={['Time', 'RR', 'SpO₂', 'Indrawing', 'Grunting', 'Flaring', 'Retractions', 'Accessory']}>
                      {respRows.map((row, i) => (
                        <tr key={i}>
                          <td><input value={row.time} onChange={e => { const r = [...respRows]; r[i] = { ...r[i], time: e.target.value }; setRespRows(r); }} className="mon-input w-14" /></td>
                          <td><input value={row.rr} onChange={e => { const r = [...respRows]; r[i] = { ...r[i], rr: e.target.value }; setRespRows(r); }} className="mon-input w-12" /></td>
                          <td><input value={row.spo2} onChange={e => { const r = [...respRows]; r[i] = { ...r[i], spo2: e.target.value }; setRespRows(r); }} className="mon-input w-12" /></td>
                          <td><select value={row.indrawing} onChange={e => { const r = [...respRows]; r[i] = { ...r[i], indrawing: e.target.value }; setRespRows(r); }} className="mon-input w-16 text-[9px]"><option value="">—</option><option value="None">None</option><option value="Mild">Mild</option><option value="Moderate">Moderate</option><option value="Severe">Severe</option></select></td>
                          <td><YesNo value={row.grunting} onChange={v => { const r = [...respRows]; r[i] = { ...r[i], grunting: v }; setRespRows(r); }} /></td>
                          <td><YesNo value={row.flaring} onChange={v => { const r = [...respRows]; r[i] = { ...r[i], flaring: v }; setRespRows(r); }} /></td>
                          <td><YesNo value={row.retractions} onChange={v => { const r = [...respRows]; r[i] = { ...r[i], retractions: v }; setRespRows(r); }} /></td>
                          <td><YesNo value={row.accessory} onChange={v => { const r = [...respRows]; r[i] = { ...r[i], accessory: v }; setRespRows(r); }} /></td>
                        </tr>
                      ))}
                    </MonitoringTable>
                    <AddRowButton onClick={() => addRow('resp')} />
                  </div>
                )}

                {sheet.key === 'fluid' && (
                  <div>
                    <p className="text-[8px] text-gray-400 mb-1">Record all inputs and outputs. Calculate net balance.</p>
                    <MonitoringTable headers={['Time', 'Input Type', 'Input Vol (mL)', 'Output Type', 'Output Vol (mL)', 'Net (mL)']}>
                      {fluidRows.map((row, i) => (
                        <tr key={i}>
                          <td><input value={row.time} onChange={e => { const r = [...fluidRows]; r[i] = { ...r[i], time: e.target.value }; setFluidRows(r); }} className="mon-input w-14" /></td>
                          <td>
                            <select value={row.inputType} onChange={e => { const r = [...fluidRows]; r[i] = { ...r[i], inputType: e.target.value }; setFluidRows(r); }} className="mon-input w-24 text-[9px]">
                              <option value="">—</option>
                              <option value="IV fluids">IV fluids</option>
                              <option value="Oral feeds">Oral feeds</option>
                              <option value="NG feeds">NG feeds</option>
                              <option value="Blood transfusion">Blood transfusion</option>
                              <option value="Medication">Medication</option>
                            </select>
                          </td>
                          <td><input value={row.inputVol} onChange={e => { const r = [...fluidRows]; r[i] = { ...r[i], inputVol: e.target.value }; setFluidRows(r); }} className="mon-input w-16" /></td>
                          <td>
                            <select value={row.outputType} onChange={e => { const r = [...fluidRows]; r[i] = { ...r[i], outputType: e.target.value }; setFluidRows(r); }} className="mon-input w-24 text-[9px]">
                              <option value="">—</option>
                              <option value="Urine">Urine</option>
                              <option value="Stool">Stool</option>
                              <option value="Vomitus">Vomitus</option>
                              <option value="NG output">NG output</option>
                              <option value="Chest drain">Chest drain</option>
                            </select>
                          </td>
                          <td><input value={row.outputVol} onChange={e => { const r = [...fluidRows]; r[i] = { ...r[i], outputVol: e.target.value }; setFluidRows(r); }} className="mon-input w-16" /></td>
                          <td className={`text-[10px] font-mono font-bold ${parseInt(row.net) < 0 ? 'text-red-600' : parseInt(row.net) > 0 ? 'text-green-600' : ''}`}>
                            {row.inputVol && row.outputVol ? (parseInt(row.inputVol) - parseInt(row.outputVol)).toString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </MonitoringTable>
                    <AddRowButton onClick={() => addRow('fluid')} />
                  </div>
                )}

                {sheet.key === 'neuro' && (
                  <div>
                    <p className="text-[8px] text-gray-400 mb-1">AVPU: Alert / Voice / Pain / Unresponsive. Pupils: size + reactivity.</p>
                    <MonitoringTable headers={['Time', 'AVPU', 'Pupil (R)', 'Pupil (L)', 'Limb (R)', 'Limb (L)', 'Glucose', 'Notes']}>
                      {neuroRows.map((row, i) => (
                        <tr key={i}>
                          <td><input value={row.time} onChange={e => { const r = [...neuroRows]; r[i] = { ...r[i], time: e.target.value }; setNeuroRows(r); }} className="mon-input w-14" /></td>
                          <td>
                            <select value={row.avpu} onChange={e => { const r = [...neuroRows]; r[i] = { ...r[i], avpu: e.target.value }; setNeuroRows(r); }} className="mon-input w-20 text-[9px]">
                              <option value="">—</option>
                              <option value="Alert">Alert</option>
                              <option value="Voice">Voice</option>
                              <option value="Pain">Pain</option>
                              <option value="Unresponsive">Unresponsive</option>
                            </select>
                          </td>
                          <td><input value={row.pupilR} onChange={e => { const r = [...neuroRows]; r[i] = { ...r[i], pupilR: e.target.value }; setNeuroRows(r); }} className="mon-input w-16" placeholder="3+ brisk" /></td>
                          <td><input value={row.pupilL} onChange={e => { const r = [...neuroRows]; r[i] = { ...r[i], pupilL: e.target.value }; setNeuroRows(r); }} className="mon-input w-16" placeholder="3+ brisk" /></td>
                          <td>
                            <select value={row.limbR} onChange={e => { const r = [...neuroRows]; r[i] = { ...r[i], limbR: e.target.value }; setNeuroRows(r); }} className="mon-input w-16 text-[9px]">
                              <option value="">—</option>
                              <option value="Normal">Normal</option>
                              <option value="Weak">Weak</option>
                              <option value="Spastic">Spastic</option>
                              <option value="Flaccid">Flaccid</option>
                            </select>
                          </td>
                          <td>
                            <select value={row.limbL} onChange={e => { const r = [...neuroRows]; r[i] = { ...r[i], limbL: e.target.value }; setNeuroRows(r); }} className="mon-input w-16 text-[9px]">
                              <option value="">—</option>
                              <option value="Normal">Normal</option>
                              <option value="Weak">Weak</option>
                              <option value="Spastic">Spastic</option>
                              <option value="Flaccid">Flaccid</option>
                            </select>
                          </td>
                          <td><input value={row.glucose} onChange={e => { const r = [...neuroRows]; r[i] = { ...r[i], glucose: e.target.value }; setNeuroRows(r); }} className="mon-input w-14" placeholder="mmol/L" /></td>
                          <td><input value={row.notes} onChange={e => { const r = [...neuroRows]; r[i] = { ...r[i], notes: e.target.value }; setNeuroRows(r); }} className="mon-input w-24" /></td>
                        </tr>
                      ))}
                    </MonitoringTable>
                    <AddRowButton onClick={() => addRow('neuro')} />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <style>{`
        .mon-input {
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          padding: 2px 4px;
          font-size: 10px;
          background: white;
        }
        .mon-input:focus {
          outline: none;
          border-color: #93c5fd;
          box-shadow: 0 0 0 2px rgba(147,197,253,0.3);
        }
      `}</style>
    </div>
  );
}

function MonitoringTable({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[10px] border-collapse">
        <thead>
          <tr className="bg-gray-50">
            {headers.map(h => (
              <th key={h} className="p-1 border border-gray-200 text-[9px] font-semibold text-gray-500 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function AddRowButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="mt-1 text-[9px] px-2 py-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 border border-dashed border-gray-300 w-full">
      + Add Row
    </button>
  );
}

function YesNo({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="mon-input w-16 text-[9px]">
      <option value="">—</option>
      <option value="No">No</option>
      <option value="Yes">Yes</option>
    </select>
  );
}
