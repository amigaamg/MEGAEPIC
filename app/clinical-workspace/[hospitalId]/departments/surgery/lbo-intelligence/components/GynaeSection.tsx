/**
 * Gynaecological History Section — Auto-injected when patient is female 10-55.
 *
 * Follows the AMEXAN rule: IF patient.sex == female AND age 10–55: activate gyne_ob_model.
 */
'use client';
import React from 'react';

export interface GynaeData {
  lmp: string;
  cycleRegular: boolean;
  pregnant: boolean;
  weeksPregnant: string;
  gravida: number;
  para: number;
  miscarriages: number;
  ovarianCyst: boolean;
  fibroids: boolean;
  pelvicSurgery: boolean;
  pelvicInflammatory: boolean;
  lastCervicalSmear: string;
  hormonalContraception: boolean;
  hrt: boolean;
  previousEctopic: boolean;
  ovarianCancerFamily: boolean;
  deniesPregnancy: boolean;
  deniesGynaeSymptoms: boolean;
}

export const EMPTY_GYNAE: GynaeData = {
  lmp: '', cycleRegular: false, pregnant: false, weeksPregnant: '',
  gravida: 0, para: 0, miscarriages: 0,
  ovarianCyst: false, fibroids: false, pelvicSurgery: false,
  pelvicInflammatory: false, lastCervicalSmear: '',
  hormonalContraception: false, hrt: false,
  previousEctopic: false, ovarianCancerFamily: false,
  deniesPregnancy: false, deniesGynaeSymptoms: false,
};

interface GynaeSectionProps {
  data: GynaeData;
  onChange: (data: GynaeData) => void;
  age: number;
}

export default function GynaeSection({ data, onChange, age }: GynaeSectionProps) {
  const set = <K extends keyof GynaeData>(k: K, v: GynaeData[K]) => onChange({ ...data, [k]: v });

  if (age < 10 || age > 55) return null;

  return (
    <div className="border border-purple-200 rounded-xl p-4 bg-purple-50/50">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">♀</span>
        <h3 className="text-base font-bold text-purple-800">Gynaecological & Obstetric History</h3>
        <span className="text-[10px] bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full font-bold">AUTO-INJECTED</span>
      </div>
      <p className="text-xs text-purple-600 mb-3">Auto-activated because patient is female, reproductive age (10-55). Ectopic pregnancy, ovarian pathology, and gynaecological causes of abdominal distension must be excluded.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-gray-500 w-20">LMP:</span>
          <input type="date" value={data.lmp} onChange={e => set('lmp', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs flex-1" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={data.cycleRegular} onChange={e => set('cycleRegular', e.target.checked)} className="w-4 h-4" />
          <span className="text-gray-600">Regular cycles</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={data.pregnant} onChange={e => set('pregnant', e.target.checked)} className="w-4 h-4" />
          <span className="text-gray-600">Currently pregnant</span>
        </label>
        {data.pregnant && (
          <label className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 w-20">Weeks:</span>
            <input value={data.weeksPregnant} onChange={e => set('weeksPregnant', e.target.value)} placeholder="e.g. 32" className="border border-gray-300 rounded px-2 py-1 text-xs w-16" />
          </label>
        )}
        <label className="flex items-center gap-2 text-sm">
          <span className="text-gray-500 w-20">Gravida:</span>
          <input type="number" value={data.gravida} onChange={e => set('gravida', parseInt(e.target.value) || 0)} className="border border-gray-300 rounded px-2 py-1 text-xs w-16" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-gray-500 w-20">Para:</span>
          <input type="number" value={data.para} onChange={e => set('para', parseInt(e.target.value) || 0)} className="border border-gray-300 rounded px-2 py-1 text-xs w-16" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-gray-500 w-20">Miscarriages:</span>
          <input type="number" value={data.miscarriages} onChange={e => set('miscarriages', parseInt(e.target.value) || 0)} className="border border-gray-300 rounded px-2 py-1 text-xs w-16" />
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.ovarianCyst} onChange={e => set('ovarianCyst', e.target.checked)} className="w-4 h-4" /> <span className="text-gray-600">Known ovarian cyst</span></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.fibroids} onChange={e => set('fibroids', e.target.checked)} className="w-4 h-4" /> <span className="text-gray-600">Uterine fibroids</span></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.pelvicSurgery} onChange={e => set('pelvicSurgery', e.target.checked)} className="w-4 h-4" /> <span className="text-gray-600">Previous pelvic surgery</span></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.pelvicInflammatory} onChange={e => set('pelvicInflammatory', e.target.checked)} className="w-4 h-4" /> <span className="text-gray-600">PID history</span></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.previousEctopic} onChange={e => set('previousEctopic', e.target.checked)} className="w-4 h-4" /> <span className="text-gray-600">Previous ectopic</span></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.ovarianCancerFamily} onChange={e => set('ovarianCancerFamily', e.target.checked)} className="w-4 h-4" /> <span className="text-gray-600">Family: ovarian cancer</span></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.hormonalContraception} onChange={e => set('hormonalContraception', e.target.checked)} className="w-4 h-4" /> <span className="text-gray-600">Hormonal contraception</span></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.hrt} onChange={e => set('hrt', e.target.checked)} className="w-4 h-4" /> <span className="text-gray-600">HRT</span></label>
      </div>

      <div className="flex items-center gap-4 mt-3 pt-2 border-t border-purple-200">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.deniesPregnancy} onChange={e => { set('deniesPregnancy', e.target.checked); if (e.target.checked) set('pregnant', false); }} className="w-4 h-4 text-purple-600" /> <span className="text-gray-600">Denies pregnancy (confirmed)</span></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.deniesGynaeSymptoms} onChange={e => set('deniesGynaeSymptoms', e.target.checked)} className="w-4 h-4 text-purple-600" /> <span className="text-gray-600">Denies any gynaecological symptoms</span></label>
      </div>

      {/* Auto-interpretation */}
      {data.deniesPregnancy && data.deniesGynaeSymptoms && (
        <div className="mt-2 p-2 bg-green-100 border border-green-200 rounded-lg text-xs text-green-700">
          ✅ Pregnancy and gynaecological causes of abdominal distension excluded by history.
        </div>
      )}
      {data.pregnant && (
        <div className="mt-2 p-2 bg-amber-100 border border-amber-200 rounded-lg text-xs text-amber-700">
          ⚠️ Patient is pregnant — imaging with contrast is relatively contraindicated. MDT with obstetrics required. Consider alternative imaging (MRI/USS first-line).
        </div>
      )}
    </div>
  );
}
