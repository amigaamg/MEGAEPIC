import type { AmxUid } from './types';
import type { Shift } from './shift-engine';

export interface SchedulePattern {
  id: string;
  workerId: AmxUid;
  organizationId: string;
  type: 'fixed' | 'rotating' | 'flexible' | 'on_call';
  weeklyPattern: number[]; // days of week (0=Sun, 6=Sat)
  shiftType: Shift['type'];
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  effectiveFrom: number;
  effectiveTo?: number;
  exceptions: ScheduleException[];
}

export interface ScheduleException {
  date: number;
  type: 'off' | 'half_day' | 'shift_swap' | 'extended' | 'on_call';
  reason?: string;
}

export interface WeeklyRoster {
  weekStart: number;
  shifts: { date: number; workerId: AmxUid; shift: Partial<Shift> }[];
}

export function createSchedulePattern(workerId: AmxUid, orgId: string, pattern: Omit<SchedulePattern, 'id'>): SchedulePattern {
  return { ...pattern, id: `sched-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`, workerId, organizationId: orgId };
}

export function getTodaySchedule(patterns: SchedulePattern[]): SchedulePattern[] {
  const today = new Date().getDay();
  return patterns.filter(p => p.weeklyPattern.includes(today) && (!p.effectiveTo || Date.now() <= p.effectiveTo));
}

export function getOnCallWorkers(patterns: SchedulePattern[], date: number): AmxUid[] {
  return patterns.filter(p => {
    const day = new Date(date).getDay();
    return p.weeklyPattern.includes(day) && p.shiftType === 'on_call' && (!p.effectiveTo || date <= p.effectiveTo);
  }).map(p => p.workerId);
}

export function detectScheduleConflicts(patterns: SchedulePattern[], newPattern: SchedulePattern): ScheduleException[] {
  const conflicts: ScheduleException[] = [];
  for (const existing of patterns) {
    if (existing.workerId !== newPattern.workerId) continue;
    const overlap = existing.weeklyPattern.filter(d => newPattern.weeklyPattern.includes(d));
    if (overlap.length > 0) {
      for (const day of overlap) {
        conflicts.push({ date: day, type: 'off', reason: `Schedule conflict with existing pattern on day ${day}` });
      }
    }
  }
  return conflicts;
}

export function generateWeeklyRoster(patterns: SchedulePattern[], weekStart: number): WeeklyRoster {
  const roster: WeeklyRoster = { weekStart, shifts: [] };
  for (let i = 0; i < 7; i++) {
    const date = weekStart + i * 86400000;
    const dayOfWeek = new Date(date).getDay();
    for (const pattern of patterns) {
      if (pattern.weeklyPattern.includes(dayOfWeek) && (!pattern.effectiveTo || date <= pattern.effectiveTo)) {
        roster.shifts.push({
          date,
          workerId: pattern.workerId,
          shift: {
            startTime: date + parseTime(pattern.startTime),
            endTime: date + parseTime(pattern.endTime),
            type: pattern.shiftType,
          },
        });
      }
    }
  }
  return roster;
}

function parseTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours * 60 + minutes) * 60 * 1000;
}
