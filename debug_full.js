const fs = require('fs');
const code = fs.readFileSync('line1074_raw.txt', 'utf8');

// Test splitJS from debug_split.js on FULL content
function splitJS(code) {
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
  
  const result = [];
  let current = '';
  const declPat = /^(import\s|export\s|interface\s|type\s|function\s)/;
  const varPat = /^(const|let|var)\s+\w+\s*[=:]/;
  
  for (let i = 0; i < code.length; i++) {
    if (i < depths.length && depths[i] === 0 && current.length > 0) {
      const trimmed = code.substring(i).replace(/^\s+/, '');
      let isBoundary = false;
      if (declPat.test(trimmed) || varPat.test(trimmed) || /^\/\//.test(trimmed) || /^\/\*/.test(trimmed)) {
        isBoundary = true;
      }
      if (isBoundary) {
        const curTrim = current.trimEnd();
        if (curTrim.length > 0) {
          const l = curTrim[curTrim.length - 1];
          if (l !== '.' && l !== ':' && l !== ',' && l !== '?' && l !== '|' && l !== '&') {
            result.push(curTrim);
            current = '';
          }
        }
      }
    }
    current += code[i];
  }
  if (current.trim().length > 0) result.push(current.trimEnd());
  return result;
}

console.log('Full file length:', code.length);
const split = splitJS(code);
console.log('Split lines:', split.length);
// Print line sizes
let total = 0;
for (let i = 0; i < Math.min(split.length, 30); i++) {
  console.log(`  #${i+1}: pos=${total}, len=${split[i].length}, ${split[i].substring(0, 80)}`);
  total += split[i].length;
}
console.log('Total chars in lines:', total);

// Check the last boundary
console.log('\nLast 3 lines:');
for (let i = Math.max(0, split.length - 3); i < split.length; i++) {
  console.log(`  #${i+1}: len=${split[i].length}, ${split[i].substring(0, 100)}`);
}
