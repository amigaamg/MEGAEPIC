const fs = require('fs');
const code = fs.readFileSync('line1074_raw.txt', 'utf8');

// Verify depth tracking
function testDepth(code) {
  const depths = new Array(code.length);
  let depth = 0;
  let inString = null;
  let inTemplate = false;
  
  const topLevelStart = /^(import\s|export\s|interface\s|type\s|const\s|let\s|var\s|function\s)/;
  const varStart = /^(const|let|var)\s+\w+\s*[=:]/;
  const commentStart = /^(\/\/|\/\*)/;
  
  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    const next = code[i + 1] || '';
    depths[i] = depth;
    
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
      depths[i] = depth;
      while (i + 1 < code.length) {
        const remaining = code.substring(i + 1);
        const trimmed = remaining.replace(/^\s+/, '');
        if (topLevelStart.test(trimmed) || varStart.test(trimmed) || commentStart.test(trimmed)) {
          break;
        }
        i++;
        depths[i] = depth;
      }
      continue;
    }
    if (ch === '/' && next === '*') {
      i += 2;
      while (i + 1 < code.length && !(code[i] === '*' && code[i + 1] === '/')) { depths[i] = depth; i++; }
      if (i + 1 < code.length) i++;
      depths[i] = depth;
      continue;
    }
    if (ch === '"' || ch === "'") { inString = ch; continue; }
    if (ch === '`') { inTemplate = true; continue; }
    if (ch === '{') { depth++; continue; }
    if (ch === '}') { depth--; continue; }
  }
  
  return depths;
}

console.log('Total chars:', code.length);

const depths = testDepth(code);

// Count how many chars have depth 0 vs not
let depth0 = 0;
let depthGT0 = 0;
for (let i = 0; i < depths.length; i++) {
  if (depths[i] === 0) depth0++;
  else depthGT0++;
}
console.log('Depth 0 chars:', depth0);
console.log('Depth >0 chars:', depthGT0);

// Check if ALL chars have defined depth
let undefinedCount = 0;
for (let i = 0; i < depths.length; i++) {
  if (depths[i] === undefined) undefinedCount++;
}
console.log('Undefined depth:', undefinedCount);

// Check depth at the end
console.log('Final depth:', depths[depths.length - 1]);
console.log('Last 200 chars:', code.substring(code.length - 200));

// Check where the first non-zero depth area is
for (let i = 0; i < Math.min(code.length, 5000); i++) {
  if (depths[i] !== 0) {
    console.log(`Depth becomes ${depths[i]} at char ${i}:`, code.substring(Math.max(0,i-5), Math.min(code.length, i+20)));
    break;
  }
}

// Check how many depth zero spans there are
let zeroSpans = [];
let inSpan = false;
let start = 0;
for (let i = 0; i < code.length; i++) {
  if (depths[i] === 0 && !inSpan) {
    start = i;
    inSpan = true;
  }
  if (depths[i] !== 0 && inSpan) {
    zeroSpans.push({ start, end: i-1, len: i - start });
    inSpan = false;
  }
}
if (inSpan) zeroSpans.push({ start, end: code.length-1, len: code.length - start });
console.log(`\nTotal depth-0 spans: ${zeroSpans.length}`);
zeroSpans.sort((a, b) => b.len - a.len);
console.log('Top 20 depth-0 spans by length:');
for (let i = 0; i < Math.min(20, zeroSpans.length); i++) {
  console.log(`  #${i+1}: len=${zeroSpans[i].len}, start=${zeroSpans[i].start}, end=${zeroSpans[i].end}, context: ${code.substring(zeroSpans[i].start, Math.min(code.length, zeroSpans[i].start + 80)).replace(/\n/g, '\\n')}`);
}
