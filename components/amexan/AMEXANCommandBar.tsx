'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommandBarProps {
  title?: string;
  patientName?: string;
  alertCount?: number;
  onSearch?: (query: string) => void;
}

export default function AMEXANCommandBar({ title, patientName, alertCount = 0, onSearch }: CommandBarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="command-bar" style={{ marginLeft: 64 }}>
      {/* Left section */}
      <div className="flex items-center gap-3 flex-1">
        {title && (
          <>
            <span className="text-sm font-bold text-white">{title}</span>
            {patientName && (
              <>
                <span className="text-[10px] text-[var(--text-muted)]">·</span>
                <span className="text-xs text-[var(--text-secondary)]">{patientName}</span>
              </>
            )}
          </>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[var(--text-muted)] border border-white/5 hover:bg-white/5 hover:text-[var(--text-primary)] transition-all cursor-pointer"
        >
          <span>🔍</span>
          <span className="hidden sm:inline">Search</span>
          <kbd className="text-[9px] px-1 py-0.5 rounded bg-white/5 text-[var(--text-muted)] font-mono">⌘K</kbd>
        </button>

        {/* Alerts */}
        <button className="relative p-2 rounded-lg text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-all cursor-pointer">
          <span>🔔</span>
          {alertCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center"
              style={{ background: 'var(--red)', color: '#fff' }}
            >
              {alertCount}
            </span>
          )}
        </button>

        {/* AI Assistant */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--purple)] bg-[rgba(124,90,245,0.1)] border border-[rgba(124,90,245,0.2)] hover:bg-[rgba(124,90,245,0.2)] transition-all cursor-pointer">
          <span>🤖</span>
          <span className="hidden sm:inline">AI</span>
        </button>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-bold text-[var(--green)] bg-[rgba(0,214,143,0.1)] border border-[rgba(0,214,143,0.2)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] shadow-[0_0_6px_var(--green)]" />
          LIVE
        </div>
      </div>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[80px]"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="glass-card w-full max-w-lg p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <span className="text-sm">🔍</span>
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search patients, medications, diseases, labs..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    onSearch?.(e.target.value);
                  }}
                  className="flex-1 bg-transparent text-sm text-white placeholder-[var(--text-muted)] outline-none"
                />
                <button onClick={() => setSearchOpen(false)} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-[var(--text-muted)] font-mono">ESC</button>
              </div>

              {searchQuery.length > 0 ? (
                <div className="mt-3 space-y-1">
                  <div className="text-[10px] text-[var(--text-muted)] px-2 py-1">AI-powered results</div>
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer">
                    <span>👤</span>
                    <span className="text-xs text-[var(--text-secondary)]">Searching for &quot;{searchQuery}&quot;...</span>
                  </div>
                </div>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {['Patient by name', 'Medication', 'Disease', 'Prescription', 'Lab result', 'Pharmacy'].map((s) => (
                    <div key={s} className="text-[10px] text-[var(--text-muted)] px-3 py-2 rounded-lg bg-white/5 border border-white/5">
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
