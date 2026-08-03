'use client';
import { useState, useMemo } from 'react';
import { Palette, Save, RotateCcw, Eye, Sun, Moon, Monitor, Type, Layout, Sliders, Download, Upload, Copy, Check, Settings2 } from 'lucide-react';
import { getBrand, buildThemeContext, generateCssVariables, type BrandConfig, type ThemeOverride, type RoleTheme } from '@/lib/amexan/presentation/theme-engine';
import { ROLE_THEMES } from '@/lib/amexan/presentation/theme-engine';
import { getActiveOrganizationId } from '@/lib/firebase/orgContext';

const SKY_BLUES = ['#0EA5E9', '#06B6D4', '#0284C7', '#0369A1', '#075985', '#0C4A6E', '#1D4ED8', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BAE6FD'];
const WHITE_SHADES = ['#FFFFFF', '#F8FAFC', '#F1F5F9', '#E2E8F0', '#CBD5E1', '#94A3B8'];
const FONT_OPTIONS = ['Inter', 'DM Sans', 'Syne', 'System UI', 'Roboto', 'Open Sans'];
const DENSITY_OPTIONS = ['compact', 'comfortable', 'spacious'] as const;
const LAYOUT_OPTIONS = ['sidebar', 'topbar', 'combined', 'minimal'] as const;

export default function ThemePage() {
  const orgId = getActiveOrganizationId();
  const [brand, setBrand] = useState<BrandConfig>(getBrand());
  const [overrides, setOverrides] = useState<ThemeOverride>({ mode: 'light', fontScale: 1, density: 'comfortable' });
  const [activeRole, setActiveRole] = useState<string>('doctor');
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');
  const [saved, setSaved] = useState(false);

  const themeCtx = useMemo(() => buildThemeContext({ role: activeRole, brand, device: { viewportClass: 'lg', width: 1440, height: 900, heightClass: 'normal', orientation: 'landscape', pixelDensity: 1, pointerType: 'fine', interactionMode: 'hover', hasKeyboard: true, hasScreenReader: false, prefersReducedMotion: false, prefersHighContrast: false, colorScheme: previewMode, online: true, browser: 'chromium', touchSupported: false }, overrides }), [brand, overrides, activeRole, previewMode]);
  const cssVars = useMemo(() => generateCssVariables(themeCtx), [themeCtx]);

  const updateBrand = (key: keyof BrandConfig, value: string) => {
    setBrand(prev => ({ ...prev, [key]: value }));
  };

  const updateOverride = (key: keyof ThemeOverride, value: any) => {
    setOverrides(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setBrand(getBrand());
    setOverrides({ mode: 'light', fontScale: 1, density: 'comfortable' });
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Theme Customization</h1>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>Customize hospital branding, layout, and visual appearance</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReset} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94A3B8', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
            <RotateCcw size={14} /> Reset
          </button>
          <button onClick={handleSave} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: saved ? '#10B981' : 'linear-gradient(135deg,#06B6D4,#0891B2)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
            <Save size={14} /> {saved ? 'Saved!' : 'Save Theme'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', padding: 20 }}>
          <div className="flex items-center gap-2" style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', marginBottom: 14 }}><Palette size={16} color="#06B6D4" /> Branding</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Facility Name</label>
              <input value={brand.facilityName} onChange={e => updateBrand('facilityName', e.target.value)} style={{ width: '100%', height: 34, padding: '0 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', fontSize: 12, outline: 'none', fontFamily: "'DM Sans',sans-serif" }} />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Primary Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={brand.primaryColor} onChange={e => updateBrand('primaryColor', e.target.value)} style={{ width: 34, height: 34, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'transparent' }} />
                <input value={brand.primaryColor} onChange={e => updateBrand('primaryColor', e.target.value)} style={{ flex: 1, height: 34, padding: '0 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', fontSize: 12, outline: 'none', fontFamily: "'DM Sans',sans-serif" }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Secondary Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={brand.secondaryColor} onChange={e => updateBrand('secondaryColor', e.target.value)} style={{ width: 34, height: 34, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'transparent' }} />
                <input value={brand.secondaryColor} onChange={e => updateBrand('secondaryColor', e.target.value)} style={{ flex: 1, height: 34, padding: '0 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', fontSize: 12, outline: 'none', fontFamily: "'DM Sans',sans-serif" }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Accent Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={brand.accentColor} onChange={e => updateBrand('accentColor', e.target.value)} style={{ width: 34, height: 34, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'transparent' }} />
                <input value={brand.accentColor} onChange={e => updateBrand('accentColor', e.target.value)} style={{ flex: 1, height: 34, padding: '0 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', fontSize: 12, outline: 'none', fontFamily: "'DM Sans',sans-serif" }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', padding: 20 }}>
          <div className="flex items-center gap-2" style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', marginBottom: 14 }}><Type size={16} color="#06B6D4" /> Typography</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Font Family</label>
              <select value={brand.fontFamily?.split(',')[0] || 'Inter'} onChange={e => updateBrand('fontFamily', `${e.target.value}, system-ui, sans-serif`)} style={{ width: '100%', height: 34, padding: '0 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', fontSize: 12, outline: 'none', fontFamily: "'DM Sans',sans-serif" }}>
                {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Font Scale: {overrides.fontScale?.toFixed(2) || '1.00'}</label>
              <input type="range" min="0.8" max="1.4" step="0.05" value={overrides.fontScale || 1} onChange={e => updateOverride('fontScale', parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#06B6D4' }} />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Display Mode</label>
              <div className="flex gap-2">
                {(['light', 'dark', 'auto'] as const).map(m => (
                  <button key={m} onClick={() => updateOverride('mode', m)} style={{ flex: 1, padding: '6px 10', borderRadius: 6, border: overrides.mode === m ? '1px solid #06B6D4' : '1px solid rgba(255,255,255,0.1)', background: overrides.mode === m ? 'rgba(6,182,212,0.15)' : 'transparent', color: overrides.mode === m ? '#06B6D4' : '#94A3B8', fontSize: 11, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", textTransform: 'capitalize' }}>{m}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', padding: 20 }}>
          <div className="flex items-center gap-2" style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', marginBottom: 14 }}><Layout size={16} color="#06B6D4" /> Layout</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Sidebar Mode</label>
              <div className="flex gap-2">
                {LAYOUT_OPTIONS.map(l => (
                  <button key={l} onClick={() => {}} style={{ flex: 1, padding: '6px 10', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94A3B8', fontSize: 11, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", textTransform: 'capitalize' }}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Density: {overrides.density || 'comfortable'}</label>
              <div className="flex gap-2">
                {DENSITY_OPTIONS.map(d => (
                  <button key={d} onClick={() => updateOverride('density', d)} style={{ flex: 1, padding: '6px 10', borderRadius: 6, border: overrides.density === d ? '1px solid #06B6D4' : '1px solid rgba(255,255,255,0.1)', background: overrides.density === d ? 'rgba(6,182,212,0.15)' : 'transparent', color: overrides.density === d ? '#06B6D4' : '#94A3B8', fontSize: 11, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", textTransform: 'capitalize' }}>{d}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Border Radius: {themeCtx.layout.borderRadius}px</label>
              <input type="range" min="0" max="20" step="2" value={themeCtx.layout.borderRadius} onChange={e => updateOverride('borderRadius', parseInt(e.target.value))} style={{ width: '100%', accentColor: '#06B6D4' }} />
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', padding: 20 }}>
          <div className="flex items-center gap-2" style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', marginBottom: 14 }}><Sliders size={16} color="#06B6D4" /> Role Preview</div>
          <select value={activeRole} onChange={e => setActiveRole(e.target.value)} style={{ width: '100%', height: 34, padding: '0 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', fontSize: 12, outline: 'none', fontFamily: "'DM Sans',sans-serif", marginBottom: 10 }}>
            {Object.entries(ROLE_THEMES).map(([role, theme]) => (
              <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
            ))}
          </select>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {[
              { label: 'Primary', value: themeCtx.colors.primary },
              { label: 'Secondary', value: themeCtx.colors.secondary },
              { label: 'Accent', value: themeCtx.colors.accent },
              { label: 'Background', value: themeCtx.colors.background },
              { label: 'Surface', value: themeCtx.colors.surface },
              { label: 'Text', value: themeCtx.colors.text },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div style={{ width: 16, height: 16, borderRadius: 4, background: item.value, border: '1px solid rgba(255,255,255,0.1)' }} />
                <span style={{ fontSize: 10, color: '#64748B' }}>{item.label}</span>
                <span style={{ fontSize: 10, color: '#94A3B8', fontFamily: 'monospace' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', padding: 20 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
          <div className="flex items-center gap-2" style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}><Eye size={16} color="#06B6D4" /> Live Preview</div>
          <div className="flex gap-2">
            <button onClick={() => setPreviewMode('light')} style={{ padding: '4px 10', borderRadius: 4, border: previewMode === 'light' ? '1px solid #06B6D4' : '1px solid rgba(255,255,255,0.1)', background: previewMode === 'light' ? 'rgba(6,182,212,0.15)' : 'transparent', color: previewMode === 'light' ? '#06B6D4' : '#94A3B8', fontSize: 10, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Light</button>
            <button onClick={() => setPreviewMode('dark')} style={{ padding: '4px 10', borderRadius: 4, border: previewMode === 'dark' ? '1px solid #06B6D4' : '1px solid rgba(255,255,255,0.1)', background: previewMode === 'dark' ? 'rgba(6,182,212,0.15)' : 'transparent', color: previewMode === 'dark' ? '#06B6D4' : '#94A3B8', fontSize: 10, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Dark</button>
          </div>
        </div>
        <div style={{ padding: 16, borderRadius: 10, background: cssVars['--color-background'] || '#ffffff', color: cssVars['--color-text'] || '#0f172a', fontFamily: cssVars['--font-family'] || 'Inter, system-ui, sans-serif', fontSize: cssVars['--font-size'] || '14px', lineHeight: 1.6, border: `1px solid ${cssVars['--color-border'] || '#e2e8f0'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: cssVars['--color-primary'] || '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>A</div>
            <span style={{ fontWeight: 700, color: cssVars['--color-primary'] || '#2563eb', fontFamily: "'Syne',sans-serif" }}>AMEXAN</span>
            <span style={{ fontSize: 10, color: cssVars['--color-muted'] || '#94a3b8' }}>Theme Preview</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <div style={{ padding: '8px 12px', borderRadius: 6, background: cssVars['--color-surface'] || '#f8fafc', border: `1px solid ${cssVars['--color-border'] || '#e2e8f0'}`, fontSize: 11, color: cssVars['--color-text'] || '#0f172a' }}>Sidebar Nav</div>
            <div style={{ padding: '8px 12px', borderRadius: 6, background: cssVars['--color-primary'] || '#2563eb', color: '#fff', fontSize: 11 }}>Active Item</div>
            <div style={{ padding: '8px 12px', borderRadius: 6, background: 'transparent', border: `1px solid ${cssVars['--color-border'] || '#e2e8f0'}`, fontSize: 11, color: cssVars['--color-muted'] || '#94a3b8' }}>Inactive</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: cssVars['--color-primary'] || '#2563eb', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Primary Button</button>
            <button style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${cssVars['--color-border'] || '#e2e8f0'}`, background: 'transparent', color: cssVars['--color-text'] || '#0f172a', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Secondary</button>
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', padding: 20 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
          <div className="flex items-center gap-2" style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}><Download size={16} color="#06B6D4" /> CSS Variables Export</div>
          <button onClick={() => navigator.clipboard.writeText(JSON.stringify(cssVars, null, 2))} style={{ padding: '4px 10', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94A3B8', fontSize: 10, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}><Copy size={10} /> Copy</button>
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#94A3B8', maxHeight: 200, overflow: 'auto', padding: 10, background: 'rgba(0,0,0,0.2)', borderRadius: 6 }}>
          {Object.entries(cssVars).map(([k, v]) => (
            <div key={k} style={{ marginBottom: 2 }}><span style={{ color: '#06B6D4' }}>{k}</span>: <span style={{ color: '#E2E8F0' }}>{v}</span>;</div>
          ))}
        </div>
      </div>
    </div>
  );
}