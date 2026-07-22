'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Package, Search, Plus, AlertTriangle, ArrowUp, ArrowDown, TrendingUp, RefreshCw } from 'lucide-react'

const color = '#8B5CF6'

export default function InventoryPage() {
  const [tab, setTab] = useState('stock')
  const [search, setSearch] = useState('')
  const categories = ['All', 'Medications', 'Consumables', 'Instruments', 'Lab Reagents', 'PPE']
  const [cat, setCat] = useState('All')

  const items = [
    { name: 'Artemether-Lumefantrine 20/120mg', category: 'Medications', stock: 240, min: 100, max: 500, unit: 'packs', expiry: 'Dec 2027', cost: 850, supplier: 'MedSource Ltd' },
    { name: 'Ceftriaxone 1g injection', category: 'Medications', stock: 85, min: 50, max: 200, unit: 'vials', expiry: 'Mar 2028', cost: 320, supplier: 'PharmaEast' },
    { name: 'Normal Saline 500ml', category: 'Consumables', stock: 42, min: 80, max: 300, unit: 'bags', expiry: 'Jun 2027', cost: 180, supplier: 'MedSource Ltd' },
    { name: 'Surgical Gloves (Sterile, Size 7)', category: 'PPE', stock: 320, min: 200, max: 600, unit: 'pairs', expiry: 'N/A', cost: 45, supplier: 'ShieldCare' },
    { name: 'Masks (Surgical, 3-ply)', category: 'PPE', stock: 56, min: 100, max: 500, unit: 'boxes', expiry: 'N/A', cost: 250, supplier: 'ShieldCare' },
    { name: 'CBC Reagent Kit', category: 'Lab Reagents', stock: 12, min: 5, max: 20, unit: 'kits', expiry: 'Aug 2026', cost: 4500, supplier: 'DiagTech' },
    { name: 'Malaria RDT Cassettes', category: 'Lab Reagents', stock: 480, min: 200, max: 1000, unit: 'tests', expiry: 'Oct 2026', cost: 120, supplier: 'DiagTech' },
    { name: 'Scalpel Blade #11', category: 'Instruments', stock: 150, min: 50, max: 300, unit: 'pieces', expiry: 'N/A', cost: 25, supplier: 'SurgiPro' },
    { name: 'Suture (Silk 2-0)', category: 'Instruments', stock: 65, min: 30, max: 100, unit: 'units', expiry: 'Feb 2028', cost: 180, supplier: 'SurgiPro' },
    { name: 'IV Cannula 18G', category: 'Consumables', stock: 28, min: 50, max: 200, unit: 'pieces', expiry: 'N/A', cost: 65, supplier: 'MedSource Ltd' },
    { name: 'Paracetamol 500mg tab', category: 'Medications', stock: 680, min: 200, max: 1000, unit: 'tabs', expiry: 'Jan 2028', cost: 2, supplier: 'PharmaEast' },
    { name: 'Metformin 500mg tab', category: 'Medications', stock: 320, min: 100, max: 500, unit: 'tabs', expiry: 'Mar 2028', cost: 3, supplier: 'PharmaEast' },
    { name: 'Culture Media - Blood Agar', category: 'Lab Reagents', stock: 8, min: 10, max: 30, unit: 'plates', expiry: 'Aug 2026', cost: 350, supplier: 'DiagTech' },
    { name: 'Gauze Swabs (Sterile)', category: 'Consumables', stock: 120, min: 50, max: 300, unit: 'packs', expiry: 'N/A', cost: 85, supplier: 'ShieldCare' },
  ]

  const poHistory = [
    { po: 'PO-2024-001', supplier: 'MedSource Ltd', items: 6, total: 124500, status: 'delivered', date: '05 Jul', eta: '-' },
    { po: 'PO-2024-002', supplier: 'PharmaEast', items: 10, total: 89000, status: 'delivered', date: '03 Jul', eta: '-' },
    { po: 'PO-2024-003', supplier: 'DiagTech', items: 3, total: 56000, status: 'pending', date: '10 Jul', eta: '15 Jul' },
    { po: 'PO-2024-004', supplier: 'SurgiPro', items: 5, total: 34500, status: 'pending', date: '11 Jul', eta: '18 Jul' },
  ]

  const filtered = items.filter(i => (cat === 'All' || i.category === cat) && (!search || i.name.toLowerCase().includes(search.toLowerCase())))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Package size={18} color={color} /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} /><span style={{ fontSize: 13, fontWeight: 600 }}>Inventory Management</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{items.filter(i => i.stock < i.min).length} items below threshold</span>
        <button style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: color, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={14} /> New Order</button>
      </div>
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--surface-border)', padding: '0 24px', background: 'var(--surface-card)' }}>
        {[{key:'stock',label:'Stock',icon:<Package size={14} />},{key:'orders',label:'Purchase Orders',icon:<TrendingUp size={14} />},{key:'suppliers',label:'Suppliers',icon:<RefreshCw size={14} />}].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '10px 16px', border: 'none', borderBottom: `2px solid ${tab === t.key ? color : 'transparent'}`, background: 'transparent', color: tab === t.key ? color : 'var(--text-secondary)', fontSize: 12, fontWeight: tab === t.key ? 600 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>{t.icon} {t.label}</button>
        ))}
      </div>
      <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
        {tab === 'stock' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 16 }}>
              <IStat label="Total Items" value={items.length.toString()} color={color} />
              <IStat label="Low Stock" value={items.filter(i => i.stock < i.min).length.toString()} color="#EF4444" />
              <IStat label="Expiring <6mo" value={items.filter(i => i.expiry !== 'N/A' && new Date(i.expiry).getTime() < Date.now() + 180*86400000).length.toString()} color="#F59E0B" />
              <IStat label="Total Value" value={`KES ${items.reduce((s,i) => s + i.stock * i.cost, 0).toLocaleString()}`} color="#059669" />
              <IStat label="Out of Stock" value={items.filter(i => i.stock === 0).length.toString()} color="#DC2626" />
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: 240 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..." style={{ width: '100%', height: 34, padding: '0 10px 0 30px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
              </div>
              {categories.map(c => <button key={c} onClick={() => setCat(c)} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid var(--surface-border)', background: cat === c ? color : 'var(--surface)', color: cat === c ? 'white' : 'var(--text-secondary)', fontSize: 11, cursor: 'pointer' }}>{c}</button>)}
            </div>
            <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Stock List ({filtered.length} items)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '200px 80px 60px 60px 80px 80px 60px', gap: 6, padding: '6px 8px', fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  <span>Item</span><span>Category</span><span>Stock</span><span>Min</span><span>Unit</span><span>Expiry</span><span>Status</span></div>
                {filtered.map((item, i) => {
                  const pct = Math.round((item.stock / item.max) * 100)
                  const low = item.stock < item.min
                  const expiring = item.expiry !== 'N/A' && new Date(item.expiry).getTime() < Date.now() + 180 * 86400000
                  return (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '200px 80px 60px 60px 80px 80px 60px', gap: 6, padding: '7px 8px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 10 }}>
                      <span style={{ fontWeight: 600 }}>{item.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{item.category}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontWeight: 700, color: low ? '#EF4444' : 'var(--text-primary)' }}>{item.stock}</span>
                        {low && <AlertTriangle size={10} color="#EF4444" />}
                      </div>
                      <span style={{ color: 'var(--text-muted)' }}>{item.min}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{item.unit}</span>
                      <span style={{ color: expiring ? '#F59E0B' : 'var(--text-muted)', fontWeight: expiring ? 600 : 400 }}>{item.expiry}</span>
                      <div style={{ height: 6, borderRadius: 3, background: 'var(--surface-border)', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: low ? '#EF4444' : '#10B981' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
        {tab === 'orders' && (
          <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Purchase Orders</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 140px 80px 100px 80px 80px', gap: 6, padding: '6px 8px', fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                <span>PO #</span><span>Supplier</span><span>Items</span><span>Total</span><span>Status</span><span>ETA</span></div>
              {poHistory.map((po, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 140px 80px 100px 80px 80px', gap: 6, padding: '7px 8px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 10 }}>
                  <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{po.po}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{po.supplier}</span>
                  <span>{po.items}</span>
                  <span style={{ fontWeight: 700 }}>KES {po.total.toLocaleString()}</span>
                  <span style={{ padding: '2px 6px', borderRadius: 3, fontSize: 9, fontWeight: 600, background: po.status === 'delivered' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: po.status === 'delivered' ? '#10B981' : '#F59E0B', textAlign: 'center', textTransform: 'capitalize' }}>{po.status}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{po.eta || '-'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'suppliers' && (
          <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Suppliers</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { name: 'MedSource Ltd', contact: '+254 712 345 678', email: 'orders@medsource.co.ke', items: 4, leadTime: '3-5 days', rating: 4.5 },
                { name: 'PharmaEast', contact: '+254 722 456 789', email: 'sales@pharmaeast.com', items: 3, leadTime: '2-4 days', rating: 4.2 },
                { name: 'DiagTech', contact: '+254 733 567 890', email: 'info@diagtech.co.ke', items: 3, leadTime: '5-7 days', rating: 4.0 },
                { name: 'SurgiPro', contact: '+254 744 678 901', email: 'orders@surgipro.co.ke', items: 2, leadTime: '3-5 days', rating: 4.8 },
                { name: 'ShieldCare', contact: '+254 755 789 012', email: 'sales@shieldcare.co.ke', items: 3, leadTime: '2-3 days', rating: 4.3 },
              ].map((s, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 160px 1fr 80px 80px 60px', gap: 8, padding: '8px 10px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 11 }}>
                  <span style={{ fontWeight: 600 }}>{s.name}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{s.contact}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{s.email}</span>
                  <span>{s.items} items</span>
                  <span style={{ color: 'var(--text-muted)' }}>{s.leadTime}</span>
                  <span style={{ fontWeight: 700, color: s.rating >= 4.5 ? '#10B981' : s.rating >= 4 ? '#F59E0B' : '#EF4444' }}>{s.rating}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function IStat({ label, value, color: c }) {
  return <div style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
    <div style={{ fontSize: 20, fontWeight: 700, color: c }}>{value}</div>
    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
  </div>
}
