'use client'

export function ADOSStyles() {
  return <style>{'\n' +
    '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap");\n' +
    '\n' +
    '*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}\n' +
    '\n' +
    ':root {\n' +
    '  --sky-50: #eff6ff;\n' +
    '  --sky-100: #dbeafe;\n' +
    '  --sky-200: #bfdbfe;\n' +
    '  --sky-300: #93c5fd;\n' +
    '  --sky-400: #60a5fa;\n' +
    '  --sky-500: #3b82f6;\n' +
    '  --sky-600: #2563eb;\n' +
    '  --sky-700: #1d4ed8;\n' +
    '  --sky-800: #1e40af;\n' +
    '  --sky-900: #1e3a8a;\n' +
    '  --primary: #2F80ED;\n' +
    '  --primary-light: #EBF5FF;\n' +
    '  --primary-dark: #1A5BBF;\n' +
    '  --surface: #ffffff;\n' +
    '  --surface-elevated: #F8FAFC;\n' +
    '  --surface-card: #ffffff;\n' +
    '  --surface-hover: #F1F5F9;\n' +
    '  --surface-glass: rgba(255,255,255,0.85);\n' +
    '  --surface-border: #E2E8F0;\n' +
    '  --text-primary: #0F172A;\n' +
    '  --text-secondary: #475569;\n' +
    '  --text-muted: #94A3B8;\n' +
    '  --text-inverse: #ffffff;\n' +
    '  --font-sans: "Inter", system-ui, -apple-system, sans-serif;\n' +
    '  --font-display: "Inter", system-ui, -apple-system, sans-serif;\n' +
    '  --font-mono: "JetBrains Mono", monospace;\n' +
    '  --radius-sm: 6px;\n' +
    '  --radius-md: 10px;\n' +
    '  --radius-lg: 16px;\n' +
    '  --radius-xl: 20px;\n' +
    '  --radius-full: 9999px;\n' +
    '  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);\n' +
    '  --shadow-md: 0 4px 6px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04);\n' +
    '  --shadow-lg: 0 10px 15px rgba(0,0,0,0.06), 0 4px 6px rgba(0,0,0,0.04);\n' +
    '  --shadow-xl: 0 20px 25px rgba(0,0,0,0.08), 0 8px 10px rgba(0,0,0,0.04);\n' +
    '  --green: #10B981;\n' +
    '  --green-bg: rgba(16,185,129,0.1);\n' +
    '  --amber: #F59E0B;\n' +
    '  --amber-bg: rgba(245,158,11,0.1);\n' +
    '  --red: #EF4444;\n' +
    '  --red-bg: rgba(239,68,68,0.1);\n' +
    '  --purple: #8B5CF6;\n' +
    '  --purple-bg: rgba(139,92,246,0.1);\n' +
    '  --teal: #14B8A6;\n' +
    '  --teal-bg: rgba(20,184,166,0.1);\n' +
    '}\n' +
    '\n' +
    'body {\n' +
    '  background: var(--surface-elevated);\n' +
    '  color: var(--text-primary);\n' +
    '  font-family: var(--font-sans);\n' +
    '  -webkit-font-smoothing: antialiased;\n' +
    '}\n' +
    '\n' +
    '::-webkit-scrollbar { width: 4px; height: 4px; }\n' +
    '::-webkit-scrollbar-thumb { background: var(--text-muted); border-radius: 99px; }\n' +
    '::-webkit-scrollbar-track { background: transparent; }\n' +
    '::selection { background: var(--primary-light); color: var(--primary); }\n' +
    '\n' +
    '@keyframes fadeUp {\n' +
    '  from { opacity: 0; transform: translateY(12px); }\n' +
    '  to { opacity: 1; transform: none; }\n' +
    '}\n' +
    '@keyframes fadeIn {\n' +
    '  from { opacity: 0; }\n' +
    '  to { opacity: 1; }\n' +
    '}\n' +
    '@keyframes slideUp {\n' +
    '  from { opacity: 0; transform: translateY(20px); }\n' +
    '  to { opacity: 1; transform: translateY(0); }\n' +
    '}\n' +
    '@keyframes pulseG {\n' +
    '  0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }\n' +
    '  50% { box-shadow: 0 0 0 8px rgba(16,185,129,0); }\n' +
    '}\n' +
    '@keyframes pulseRed {\n' +
    '  0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }\n' +
    '  50% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }\n' +
    '}\n' +
    '@keyframes shimmer {\n' +
    '  0% { background-position: -200% 0; }\n' +
    '  100% { background-position: 200% 0; }\n' +
    '}\n' +
    '\n' +
    '.ados-panel {\n' +
    '  background: var(--surface-card);\n' +
    '  border: 1px solid var(--surface-border);\n' +
    '  border-radius: var(--radius-lg);\n' +
    '  padding: 18px 20px;\n' +
    '  box-shadow: var(--shadow-sm);\n' +
    '  transition: border-color 0.18s, box-shadow 0.18s;\n' +
    '}\n' +
    '.ados-panel:hover {\n' +
    '  border-color: var(--primary);\n' +
    '  box-shadow: var(--shadow-md);\n' +
    '}\n' +
    '.ados-panel-hd {\n' +
    '  display: flex;\n' +
    '  justify-content: space-between;\n' +
    '  align-items: center;\n' +
    '  margin-bottom: 14px;\n' +
    '}\n' +
    '.ados-panel-title {\n' +
    '  font-size: 14px;\n' +
    '  font-weight: 800;\n' +
    '  display: flex;\n' +
    '  align-items: center;\n' +
    '  gap: 6px;\n' +
    '  color: var(--text-primary);\n' +
    '}\n' +
    '.ados-count-badge {\n' +
    '  background: var(--primary-light);\n' +
    '  color: var(--primary);\n' +
    '  border-radius: 99px;\n' +
    '  font-size: 11px;\n' +
    '  font-weight: 700;\n' +
    '  padding: 2px 8px;\n' +
    '}\n' +
    '.ados-empty {\n' +
    '  text-align: center;\n' +
    '  padding: 28px 0;\n' +
    '  color: var(--text-muted);\n' +
    '  font-size: 13px;\n' +
    '}\n' +
    '\n' +
    '.ados-btn-primary {\n' +
    '  background: var(--primary);\n' +
    '  color: var(--text-inverse);\n' +
    '  border: none;\n' +
    '  border-radius: var(--radius-md);\n' +
    '  padding: 10px 18px;\n' +
    '  font-size: 13px;\n' +
    '  font-weight: 700;\n' +
    '  cursor: pointer;\n' +
    '  font-family: var(--font-sans);\n' +
    '  transition: all 0.14s;\n' +
    '}\n' +
    '.ados-btn-primary:hover {\n' +
    '  opacity: 0.92;\n' +
    '  box-shadow: 0 4px 14px rgba(47,128,237,0.3);\n' +
    '}\n' +
    '.ados-btn-secondary {\n' +
    '  background: transparent;\n' +
    '  border: 1.5px solid var(--surface-border);\n' +
    '  color: var(--text-secondary);\n' +
    '  border-radius: var(--radius-md);\n' +
    '  padding: 9px 16px;\n' +
    '  font-size: 12px;\n' +
    '  font-weight: 600;\n' +
    '  cursor: pointer;\n' +
    '  font-family: var(--font-sans);\n' +
    '  transition: all 0.14s;\n' +
    '}\n' +
    '.ados-btn-secondary:hover {\n' +
    '  border-color: var(--text-primary);\n' +
    '  color: var(--text-primary);\n' +
    '}\n' +
    '.ados-btn-danger {\n' +
    '  background: var(--red-bg);\n' +
    '  color: var(--red);\n' +
    '  border: 1px solid rgba(239,68,68,0.2);\n' +
    '  border-radius: var(--radius-sm);\n' +
    '  padding: 7px 12px;\n' +
    '  font-size: 12px;\n' +
    '  font-weight: 700;\n' +
    '  cursor: pointer;\n' +
    '  font-family: var(--font-sans);\n' +
    '  transition: all 0.14s;\n' +
    '}\n' +
    '.ados-btn-danger:hover {\n' +
    '  background: var(--red);\n' +
    '  color: white;\n' +
    '}\n' +
    '.ados-btn-success {\n' +
    '  background: var(--green);\n' +
    '  color: white;\n' +
    '  border: none;\n' +
    '  border-radius: var(--radius-md);\n' +
    '  padding: 10px 18px;\n' +
    '  font-size: 13px;\n' +
    '  font-weight: 700;\n' +
    '  cursor: pointer;\n' +
    '  font-family: var(--font-sans);\n' +
    '  transition: all 0.14s;\n' +
    '}\n' +
    '.ados-btn-success:hover {\n' +
    '  opacity: 0.92;\n' +
    '  box-shadow: 0 4px 14px rgba(16,185,129,0.3);\n' +
    '}\n' +
    '\n' +
    '.ados-pill {\n' +
    '  display: inline-flex;\n' +
    '  align-items: center;\n' +
    '  padding: 3px 10px;\n' +
    '  border-radius: 99px;\n' +
    '  font-size: 11px;\n' +
    '  font-weight: 700;\n' +
    '}\n' +
    '.ados-pill-critical {\n' +
    '  background: var(--red-bg);\n' +
    '  color: var(--red);\n' +
    '}\n' +
    '.ados-pill-high {\n' +
    '  background: var(--amber-bg);\n' +
    '  color: var(--amber);\n' +
    '}\n' +
    '.ados-pill-stable {\n' +
    '  background: var(--green-bg);\n' +
    '  color: var(--green);\n' +
    '}\n' +
    '.ados-pill-info {\n' +
    '  background: var(--primary-light);\n' +
    '  color: var(--primary);\n' +
    '}\n' +
    '\n' +
    '.ados-status-dot {\n' +
    '  width: 8px;\n' +
    '  height: 8px;\n' +
    '  border-radius: 50%;\n' +
    '  display: inline-block;\n' +
    '  flex-shrink: 0;\n' +
    '}\n' +
    '.ados-status-dot.critical { background: var(--red); }\n' +
    '.ados-status-dot.high { background: var(--amber); }\n' +
    '.ados-status-dot.stable { background: var(--green); }\n' +
    '.ados-status-dot.default { background: var(--text-muted); }\n' +
    '\n' +
    '.ados-avatar {\n' +
    '  width: 40px;\n' +
    '  height: 40px;\n' +
    '  border-radius: var(--radius-md);\n' +
    '  background: linear-gradient(135deg, var(--primary), var(--primary-dark));\n' +
    '  display: flex;\n' +
    '  align-items: center;\n' +
    '  justify-content: center;\n' +
    '  font-weight: 800;\n' +
    '  font-size: 16px;\n' +
    '  color: white;\n' +
    '  flex-shrink: 0;\n' +
    '}\n'
  }</style>
}
