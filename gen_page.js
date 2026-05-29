const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'app/consultation/respiratory/page.tsx');

// Write the file using incremental chunks to handle large content
const chunks = [];

// We'll use arrays and join to avoid template literal issues
const lines = [];

// ─── Line 1: use client ───
lines.push("'use client';");

// ─── Line 3: imports ───
lines.push('');
lines.push("import { useState, useMemo, useCallback } from 'react';");

// ─── Icon Component ───
lines.push('');
lines.push('// ─── Inline Icon Component ──────────────────────────────────────────────────────');
lines.push('');
lines.push('const Icon = ({ name, size = 14, color }: { name: string; size?: number; color?: string }) => {');
lines.push("  const svgProps = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color || 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };");
lines.push("  const icons: Record<string, JSX.Element> = {");
lines.push("    check: <svg {...svgProps}><polyline points=\"20 6 9 17 4 12\" /></svg>,");
lines.push("    'info-circle': <svg {...svgProps}><circle cx=\"12\" cy=\"12\" r=\"10\" /><line x1=\"12\" y1=\"16\" x2=\"12\" y2=\"12\" /><line x1=\"12\" y1=\"8\" x2=\"12.01\" y2=\"8\" /></svg>,");
lines.push("    'alert-triangle': <svg {...svgProps}><path d=\"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z\" /><line x1=\"12\" y1=\"9\" x2=\"12\" y2=\"13\" /><line x1=\"12\" y1=\"17\" x2=\"12.01\" y2=\"17\" /></svg>,");
lines.push("    user: <svg {...svgProps}><path d=\"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2\" /><circle cx=\"12\" cy=\"7\" r=\"4\" /></svg>,");
lines.push("    list: <svg {...svgProps}><line x1=\"8\" y1=\"6\" x2=\"21\" y2=\"6\" /><line x1=\"8\" y1=\"12\" x2=\"21\" y2=\"12\" /><line x1=\"8\" y1=\"18\" x2=\"21\" y2=\"18\" /><line x1=\"3\" y1=\"6\" x2=\"3.01\" y2=\"6\" /><line x1=\"3\" y1=\"12\" x2=\"3.01\" y2=\"12\" /><line x1=\"3\" y1=\"18\" x2=\"3.01\" y2=\"18\" /></svg>,");
lines.push("    notes: <svg {...svgProps}><path d=\"M9 4h6l4 4v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z\" /><polyline points=\"9 4 9 10 15 10 15 4\" /></svg>,");
lines.push("    clipboard: <svg {...svgProps}><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\" /><rect x=\"8\" y=\"2\" width=\"8\" height=\"4\" rx=\"1\" ry=\"1\" /></svg>,");
lines.push("    heart: <svg {...svgProps}><path d=\"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z\" /></svg>,");
lines.push("    'chart-bar': <svg {...svgProps}><line x1=\"12\" y1=\"20\" x2=\"12\" y2=\"10\" /><line x1=\"18\" y1=\"20\" x2=\"18\" y2=\"4\" /><line x1=\"6\" y1=\"20\" x2=\"6\" y2=\"16\" /></svg>,");
lines.push("    shield: <svg {...svgProps}><path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\" /></svg>,");
lines.push("    apple: <svg {...svgProps}><circle cx=\"12\" cy=\"8\" r=\"2\" /><path d=\"M12 10v4\" /><path d=\"M10 14h4\" /></svg>,");
lines.push("    users: <svg {...svgProps}><path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\" /><circle cx=\"9\" cy=\"7\" r=\"4\" /><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\" /><path d=\"M16 3.13a4 4 0 0 1 0 7.75\" /></svg>,");
lines.push("    search: <svg {...svgProps}><circle cx=\"11\" cy=\"11\" r=\"8\" /><line x1=\"21\" y1=\"21\" x2=\"16.65\" y2=\"16.65\" /></svg>,");
lines.push("    activity: <svg {...svgProps}><polyline points=\"22 12 18 12 15 21 9 3 6 12 2 12\" /></svg>,");
lines.push("    'file-text': <svg {...svgProps}><path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\" /><polyline points=\"14 2 14 8 20 8\" /><line x1=\"16\" y1=\"13\" x2=\"8\" y2=\"13\" /><line x1=\"16\" y1=\"17\" x2=\"8\" y2=\"17\" /><polyline points=\"10 9 9 9 8 9\" /></svg>,");
lines.push("    copy: <svg {...svgProps}><rect x=\"9\" y=\"9\" width=\"13\" height=\"13\" rx=\"2\" ry=\"2\" /><path d=\"M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1\" /></svg>,");
lines.push("    'arrow-right': <svg {...svgProps}><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\" /><polyline points=\"12 5 19 12 12 19\" /></svg>,");
lines.push("    lungs: <svg {...svgProps}><path d=\"M22 12c0-2.5-2-5-4-5s-4 2-4 4c0-2-2-4-4-4s-4 2-4 4c0-2-2-2.5-4-4s-4 2.5-4 5c0 6 8 10 12 10s12-4 12-10z\" /></svg>,");
lines.push("    brain: <svg {...svgProps}><path d=\"M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 5.5V21l4-2 4 2v-6.5c1.5-1 3-3 3-5.5a7 7 0 0 0-7-7z\" /></svg>,");
lines.push("    eye: <svg {...svgProps}><path d=\"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z\" /><circle cx=\"12\" cy=\"12\" r=\"3\" /></svg>,");
lines.push("    star: <svg {...svgProps}><polygon points=\"12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2\" /></svg>,");
lines.push("    thermometer: <svg {...svgProps}><path d=\"M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z\" /></svg>,");
lines.push("    droplet: <svg {...svgProps}><path d=\"M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z\" /></svg>,");
lines.push("  };");
lines.push("  return icons[name] || <span />;");
lines.push("};");

// Check for backtick count
let totalBackticks = 0;
lines.forEach(function(l) {
  for (var c of l) { if (c === '`') totalBackticks++; }
});
console.log('Backticks used: ' + totalBackticks);
console.log('Even: ' + (totalBackticks % 2 === 0));

// Write file
fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('File written: ' + filePath);
