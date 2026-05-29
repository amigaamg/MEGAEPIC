'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  href?: string;
  onClick?: () => void;
  badge?: number | string;
  badgeColor?: string;
}

const NAV_ITEMS: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '◈', href: '/dashboard' },
  { id: 'patients', label: 'Patients', icon: '◉', href: '/dashboard/doctor' },
  { id: 'timeline', label: 'Therapy Timeline', icon: '▤', href: '/dashboard/medication-center' },
  { id: 'tsheets', label: 'TSHEETS', icon: '☰' },
  { id: 'prescriptions', label: 'Prescriptions', icon: '⚕', href: '/dashboard/doctor/medication' },
  { id: 'inventory', label: 'Inventory', icon: '◫' },
  { id: 'adherence', label: 'Adherence', icon: '◔' },
  { id: 'analytics', label: 'Analytics', icon: '◈' },
  { id: 'complications', label: 'Complications', icon: '▲', badge: 3, badgeColor: '#ff4560' },
  { id: 'education', label: 'Education', icon: '▣' },
  { id: 'reports', label: 'Reports', icon: '▤' },
];

interface Props {
  activeItem?: string;
  onNavigate?: (item: SidebarItem) => void;
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function AMEXANSidebar({ activeItem, onNavigate, collapsed: controlledCollapsed, onToggle }: Props) {
  const [internalCollapsed, setInternalCollapsed] = useState(true);
  const collapsed = controlledCollapsed ?? internalCollapsed;

  const handleToggle = () => {
    if (onToggle) onToggle();
    else setInternalCollapsed(!internalCollapsed);
  };

  return (
    <motion.nav
      className="sidebar"
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      onMouseEnter={() => {
        if (onToggle === undefined) setInternalCollapsed(false);
      }}
      onMouseLeave={() => {
        if (onToggle === undefined) setInternalCollapsed(true);
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5" style={{ minWidth: 240 }}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-green-500 flex items-center justify-center text-xs font-extrabold text-black flex-shrink-0">
          A
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
            >
              <div className="text-sm font-extrabold text-white" style={{ fontFamily: 'var(--font-display)' }}>AMEXAN</div>
              <div className="text-[9px] font-bold text-teal-400 tracking-[0.15em] uppercase">Intelligent Health</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <div className="py-3">
        {NAV_ITEMS.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <a
              key={item.id}
              href={item.href || '#'}
              onClick={(e) => {
                if (!item.href) e.preventDefault();
                onNavigate?.(item);
              }}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!collapsed && item.badge && (
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: `${item.badgeColor}20`, color: item.badgeColor }}
                >
                  {item.badge}
                </span>
              )}
              {collapsed && item.badge && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center"
                  style={{ background: item.badgeColor, color: '#fff' }}
                >
                  {item.badge}
                </span>
              )}
            </a>
          );
        })}
      </div>

      {/* Bottom section */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/5">
        <div className="sidebar-item">
          <span className="sidebar-icon">⚙</span>
          {!collapsed && <span>Settings</span>}
        </div>
      </div>
    </motion.nav>
  );
}
