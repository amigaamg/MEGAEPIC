/**
 * Drug Risk Analyzer — Parses drug history for constipating/ileus-causing drugs
 * and displays a live risk score with flagged medications.
 */
'use client';
import React from 'react';

export interface FlaggedDrug {
  drug: string;
  drugClass: string;
  risk: string;
  weight: number;
  severity: 'low' | 'moderate' | 'high';
}

const DRUG_PATTERNS: { regex: RegExp; drug: string; drugClass: string; risk: string; weight: number }[] = [
  { regex: /morphine/i, drug: 'Morphine', drugClass: 'Opioid', risk: 'Powerful constipating effect; slows gut transit', weight: 30 },
  { regex: /codeine/i, drug: 'Codeine', drugClass: 'Opioid', risk: 'Constipating at standard doses', weight: 25 },
  { regex: /tramadol/i, drug: 'Tramadol', drugClass: 'Opioid', risk: 'Moderate constipating effect', weight: 20 },
  { regex: /fentanyl/i, drug: 'Fentanyl', drugClass: 'Opioid', risk: 'Constipating; transdermal still affects gut', weight: 25 },
  { regex: /oxycodone/i, drug: 'Oxycodone', drugClass: 'Opioid', risk: 'Severe constipation common', weight: 30 },
  { regex: /dihydrocodeine/i, drug: 'Dihydrocodeine', drugClass: 'Opioid', risk: 'Constipating', weight: 25 },
  { regex: /amitriptyline|nortriptyline/i, drug: 'Tricyclic Antidepressant', drugClass: 'Anticholinergic', risk: 'Anticholinergic → reduces gut motility', weight: 20 },
  { regex: /imipramine|dosulepin|clomipramine/i, drug: 'TCA (other)', drugClass: 'Anticholinergic', risk: 'Anticholinergic effect slows peristalsis', weight: 20 },
  { regex: /oxybutynin|tolterodine|solifenacin|darifenacin|fesoterodine/i, drug: 'Anticholinergic (bladder)', drugClass: 'Anticholinergic', risk: 'Reduces detrusor and gut motility', weight: 20 },
  { regex: /verapamil/i, drug: 'Verapamil', drugClass: 'Calcium Channel Blocker', risk: 'Constipating effect well-documented', weight: 15 },
  { regex: /nifedipine|amlodipine|felodipine|lercanidipine/i, drug: 'DHP-CCB', drugClass: 'Calcium Channel Blocker', risk: 'Mild constipating effect', weight: 10 },
  { regex: /ferrous|ferric|iron/i, drug: 'Iron Supplement', drugClass: 'Iron', risk: 'Common cause of constipation, especially in elderly', weight: 10 },
  { regex: /loperamide|diphenoxylate/i, drug: 'Antidiarrhoeal', drugClass: 'Antidiarrhoeal', risk: 'Deliberately constipating', weight: 20 },
  { regex: /chlorpromazine|haloperidol|olanzapine|clozapine|risperidone|quetiapine/i, drug: 'Antipsychotic', drugClass: 'Antipsychotic', risk: 'Anticholinergic + serotonin effects → constipation', weight: 15 },
  { regex: /cyclizine|promethazine|prochlorperazine/i, drug: 'Antiemetic (phenothiazine)', drugClass: 'Anticholinergic', risk: 'Anticholinergic → reduced motility', weight: 10 },
  { regex: /atropine|hyoscine|glycopyrrolate/i, drug: 'Antimuscarinic', drugClass: 'Anticholinergic', risk: 'Powerful anticholinergic → ileus risk', weight: 25 },
  { regex: /gabapentin|pregabalin/i, drug: 'Gabapentinoid', drugClass: 'Other', risk: 'May contribute to constipation in elderly', weight: 5 },
];

interface DrugRiskAnalyzerProps {
  drugHistory: string;
  onRiskScoreChange?: (score: number) => void;
}

export function analyzeDrugRisk(drugHistory: string): { score: number; flagged: FlaggedDrug[]; riskLevel: 'low' | 'moderate' | 'high' } {
  const dh = drugHistory || '';
  const flagged: FlaggedDrug[] = [];

  for (const pattern of DRUG_PATTERNS) {
    if (pattern.regex.test(dh)) {
      flagged.push({
        drug: pattern.drug,
        drugClass: pattern.drugClass,
        risk: pattern.risk,
        weight: pattern.weight,
        severity: pattern.weight >= 25 ? 'high' : pattern.weight >= 15 ? 'moderate' : 'low',
      });
    }
  }

  // Deduplicate by drug class
  const seen = new Set<string>();
  const unique = flagged.filter(f => {
    if (seen.has(f.drugClass)) return false;
    seen.add(f.drugClass);
    return true;
  });

  const score = unique.reduce((s, f) => s + f.weight, 0);
  const riskLevel = score >= 40 ? 'high' : score >= 15 ? 'moderate' : 'low';

  return { score, flagged: unique, riskLevel };
}

export default function DrugRiskAnalyzer({ drugHistory, onRiskChange }: DrugRiskAnalyzerProps & { onRiskChange?: (score: number) => void }) {
  const result = analyzeDrugRisk(drugHistory);

  React.useEffect(() => {
    onRiskChange?.(result.score);
  }, [result.score]);

  if (result.flagged.length === 0) return null;

  return (
    <div className={`border rounded-xl p-3 ${result.riskLevel === 'high' ? 'bg-red-50 border-red-200' : result.riskLevel === 'moderate' ? 'bg-amber-50 border-amber-200' : 'bg-yellow-50 border-yellow-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wide">
          {result.riskLevel === 'high' ? '🚨 High Constipation Risk' : result.riskLevel === 'moderate' ? '⚠️ Moderate Constipation Risk' : 'ℹ️ Low Constipation Risk'}
        </span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          result.riskLevel === 'high' ? 'bg-red-200 text-red-800' : result.riskLevel === 'moderate' ? 'bg-amber-200 text-amber-800' : 'bg-yellow-200 text-yellow-800'
        }`}>
          Score: {result.score}
        </span>
      </div>
      <div className="space-y-1">
        {result.flagged.map((f, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <span className={`mt-0.5 ${f.severity === 'high' ? 'text-red-500' : f.severity === 'moderate' ? 'text-amber-500' : 'text-yellow-500'}`}>
              {f.severity === 'high' ? '🔴' : f.severity === 'moderate' ? '🟡' : '🟢'}
            </span>
            <div>
              <span className="font-medium text-gray-700">{f.drug}</span>
              <span className="text-gray-400"> ({f.drugClass})</span>
              <p className="text-gray-500">{f.risk}</p>
            </div>
          </div>
        ))}
      </div>
      {result.riskLevel === 'high' && (
        <p className="text-xs text-red-600 font-medium mt-1">Consider bowel preparation, stool softeners, or alternative analgesia.</p>
      )}
    </div>
  );
}
