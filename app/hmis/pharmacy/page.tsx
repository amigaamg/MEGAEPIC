'use client';
import { useState, useMemo } from 'react';
import { PregnancyCategory, PrescriptionType, PrescriptionStatus, PrescriptionItemStatus, calculateStockStatus, getDrugInteractions, checkContraindications } from '@/lib/amexan/hmis/pharmacy-engine';
import type { DrugMaster, Prescription, MedicationInventory, DrugInteraction } from '@/lib/amexan/hmis/pharmacy-engine';

const MOCK_DRUGS: DrugMaster[] = [
  { id: 'DRG-001', genericName: 'Amoxicillin', brandNames: ['Amoxil', 'Moxilen'], therapeuticClass: 'Antibiotic', pharmacologicClass: 'Penicillin', mechanismOfAction: 'Inhibits bacterial cell wall synthesis', indications: ['UTI', 'RTI', 'Otitis media'], contraindications: ['Penicillin allergy'], forms: [{ form: 'capsule' }, { form: 'syrup' }, { form: 'injection' }], routes: ['oral', 'iv'], strengths: [{ form: 'capsule', value: 500, unit: 'mg' }, { form: 'capsule', value: 250, unit: 'mg' }], dosing: { adultDose: '500mg TDS', frequency: 'TDS', duration: '7 days' }, interactions: [], contraindicatedIn: ['penicillin_allergy'], pregnancyCategory: PregnancyCategory.B, lactationSafe: true, renalAdjustment: 'Reduce dose if CrCl < 30', hepaticAdjustment: 'No adjustment needed', monitoring: ['CBC', 'Renal function'], adverseEffects: [{ effect: 'Diarrhea', frequency: 'common', severity: 'mild', management: 'Hydration' }], storages: { temperatureMax: 25, lightSensitive: false, refrigeration: false }, isControlled: false, isAntibiotic: true, antibioticClass: 'Penicillin', requiresTherapeuticDrugMonitoring: false },
  { id: 'DRG-002', genericName: 'Ceftriaxone', brandNames: ['Rocephin'], therapeuticClass: 'Antibiotic', pharmacologicClass: 'Cephalosporin', mechanismOfAction: 'Inhibits bacterial cell wall synthesis', indications: ['Sepsis', 'Meningitis', 'Pneumonia'], contraindications: ['Cephalosporin allergy'], forms: [{ form: 'injection' }], routes: ['iv', 'im'], strengths: [{ form: 'injection', value: 1000, unit: 'mg' }], dosing: { adultDose: '1-2g IV daily', frequency: 'Daily', duration: '7-14 days' }, interactions: [], contraindicatedIn: ['cephalosporin_allergy'], pregnancyCategory: PregnancyCategory.B, lactationSafe: true, renalAdjustment: 'No adjustment needed', hepaticAdjustment: 'No adjustment needed', monitoring: ['CBC', 'LFTs'], adverseEffects: [{ effect: 'Rash', frequency: 'uncommon', severity: 'mild', management: 'Antihistamine' }], storages: { temperatureMax: 25, lightSensitive: false, refrigeration: false }, isControlled: false, isAntibiotic: true, antibioticClass: 'Cephalosporin', requiresTherapeuticDrugMonitoring: false },
  { id: 'DRG-003', genericName: 'Metformin', brandNames: ['Glucophage'], therapeuticClass: 'Antidiabetic', pharmacologicClass: 'Biguanide', mechanismOfAction: 'Decreases hepatic glucose production', indications: ['Type 2 DM'], contraindications: ['Renal failure', 'Hepatic impairment'], forms: [{ form: 'tablet' }], routes: ['oral'], strengths: [{ form: 'tablet', value: 500, unit: 'mg' }, { form: 'tablet', value: 850, unit: 'mg' }], dosing: { adultDose: '500mg BD', frequency: 'BD', duration: 'Long-term' }, interactions: [], contraindicatedIn: ['renal_failure', 'hepatic_impairment'], pregnancyCategory: PregnancyCategory.C, lactationSafe: true, renalAdjustment: 'Contraindicated if CrCl < 30', hepaticAdjustment: 'Contraindicated', monitoring: ['Renal function', 'LFTs', 'Vitamin B12'], adverseEffects: [{ effect: 'GI upset', frequency: 'common', severity: 'mild', management: 'Take with food' }], storages: { temperatureMax: 25, lightSensitive: false, refrigeration: false }, isControlled: false, isAntibiotic: false, requiresTherapeuticDrugMonitoring: false },
];

