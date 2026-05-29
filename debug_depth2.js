const fs = require('fs');
const code = fs.readFileSync('line1074_raw.txt', 'utf8');

let depth = 0;
let inString = null;
let inTemplate = false;

const topLevelStart = /^(import\s|export\s|interface\s|type\s|const\s|let\s|var\s|function\s)/;
const varStart = /^(const|let|var)\s+\w+\s*[=:]/;
const commentStart = /^(\/\/|\/\*)/;

let depthChanges = [];
let prevDepth = 0;

for (let i = 0; i < code.length; i++) {
  const ch = code[i];
  const next = code[i + 1] || '';
  
  if (inString) {
    if (ch === '\\' && next) { i++; continue; }
    if (ch === inString) inString = null;
    continue;
  }
  if (inTemplate) {
    if (ch === '\\' && next) { i++; continue; }
    if (ch === '`') { inTemplate = false; continue; }
    if (ch === '$' && next === '{') { i++; continue; }
    continue;
  }
  if (ch === '/' && next === '/') {
    i++;
    while (i + 1 < code.length) {
      const remaining = code.substring(i + 1);
      const trimmed = remaining.replace(/^\s+/, '');
      if (topLevelStart.test(trimmed) || varStart.test(trimmed) || commentStart.test(trimmed)) break;
      i++;
    }
    continue;
  }
  if (ch === '/' && next === '*') {
    i += 2;
    while (i + 1 < code.length && !(code[i] === '*' && code[i + 1] === '/')) { i++; }
    if (i + 1 < code.length) i++;
    continue;
  }
  if (ch === '"' || ch === "'") { inString = ch; continue; }
  if (ch === '`') { inTemplate = true; continue; }
  if (ch === '{' || ch === '}') {
    if (ch === '{') depth++;
    else depth--;
    const start = Math.max(0, i - 15);
    const end = Math.min(code.length, i + 15);
    depthChanges.push({pos: i, ch, depth, ctx: code.substring(start, end).replace(/\n/g, '\\n')});
    prevDepth = depth;
    continue;
  }
}

console.log('Final depth:', depth);
console.log('Total chars:', code.length);

let zeroReturns = depthChanges.filter(d => d.ch === '}' && d.depth === 0);
console.log(`Depth returns to 0: ${zeroReturns.length} times`);

console.log(`\nAll depth return-to-0 positions:`);
zeroReturns.forEach(d => console.log(`  pos=${d.pos}, ctx=${d.ctx.substring(0, 60)}`));

console.log(`\nFirst 30 depth changes:`);
depthChanges.slice(0, 30).forEach(d => console.log(`  pos=${d.pos}, ch='${d.ch}', depth=${d.depth}, ctx=${d.ctx.substring(0, 80)}`));

console.log(`\nWhere formatBirth starts...`);
const birthIdx = code.indexOf('function formatBirth');
console.log('formatBirth at pos:', birthIdx);
if (birthIdx > 0) {
  // Show depth changes around birthIdx
  const aroundBirth = depthChanges.filter(d => Math.abs(d.pos - birthIdx) < 100);
  aroundBirth.forEach(d => console.log(`  pos=${d.pos}, ch='${d.ch}', depth=${d.depth}, ctx=${d.ctx.substring(0, 80)}`));
}
