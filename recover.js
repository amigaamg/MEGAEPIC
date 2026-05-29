const fs = require('fs');

function splitJS(code) {
  // Pass 1: Depth tracking - properly handle // comments by stopping at keyword boundaries
  const depths = new Array(code.length);
  let depth = 0;
  let inString = null;
  let inTemplate = false;
  
  const topLevelStart = /^(import\s|export\s|interface\s|type\s|const\s|let\s|var\s|function\s)/;
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
    
    // Handle // comments - scan until keyword boundary or end
    if (ch === '/' && next === '/') {
      i++; // move to second /
      depths[i] = depth;
      // Scan forward, stop before a keyword that starts a new statement
      while (i + 1 < code.length) {
        const remaining = code.substring(i + 1);
        const trimmed = remaining.replace(/^\s+/, '');
        const skipLen = remaining.length - trimmed.length;
        if (topLevelStart.test(trimmed) || commentStart.test(trimmed)) {
          break;
        }
        i++;
        depths[i] = depth;
      }
      continue;
    }
    
    // Handle /* */ comments
    if (ch === '/' && next === '*') {
      i += 2;
      while (i + 1 < code.length && !(code[i] === '*' && code[i + 1] === '/')) {
        depths[i] = depth; i++;
      }
      if (i + 1 < code.length) i++;
      depths[i] = depth;
      continue;
    }
    
    if (ch === '"' || ch === "'") { inString = ch; continue; }
    if (ch === '`') { inTemplate = true; continue; }
    if (ch === '{') { depth++; continue; }
    if (ch === '}') { depth--; continue; }
  }
  
  // Pass 2: Split at depth-0 boundaries
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

const corrupted = fs.readFileSync('app/consultation/respiratory/page.tsx', 'utf8');
const lines = corrupted.split('\n');

const part1 = splitJS(lines[0]);
console.log('Part 1 lines:', part1.length);
// Last few of part1
console.log('Part 1 last:', part1[part1.length-1]?.substring(0, 80));

const part2 = lines.slice(1, 1073);
console.log('Part 2 lines:', part2.length);
console.log('Part 2 first:', part2[0]);
console.log('Part 2 last:', part2[part2.length-1]);

const part3 = splitJS(lines[1073]);
console.log('Part 3 lines:', part3.length);
console.log('Part 3 first:', part3[0]?.substring(0, 80));
console.log('Part 3 last:', part3[part3.length-1]?.substring(0, 80));

// Write reconstructed file
const reconstructed = [...part1, ...part2, ...part3].join('\n');
// Ensure it ends with newline
const finalContent = reconstructed.endsWith('\n') ? reconstructed : reconstructed + '\n';
fs.writeFileSync('app/consultation/respiratory/page.tsx', finalContent, 'utf8');
console.log('\nWritten! Lines:', finalContent.split('\n').length - 1); // subtract trailing newline line
