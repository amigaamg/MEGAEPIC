const fs = require('fs');

const afterRaw = fs.readFileSync('line1074_raw.txt', 'utf8');

// Test: does varStart work?
const varStart = /^(const|let|var)\s+\w+\s*[=:]/;
const test = "const CSS_VARS = '...'";
console.log('varStart test:', varStart.test(test));

// Test: where is the first // comment?
const firstSlash = afterRaw.indexOf('//');
console.log('First // at pos:', firstSlash);
console.log('Context:', afterRaw.substring(Math.max(0, firstSlash - 30), Math.min(afterRaw.length, firstSlash + 60)));

// Check if varStart matches at the position after the first //
const afterFirstSlash = afterRaw.substring(firstSlash + 2); // skip //
// Find const CSS_VARS
const cvIdx = afterFirstSlash.indexOf('const CSS_VARS');
console.log('const CSS_VARS at pos:', cvIdx, 'in string after //');
if (cvIdx >= 0) {
  const substr = afterFirstSlash.substring(cvIdx);
  console.log('Substring:', substr.substring(0, 50));
  console.log('varStart test:', varStart.test(substr));
}

// Now test the full splitJS
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
      let consumed = 0;
      while (i + 1 < code.length) {
        const remaining = code.substring(i + 1);
        const trimmed = remaining.replace(/^\s+/, '');
        if (topLevelStart.test(trimmed) || varStart.test(trimmed) || commentStart.test(trimmed)) {
          break;
        }
        i++;
        depths[i] = depth;
        consumed++;
      }
      if (firstSlash >= 0 && consumed > 0) {
        // debug first comment
        // console.log('Comment consumed', consumed, 'chars, stopped before:', code.substring(i+1, Math.min(i+50, code.length)));
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

// Test on first 10000 chars only
const testSlice = afterRaw.substring(0, 10000);
console.log('\nTest slice length:', testSlice.length);
console.log('First // in slice at:', testSlice.indexOf('//'));
const split = splitJS(testSlice);
console.log('Split result:', split.length, 'lines');
for (let i = 0; i < Math.min(split.length, 10); i++) {
  console.log('  #' + (i+1) + ': len=' + split[i].length, split[i].substring(0, 100));
}
