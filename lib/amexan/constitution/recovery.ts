import type { AmxUid } from './types';

export interface RecoveryRequest {
  id: string;
  uid: AmxUid;
  email: string;
  method: 'email' | 'phone' | 'security_questions' | 'backup_codes' | 'admin';
  code: string;
  codeHash: string;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
  status: 'pending' | 'verified' | 'completed' | 'expired' | 'blocked';
  completedAt?: number;
  ipAddress?: string;
  deviceInfo?: string;
  createdAt: number;
}

export interface RecoveryEvent {
  id: string;
  uid: AmxUid;
  type: 'initiated' | 'code_sent' | 'verified' | 'reset' | 'failed_attempt' | 'expired' | 'blocked';
  timestamp: number;
  ipAddress?: string;
  deviceInfo?: string;
  details?: string;
}

export function generateRecoveryCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function createRecoveryRequest(
  uid: AmxUid,
  email: string,
  method: RecoveryRequest['method'],
): Omit<RecoveryRequest, 'id'> {
  const code = generateRecoveryCode();
  return {
    uid,
    email,
    method,
    code,
    codeHash: '', // computed asynchronously
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
    attempts: 0,
    maxAttempts: 5,
    status: 'pending',
    createdAt: Date.now(),
  };
}

export async function initiateRecovery(
  uid: AmxUid,
  email: string,
  method: RecoveryRequest['method'],
): Promise<{ request: Omit<RecoveryRequest, 'id'>; code: string }> {
  const request = createRecoveryRequest(uid, email, method);
  const code = request.code;
  request.codeHash = await hashCode(code);
  return { request: { ...request, code: '' }, code };
}

export function isRecoveryExpired(request: RecoveryRequest): boolean {
  return Date.now() > request.expiresAt;
}

export function isRecoveryBlocked(request: RecoveryRequest): boolean {
  return request.attempts >= request.maxAttempts || request.status === 'blocked';
}

export async function verifyRecoveryCode(
  request: RecoveryRequest,
  providedCode: string,
): Promise<{ valid: boolean; reason?: string }> {
  if (isRecoveryExpired(request)) {
    return { valid: false, reason: 'Recovery code has expired' };
  }
  if (isRecoveryBlocked(request)) {
    return { valid: false, reason: 'Account recovery is blocked due to too many attempts' };
  }
  if (request.status === 'completed') {
    return { valid: false, reason: 'Recovery has already been completed' };
  }

  const providedHash = await hashCode(providedCode);
  if (providedHash === request.codeHash) {
    return { valid: true };
  }

  request.attempts++;
  if (request.attempts >= request.maxAttempts) {
    return { valid: false, reason: 'Too many failed attempts. Account recovery is now blocked.' };
  }
  return { valid: false, reason: `Invalid code. ${request.maxAttempts - request.attempts} attempts remaining.` };
}

export function getBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    codes.push(generateRecoveryCode());
  }
  return codes;
}