const MOCK_PRESCRIPTIONS: Prescription[] = [
  { id: 'RX-001', patientId: 'P-001', encounterId: 'ENC-001', prescriberId: 'ACT-001', prescriberName: 'Dr. Smith', items: [{ drugId: 'DRG-002', drugName: 'Ceftriaxone', genericName: 'Ceftriaxone', strength: '1g', form: 'injection', route: 'iv', dose: '1g', frequency: 'Daily', duration: '7 days', quantity: 7, refills: 0, instructions: 'IV infusion over 30 min', indication: 'Sepsis', substitutionAllowed: false, isControlled: false, status: PrescriptionItemStatus.Pending, administered: [] }], status: PrescriptionStatus.Ordered, type: PrescriptionType.Acute, clinicalIndication: 'Sepsis', diagnosis: 'Sepsis', createdAt: Date.now() - 86400000, updatedAt: Date.now() - 3600000 },
  { id: 'RX-002', patientId: 'P-002', encounterId: 'ENC-002', prescriberId: 'ACT-001', prescriberName: 'Dr. Smith', items: [{ drugId: 'DRG-001', drugName: 'Amoxicillin', genericName: 'Amoxicillin', strength: '500mg', form: 'capsule', route: 'oral', dose: '500mg', frequency: 'TDS', duration: '7 days', quantity: 21, refills: 0, instructions: 'Take with food', indication: 'UTI', substitutionAllowed: true, isControlled: false, status: PrescriptionItemStatus.Pending, administered: [] }], status: PrescriptionStatus.Ordered, type: PrescriptionType.Acute, clinicalIndication: 'UTI', diagnosis: 'UTI', createdAt: Date.now() - 43200000, updatedAt: Date.now() - 3600000 },
  { id: 'RX-003', patientId: 'P-003', encounterId: 'ENC-003', prescriberId: 'ACT-002', prescriberName: 'Dr. Jones', items: [{ drugId: 'DRG-003', drugName: 'Metformin', genericName: 'Metformin', strength: '500mg', form: 'tablet', route: 'oral', dose: '500mg', frequency: 'BD', duration: 'Long-term', quantity: 60, refills: 3, instructions: 'Take with meals', indication: 'Type 2 DM', substitutionAllowed: true, isControlled: false, status: PrescriptionItemStatus.Pending, administered: [] }], status: PrescriptionStatus.Verified, type: PrescriptionType.Chronic, clinicalIndication: 'Diabetes', diagnosis: 'Type 2 DM', createdAt: Date.now() - 259200000, updatedAt: Date.now() - 86400000, verifiedAt: Date.now() - 86400000, verifiedBy: 'pharm-01' },
];

