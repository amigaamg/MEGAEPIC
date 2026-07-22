import type { AmxUid } from './types';

const PREFIXES: Record<string, string> = {
  person: 'PER',
  organization: 'ORG',
  device: 'DEV',
  ai: 'AI',
  system: 'SYS',
  patient: 'PAT',
};

function generateChecksum(prefix: string, timestamp: string, random: string): string {
  const raw = prefix + timestamp + random;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const checksum = (Math.abs(hash) % 36).toString(36).toUpperCase();
  return checksum;
}

export function generateAmxUid(type: keyof typeof PREFIXES): AmxUid {
  const prefix = PREFIXES[type];
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const checksum = generateChecksum(prefix, timestamp, random);
  return `AMX-${prefix}-${timestamp}-${random}${checksum}` as AmxUid;
}

export function validateAmxUid(uid: string): boolean {
  const pattern = /^AMX-(PER|ORG|DEV|AI|SYS|PAT)-[0-9A-Z]+-[0-9A-Z]{5}$/;
  if (!pattern.test(uid)) return false;
  const parts = uid.split('-');
  const prefix = parts[1];
  const timestamp = parts[2];
  const randomChecksum = parts[3];
  const random = randomChecksum.substring(0, 4);
  const checksum = randomChecksum.substring(4);
  const expected = generateChecksum(prefix, timestamp, random);
  return checksum === expected;
}

export function getAmxUidType(uid: string): keyof typeof PREFIXES | null {
  const pattern = /^AMX-(PER|ORG|DEV|AI|SYS|PAT)-/;
  const match = uid.match(pattern);
  if (!match) return null;
  const reverse: Record<string, keyof typeof PREFIXES> = {
    PER: 'person',
    ORG: 'organization',
    DEV: 'device',
    AI: 'ai',
    SYS: 'system',
    PAT: 'patient',
  };
  return reverse[match[1]] ?? null;
}
