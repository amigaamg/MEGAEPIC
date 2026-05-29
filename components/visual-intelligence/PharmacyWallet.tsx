'use client';
import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface InventoryItem {
  id: string;
  drug: string;
  dose: string;
  currentStock: number;
  unit: string;
  dailyConsumption: number;
  reorderPoint: number;
  lastFilled: Date;
  nextRefillDue: Date;
  pharmacyName?: string;
  pharmacyDistance?: number;
  price?: number;
}

interface Props {
  items: InventoryItem[];
  onReorder?: (itemId: string) => void;
}

const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default function PharmacyWallet({ items, onReorder }: Props) {
  const lowStock = items.filter(i => i.currentStock <= i.reorderPoint).length;
  const totalCost = items.reduce((s, i) => s + (i.price || 0), 0);

  if (items.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center justify-center py-12 px-8 text-center">
        <div className="text-3xl mb-2">🏪</div>
        <div className="text-sm font-bold text-[var(--text-secondary)]">No Pharmacy Items</div>
        <div className="text-xs text-[var(--text-muted)] mt-0.5">Prescriptions filled here will appear as inventory</div>
      </div>
    );
  }

  return (
    <motion.div
      className="glass-card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-gradient-to-r from-[var(--surface-base)] to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-[9px] font-bold text-white">Rx</div>
          <div>
            <div className="text-[10px] font-extrabold text-[var(--purple)] tracking-wider uppercase">Pharmacy Wallet</div>
            <div className="text-[9px] text-[var(--text-muted)]">{items.length} active prescriptions</div>
          </div>
        </div>
        <div className="flex gap-3 text-[9px]">
          {lowStock > 0 && (
            <div className="px-2 py-0.5 rounded-full bg-[rgba(255,69,96,0.12)] text-[var(--red)] border border-[rgba(255,69,96,0.25)]">
              ⚠ {lowStock} low stock
            </div>
          )}
          <div className="px-2 py-0.5 rounded-full bg-[rgba(0,214,143,0.1)] text-[var(--green)]">
            {items.filter(i => i.currentStock > i.reorderPoint).length} stocked
          </div>
        </div>
      </div>

      {/* Inventory list */}
      <div className="divide-y divide-white/[0.04]">
        {items.map((item, idx) => {
          const daysRemaining = item.dailyConsumption > 0 ? Math.floor(item.currentStock / item.dailyConsumption) : 999;
          const isLow = item.currentStock <= item.reorderPoint;
          const isCritical = daysRemaining <= 3;

          return (
            <motion.div
              key={item.id}
              className="px-4 py-2.5 flex items-center gap-3 hover:bg-white/[0.02] transition-colors"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.03 }}
            >
              {/* Stock gauge */}
              <div className="relative w-10 h-10 flex-shrink-0">
                <svg width={40} height={40} className="-rotate-90">
                  <circle cx={20} cy={20} r={16} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
                  <motion.circle
                    cx={20} cy={20} r={16} fill="none"
                    stroke={isCritical ? 'var(--red)' : isLow ? 'var(--amber)' : 'var(--green)'}
                    strokeWidth={4} strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 16}
                    initial={{ strokeDashoffset: 2 * Math.PI * 16 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 16 * (1 - Math.min(item.currentStock, item.reorderPoint * 2) / (item.reorderPoint * 2)) }}
                    transition={{ duration: 1, delay: idx * 0.05 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold font-mono"
                  style={{ color: isCritical ? 'var(--red)' : isLow ? 'var(--amber)' : 'var(--text-primary)' }}>
                  {item.currentStock}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-[var(--text-primary)]">{item.drug}</span>
                  <span className="text-[8px] text-[var(--text-muted)]">{item.dose}</span>
                </div>
                <div className="flex gap-2 mt-0.5 text-[8px] text-[var(--text-muted)]">
                  <span>{item.dailyConsumption}/day</span>
                  <span>·</span>
                  <span className={isCritical ? 'text-[var(--red)]' : isLow ? 'text-[var(--amber)]' : ''}>
                    {daysRemaining >= 999 ? '∞' : `${daysRemaining} days`}
                  </span>
                  {item.pharmacyName && <><span>·</span><span>{item.pharmacyName}</span></>}
                  {item.pharmacyDistance && <><span>·</span><span>{item.pharmacyDistance}mi</span></>}
                </div>
              </div>

              {/* Reorder button */}
              <div className="flex-shrink-0 text-right">
                {(isLow || isCritical) ? (
                  <motion.button
                    className="px-2.5 py-1 rounded-lg text-[9px] font-bold text-black cursor-pointer"
                    style={{ background: isCritical ? 'var(--red)' : 'var(--amber)' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onReorder?.(item.id)}
                  >
                    ⚠ Reorder
                  </motion.button>
                ) : (
                  <div className="text-[8px] text-[var(--text-muted)]">
                    Next: {fmtDate(item.nextRefillDue)}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex justify-between px-4 py-1.5 border-t border-white/5 text-[8px] text-[var(--text-muted)] bg-[var(--surface-base)]">
        <span>Reorder alerts at critical (&le;3d) and low (reorder point)</span>
        <span>{totalCost > 0 ? `${totalCost.toLocaleString()}` : ''} · {items.reduce((s, i) => s + i.currentStock, 0)} total units</span>
      </div>
    </motion.div>
  );
}
