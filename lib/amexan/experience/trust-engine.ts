// AMEXAN Experience Engine - Trust Engine
// Constitutional Principle: Trust is earned through transparency. Never hide what data is used.

export interface TrustInput {
  dataAccess: { resource: string; purpose: string }[];
  aiAssistUsed: boolean;
  syncPending: number;
  sourceAttribution: boolean;
}

export interface TrustDecision {
  transparent: boolean;
  disclosureLines: string[];
  aiLabeled: boolean;
  provenanceVisible: boolean;
  trustLevel: 'low' | 'medium' | 'high';
  reason: string;
}

export function assessTrust(input: TrustInput): TrustDecision {
  const disclosures = input.dataAccess.map((d) => `${d.resource} used for ${d.purpose}`);

  if (!input.sourceAttribution) {
    return {
      transparent: false,
      disclosureLines: disclosures,
      aiLabeled: input.aiAssistUsed,
      provenanceVisible: false,
      trustLevel: 'low',
      reason: 'Source attribution is missing. Trust cannot be established.',
    };
  }

  if (input.syncPending > 0) {
    return {
      transparent: true,
      disclosureLines: disclosures,
      aiLabeled: input.aiAssistUsed,
      provenanceVisible: true,
      trustLevel: 'medium',
      reason: 'Provenance visible but pending sync may delay freshest data.',
    };
  }

  return {
    transparent: true,
    disclosureLines: disclosures,
    aiLabeled: input.aiAssistUsed,
    provenanceVisible: true,
    trustLevel: 'high',
    reason: 'Every data source is attributed and current.',
  };
}

export function everyAiOutputLabeled(input: { aiAssistUsed: boolean; labeled: boolean }): boolean {
  return !input.aiAssistUsed || input.labeled;
}

export const trustEngine = {
  assess: assessTrust,
  aiLabeled: everyAiOutputLabeled,
};

export type TrustEngine = typeof trustEngine;
