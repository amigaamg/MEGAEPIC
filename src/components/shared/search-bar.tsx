'use client';
import { useState, useEffect, useRef } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounce?: number;
  className?: string;
}

export default function SearchBar({ value, onChange, placeholder = 'Search...', debounce = 200, className = '' }: SearchBarProps) {
  const [local, setLocal] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const handleChange = (val: string) => {
    setLocal(val);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(val), debounce);
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/[0.03] transition-all duration-200 focus-within:border-cyan-500/40 focus-within:bg-white/[0.06] ${className}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        type="text"
        value={local}
        onChange={e => handleChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent border-none outline-none text-sm text-[#E2E8F0] placeholder-[#475569] font-sans"
      />
      {local && (
        <button onClick={() => { setLocal(''); onChange(''); }} className="text-[#475569] hover:text-[#94A3B8] transition-colors" aria-label="Clear search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      )}
    </div>
  );
}
