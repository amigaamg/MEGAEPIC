const fs = require('fs');

// Read pieces
const beforeContent = fs.readFileSync('original_recovered.txt', 'utf8');
const beforeLines = beforeContent.split('\n');
const tempFunc = fs.readFileSync('newNoteFunction.txt', 'utf8');
const tempLines = tempFunc.split('\n');
const afterRaw = fs.readFileSync('line1074_raw.txt', 'utf8');

console.log('Before section lines:', beforeLines.length);
console.log('Temp function lines:', tempLines.length);
console.log('After raw chars:', afterRaw.length);

// The recovered file has:
// Lines 0-356: before-insertion (imports, data, interfaces, helpers, scoring, etc.)
// Line 357: function buildNote(...
// Lines 358-638: buildNote function body
// Line 639: } (end of buildNote)
// Lines 640-??? : old buildNoteText (replaced by new one)
// Lines ???: format functions + component (partially present in recovered, completely in afterRaw)

// Let's find the boundary between before-insertion and old buildNoteText
let buildNoteStart = -1;
let buildNoteEnd = -1;
let buildNoteTextStart = -1;
let formatFunctionsStart = -1;

for (let i = 0; i < beforeLines.length; i++) {
  if (beforeLines[i].includes('function buildNote(')) {
    buildNoteStart = i;
  }
  if (buildNoteStart !== -1 && beforeLines[i].trim() === '}' && buildNoteEnd === -1 && i > buildNoteStart + 50) {
    buildNoteEnd = i;
  }
  if (beforeLines[i].includes('function buildNoteText') && buildNoteTextStart === -1) {
    buildNoteTextStart = i;
  }
  if (beforeLines[i].includes('function formatPMH') && formatFunctionsStart === -1) {
    formatFunctionsStart = i;
  }
}

console.log('\nRecovered file structure:');
console.log('buildNote at line:', buildNoteStart + 1, 'to', buildNoteEnd + 1);
console.log('old buildNoteText at line:', buildNoteTextStart + 1);
console.log('formatPMH at line:', formatFunctionsStart + 1);

// The before-insertion section (for our final file) is from line 0 to buildNoteEnd (inclusive)
// This includes: imports, interfaces, data constants, helpers, buildNote function
const beforeSection = beforeLines.slice(0, buildNoteEnd + 1);
console.log('Before section:', beforeSection.length, 'lines');

// Now split the after-raw content using splitJS
function splitJS(code) {
  const depths = new Array(code.length);
  let depth = 0;
  let inString = null;
  let inTemplate = false;
  
  const topLevelStart = /^(import\s|export\s|interface\s|type\s|const\s|let\s|var\s|function\s)/;
  const varStart = /^(const|let|var)\s+\w+\s*[=:]/;
  const commentStart = /^(\/\/|\/\*)/;
  
  // Pass 1: Depth tracking
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
  
  // Pass 2: Split at depth-0 boundaries
  const result = [];
  let current = '';
  const declPat = /^(import\s|export\s|interface\s|type\s|function\s)/;
  const varPat = /^(const|let|var)\s+\w+\s*[=:]/;
  
  for (let i = 0; i < code.length; i++) {
    if (i < depths.length && depths[i] === 0 && current.length > 0) {
      const trimmed = code.substring(i).replace(/^[\s;})]+/, '');
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

console.log('\nSplitting after-raw content...');
// Debug: first test on first 20000 chars
const testSplit = splitJS(afterRaw.substring(0, 20000));
console.log('Test split (first 20k chars):', testSplit.length, 'lines');

console.log('\nNow full split...');
const afterSection = splitJS(afterRaw);
console.log('After section:', afterSection.length, 'lines');
console.log('First:', afterSection[0]?.substring(0, 100));
console.log('Last:', afterSection[afterSection.length - 1]?.substring(0, 100));

// Combine all sections
const finalFile = [
  ...beforeSection,  // before-insertion + buildNote
  ...tempLines,      // new buildNoteText
  ...afterSection,    // after-insertion (format functions, UI, component, export)
].join('\n') + '\n';

console.log('\nFinal file lines:', finalFile.split('\n').length - 1); // -1 for trailing \n

// Write the file
fs.writeFileSync('app/consultation/respiratory/page.tsx', finalFile, 'utf8');
console.log('Written!');