const MOCK_INVENTORY: MedicationInventory[] = [
  { id: 'INV-001', drugId: 'DRG-001', batchNumber: 'AMX-2401', expiryDate: '2027-06-30', quantityOnHand: 500, unit: 'capsules', location: 'Shelf A-1', supplier: 'MedSource Ltd', receivedAt: Date.now() - 2592000000, costPerUnit: 12, sellingPricePerUnit: 25, reorderLevel: 100, reorderQuantity: 500, dispensingUnit: 'capsule', isControlled: false },
  { id: 'INV-002', drugId: 'DRG-001', batchNumber: 'AMX-2402', expiryDate: '2025-01-15', quantityOnHand: 50, unit: 'capsules', location: 'Shelf A-2', supplier: 'MedSource Ltd', receivedAt: Date.now() - 7776000000, costPerUnit: 12, sellingPricePerUnit: 25, reorderLevel: 100, reorderQuantity: 500, dispensingUnit: 'capsule', isControlled: false },
  { id: 'INV-003', drugId: 'DRG-002', batchNumber: 'CFT-2401', expiryDate: '2026-03-31', quantityOnHand: 200, unit: 'vials', location: 'Fridge B-1', supplier: 'PharmaCorp', receivedAt: Date.now() - 5184000000, costPerUnit: 450, sellingPricePerUnit: 850, reorderLevel: 50, reorderQuantity: 100, dispensingUnit: 'vial', isControlled: false },
  { id: 'INV-004', drugId: 'DRG-003', batchNumber: 'MET-2401', expiryDate: '2027-09-30', quantityOnHand: 30, unit: 'tablets', location: 'Shelf C-1', supplier: 'MedSource Ltd', receivedAt: Date.now() - 3456000000, costPerUnit: 5, sellingPricePerUnit: 12, reorderLevel: 100, reorderQuantity: 500, dispensingUnit: 'tablet', isControlled: false },
];

