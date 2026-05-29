'use client';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

interface DailyTask {
  id: string;
  time: string;
  label: string;
  type: 'medication' | 'measurement' | 'activity' | 'check-in' | 'education';
  detail: string;
  done: boolean;
  icon: string;
}

interface Props {
  patientName: string;
  date: Date;
  tasks: DailyTask[];
  greeting?: string;
  adherenceRate: number;
  nextAppointment?: Date;
  onTaskComplete?: (taskId: string) => void;
}

const TYPE_GLYPHS: Record<string, string> = {
  medication: '💊', measurement: '📏', activity: '🏃', 'check-in': '✅', education: '📖',
};

const fmtTime = (d: Date) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const fmtDate = (d: Date) => d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

export default function PatientMobileJourney({ patientName, date, tasks, greeting, adherenceRate, nextAppointment, onTaskComplete }: Props) {
  const [showCompleted, setShowCompleted] = useState(false);

  const greetingText = greeting || (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const { morning, midday, evening, done, total } = useMemo(() => {
    const mrn: DailyTask[] = [], mid: DailyTask[] =[], eve: DailyTask[] = [];
    let doneCount = 0;
    tasks.forEach(t => {
      const h = parseInt(t.time.split(':')[0], 10);
      if (h < 12) mrn.push(t);
      else if (h < 17) mid.push(t);
      else eve.push(t);
      if (t.done) doneCount++;
    });
    return { morning: mrn, midday: mid, evening: eve, done: doneCount, total: tasks.length };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const all = [...morning, ...midday, ...evening];
    return showCompleted ? all : all.filter(t => !t.done);
  }, [morning, midday, evening, showCompleted]);

  const ringPct = total ? (done / total) * 100 : 0;
  const ringCirc = 2 * Math.PI * 32;

  return (
    <motion.div
      className="glass-card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 bg-gradient-to-r from-[var(--surface-base)] to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-extrabold text-[var(--text-primary)]">{greetingText}, {patientName.split(' ')[0]} 👋</div>
            <div className="text-[9px] text-[var(--text-muted)] mt-0.5">{fmtDate(date)}</div>
          </div>

          {/* Adherence ring */}
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg width={64} height={64} className="-rotate-90">
              <circle cx={32} cy={32} r={28} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
              <motion.circle
                cx={32} cy={32} r={28} fill="none"
                stroke={ringPct >= 80 ? 'var(--green)' : ringPct >= 50 ? 'var(--amber)' : 'var(--red)'}
                strokeWidth={6} strokeLinecap="round"
                strokeDasharray={ringCirc}
                initial={{ strokeDashoffset: ringCirc }}
                animate={{ strokeDashoffset: ringCirc - (ringPct / 100) * ringCirc }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-sm font-extrabold font-mono" style={{ color: ringPct >= 80 ? 'var(--green)' : ringPct >= 50 ? 'var(--amber)' : 'var(--red)' }}>
                {Math.round(ringPct)}%
              </span>
              <span className="text-[7px] text-[var(--text-muted)] -mt-0.5">adherence</span>
            </div>
          </div>
        </div>

        {/* Next appointment */}
        {nextAppointment && (
          <div className="mt-2 px-2.5 py-1 rounded-lg bg-[rgba(124,90,245,0.08)] border border-[rgba(124,90,245,0.15)] flex items-center gap-2">
            <span className="text-[10px]">📅</span>
            <span className="text-[9px] text-[var(--purple)] font-bold">
              Next appointment: {nextAppointment.toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
            </span>
          </div>
        )}
      </div>

      {/* Task sections */}
      <div className="px-3 py-2 space-y-3 max-h-[400px] overflow-y-auto">
        {morning.length > 0 && (
          <Section title="🌅 Morning" tasks={morning} showCompleted={showCompleted} onTaskComplete={onTaskComplete} />
        )}
        {midday.length > 0 && (
          <Section title="☀️ Midday" tasks={midday} showCompleted={showCompleted} onTaskComplete={onTaskComplete} />
        )}
        {evening.length > 0 && (
          <Section title="🌙 Evening" tasks={evening} showCompleted={showCompleted} onTaskComplete={onTaskComplete} />
        )}

        {filteredTasks.length === 0 && (
          <div className="text-center py-6">
            <div className="text-2xl mb-1">🎉</div>
            <div className="text-[11px] font-bold text-[var(--green)]">All tasks completed!</div>
            {!showCompleted && (
              <button
                className="mt-2 text-[9px] text-[var(--text-muted)] underline cursor-pointer"
                onClick={() => setShowCompleted(true)}
              >
                Show completed
              </button>
            )}
          </div>
        )}
      </div>

      {/* Toggle */}
      <div className="flex justify-center px-3 py-1.5 border-t border-white/5">
        <button
          className="text-[8px] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
          onClick={() => setShowCompleted(!showCompleted)}
        >
          {showCompleted ? 'Hide completed' : `Show completed (${done})`}
        </button>
      </div>
    </motion.div>
  );
}

function Section({ title, tasks, showCompleted, onTaskComplete }: {
  title: string; tasks: DailyTask[]; showCompleted: boolean; onTaskComplete?: (id: string) => void;
}) {
  const visible = showCompleted ? tasks : tasks.filter(t => !t.done);
  if (visible.length === 0) return null;

  return (
    <div>
      <div className="text-[10px] font-bold text-[var(--text-muted)] mb-1.5 tracking-wider uppercase">{title}</div>
      <div className="space-y-1">
        {visible.map((task) => (
          <motion.div
            key={task.id}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors"
            style={{ background: task.done ? 'rgba(0,214,143,0.04)' : 'rgba(255,255,255,0.02)', opacity: task.done ? 0.5 : 1 }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: task.done ? 0.5 : 1, x: 0 }}
          >
            {/* Checkbox */}
            <motion.button
              className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center text-[8px] cursor-pointer"
              style={{
                borderColor: task.done ? 'var(--green)' : 'rgba(255,255,255,0.15)',
                background: task.done ? 'var(--green)' : 'transparent',
                color: task.done ? 'black' : 'transparent',
              }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onTaskComplete?.(task.id)}
            >
              {task.done ? '✓' : ''}
            </motion.button>

            {/* Icon + label */}
            <span className="text-[10px]">{task.icon || TYPE_GLYPHS[task.type]}</span>
            <div className="flex-1 min-w-0">
              <div className={`text-[10px] font-medium ${task.done ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
                {task.label}
              </div>
              <div className="text-[8px] text-[var(--text-muted)]">{task.detail}</div>
            </div>

            {/* Time */}
            <div className="text-[8px] font-mono text-[var(--text-muted)] flex-shrink-0">{task.time}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
