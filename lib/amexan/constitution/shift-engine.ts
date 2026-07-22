import type { AmxUid } from './types';

export interface Shift {
  id: string;
  workerId: AmxUid;
  organizationId: string;
  departmentId: string;
  startTime: number;
  endTime: number;
  type: 'morning' | 'afternoon' | 'night' | 'on_call' | 'standby' | 'custom';
  status: 'scheduled' | 'active' | 'completed' | 'cancelled' | 'missed';
  clockedInAt?: number;
  clockedOutAt?: number;
  breakStart?: number;
  breakEnd?: number;
  location?: string;
  notes?: string;
  swapRequestedWith?: AmxUid;
  swapApproved?: boolean;
}

export function createShift(workerId: AmxUid, orgId: string, deptId: string, start: number, end: number, type: Shift['type']): Omit<Shift, 'id'> {
  return {
    workerId,
    organizationId: orgId,
    departmentId: deptId,
    startTime: start,
    endTime: end,
    type,
    status: 'scheduled',
  };
}

export function clockIn(shift: Shift): Shift {
  return { ...shift, status: 'active', clockedInAt: Date.now() };
}

export function clockOut(shift: Shift): Shift {
  return { ...shift, status: 'completed', clockedOutAt: Date.now() };
}

export function startBreak(shift: Shift): Shift {
  return { ...shift, breakStart: Date.now() };
}

export function endBreak(shift: Shift): Shift {
  return { ...shift, breakEnd: Date.now() };
}

export function getCurrentShift(shifts: Shift[]): Shift | null {
  const now = Date.now();
  return shifts.find(s => s.startTime <= now && s.endTime >= now && (s.status === 'active' || s.status === 'scheduled')) ?? null;
}

export function getActiveWorkers(shifts: Shift[]): AmxUid[] {
  const now = Date.now();
  return shifts.filter(s => s.startTime <= now && s.endTime >= now && s.status === 'active').map(s => s.workerId);
}

export function getShiftsByDate(shifts: Shift[], date: number): Shift[] {
  const startOfDay = new Date(date).setHours(0, 0, 0, 0);
  const endOfDay = new Date(date).setHours(23, 59, 59, 999);
  return shifts.filter(s => s.startTime >= startOfDay && s.startTime <= endOfDay);
}

export function requestShiftSwap(shift: Shift, targetWorkerId: AmxUid): Shift {
  return { ...shift, swapRequestedWith: targetWorkerId, swapApproved: false };
}

export function approveShiftSwap(shift: Shift): Shift {
  return { ...shift, swapApproved: true, workerId: shift.swapRequestedWith ?? shift.workerId };
}