export default function PharmacyPage() {
  const [drugs] = useState(MOCK_DRUGS);
  const [prescriptions] = useState(MOCK_PRESCRIPTIONS);
  const [inventory] = useState(MOCK_INVENTORY);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'drugs' | 'prescriptions' | 'inventory'>('drugs');
  const [selectedDrug, setSelectedDrug] = useState<string | null>(null);

  const stockStatus = useMemo(() => calculateStockStatus(inventory), [inventory]);

  const filteredDrugs = useMemo(() => {
    if (!search) return drugs;
    const q = search.toLowerCase();
    return drugs.filter(d => d.genericName.toLowerCase().includes(q) || d.brandNames.some(b => b.toLowerCase().includes(q)) || d.therapeuticClass.toLowerCase().includes(q));
  }, [drugs, search]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Pharmacy Engine</h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>Book X — Drug master, interactions, inventory, MAR, prescriptions</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
        {[{ label: 'Drugs', value: drugs.length, color: '#22D3EE' }, { label: 'Rx Active', value: prescriptions.filter(p => p.status === PrescriptionStatus.Ordered || p.status === PrescriptionStatus.Verified).length, color: '#3B82F6' }, { label: 'In Stock', value: stockStatus.inStock, color: '#10B981' }, { label: 'Low Stock', value: stockStatus.lowStock, color: '#F59E0B' }, { label: 'Expired', value: stockStatus.expired, color: '#EF4444' }, { label: 'Out of Stock', value: stockStatus.outOfStock, color: '#DC2626' }].map(stat => (
          <div key={stat.label} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: "'Syne',sans-serif" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8 }}>
        {(['drugs', 'prescriptions', 'inventory'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: tab === t ? 'rgba(34,211,238,0.15)' : 'transparent', color: tab === t ? '#22D3EE' : '#64748B', fontSize: 12, fontWeight: tab === t ? 600 : 400, cursor: 'pointer' }}>
            {t === 'drugs' ? '💊 Drug Master' : t === 'prescriptions' ? '📋 Prescriptions' : '📦 Inventory'}
          </button>
        ))}
      </div>

      {tab === 'drugs' && (
        <>
          <input placeholder="Search drugs by name, brand, class..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', fontSize: 12, outline: 'none', maxWidth: 400 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredDrugs.map(drug => {
              const isSelected = selectedDrug === drug.id;
              return (
                <div key={drug.id} onClick={() => setSelectedDrug(isSelected ? null : drug.id)} style={{ padding: 14, borderRadius: 10, cursor: 'pointer', background: isSelected ? 'rgba(34,211,238,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isSelected ? 'rgba(34,211,238,0.3)' : 'rgba(255,255,255,0.06)'}`, transition: 'all 0.15s' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{drug.genericName} <span style={{ fontSize: 11, color: '#64748B', fontWeight: 400 }}>{drug.brandNames.join(', ')}</span></div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>{drug.therapeuticClass} · {drug.pharmacologicClass} · {drug.forms.map(f => f.form).join(', ')}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {drug.isAntibiotic && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>ABX</span>}
                      {drug.isControlled && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>C-{drug.controlledSchedule}</span>}
                      <span style={{ fontSize: 12, color: '#475569' }}>{isSelected ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                      <div style={{ fontSize: 11, color: '#E2E8F0', marginBottom: 8 }}>{drug.mechanismOfAction}</div>
                      <div className="flex gap-4" style={{ flexWrap: 'wrap', marginBottom: 8 }}>
                        <div style={{ fontSize: 11, color: '#64748B' }}>Dosing: <span style={{ color: '#E2E8F0' }}>{drug.dosing.adultDose} {drug.dosing.frequency}</span></div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>Pregnancy: <span style={{ color: '#E2E8F0' }}>Category {drug.pregnancyCategory}</span></div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>Lactation: <span style={{ color: drug.lactationSafe ? '#10B981' : '#EF4444' }}>{drug.lactationSafe ? 'Safe' : 'Not recommended'}</span></div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>Contraindications</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                        {drug.contraindicatedIn.map(c => <span key={c} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>{c}</span>)}
                        {drug.contraindicatedIn.length === 0 && <span style={{ fontSize: 10, color: '#475569' }}>None</span>}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>Adverse Effects</div>
                      {drug.adverseEffects.map((ae, i) => <div key={i} style={{ fontSize: 11, color: '#94A3B8' }}>{ae.effect} ({ae.frequency}, {ae.severity}) — {ae.management}</div>)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === 'inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {inventory.map(item => {
            const drug = drugs.find(d => d.id === item.drugId);
            const isExpired = new Date(item.expiryDate) < new Date();
            const isLow = item.quantityOnHand <= item.reorderLevel;
            return (
              <div key={item.id} style={{ padding: 14, borderRadius: 10, background: isExpired ? 'rgba(239,68,68,0.05)' : isLow ? 'rgba(245,158,11,0.05)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isExpired ? 'rgba(239,68,68,0.15)' : isLow ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.06)'}` }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{drug?.genericName || item.drugId} <span style={{ fontSize: 10, color: '#64748B', fontWeight: 400 }}>Batch: {item.batchNumber}</span></div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>{item.location} · {item.supplier} · Exp: {item.expiryDate}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: isExpired ? '#EF4444' : isLow ? '#F59E0B' : '#10B981' }}>{item.quantityOnHand}</div>
                      <div style={{ fontSize: 10, color: '#64748B' }}>{item.unit}</div>
                    </div>
                    {isLow && <span style={{ fontSize: 10, color: '#F59E0B' }}>⚠ Reorder at {item.reorderLevel}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'prescriptions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {prescriptions.map(rx => (
            <div key={rx.id} style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{rx.id} <span style={{ fontSize: 10, color: '#64748B', fontWeight: 400 }}>by {rx.prescriberName} · {rx.type}</span></div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>{rx.clinicalIndication} · Patient: {rx.patientId}</div>
                </div>
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: rx.status === PrescriptionStatus.Verified ? 'rgba(16,185,129,0.15)' : rx.status === PrescriptionStatus.Ordered ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)', color: rx.status === PrescriptionStatus.Verified ? '#10B981' : rx.status === PrescriptionStatus.Ordered ? '#3B82F6' : '#94A3B8' }}>{rx.status}</span>
              </div>
              <div style={{ marginTop: 8 }}>
                {rx.items.map((item, i) => (
                  <div key={i} style={{ fontSize: 12, color: '#E2E8F0', padding: '4px 0' }}>→ {item.drugName} {item.strength} {item.form} · {item.dose} {item.frequency} × {item.duration} · Qty: {item.quantity}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
