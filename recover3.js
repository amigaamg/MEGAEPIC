const fs = require('fs');

// We need to reconstruct the corrupted file from available pieces.
// The current file contains most of the content (from various reconstructions).

// Strategy:
// 1. Read the temp file (newNoteFunction.txt) which has the correct new function
// 2. Find the buildNoteText function in the current file
// 3. Extract everything before and after the function
// 4. Concatenate to form the corrupted file format
// 5. Split properly

const temp = fs.readFileSync('newNoteFunction.txt', 'utf8');
const tempLines = temp.split('\n');
console.log('Temp file has', tempLines.length, 'lines');

// The temp file line 0 is the function signature
// Lines 1-1072 are the body
// Line 1073 is empty

// The corrupted file had:
// - Line 0: everything before the function body (85K chars, concatenated)
// - Lines 1-1072: temp lines 1-1072 (= function body WITHOUT signature)
// - Line 1073: everything after the function (132K chars, concatenated)

// In the CURRENT file (from recover.js runs), we have individual lines.
// But we need the CONCATENATED versions of parts 1 and 3.

// Actually, let me try a different approach: just use the current file,
// find the boundaries, and fix the specific commented-out useEffect lines.

// Read current file
const current = fs.readFileSync('app/consultation/respiratory/page.tsx', 'utf8');
const curLines = current.split('\n');
console.log('Current file has', curLines.length, 'lines');

// Find key markers
let beforeEnd = -1;
let funcStart = -1;
let funcEnd = -1;
let afterStart = -1;

for (let i = 0; i < curLines.length; i++) {
  const line = curLines[i];
  if (line.includes('// --- Plain Text Note Builder')) {
    beforeEnd = i; // This line and everything before is "before"
  }
  if (line.includes('function buildNoteText') && funcStart === -1) {
    funcStart = i; // This is the signature
  }
  if (line.trim() === '}' && funcStart !== -1 && funcEnd === -1 && i >= funcStart + 100) {
    funcEnd = i; // Closing brace of buildNoteText
  }
  if (line.includes('function formatPMH')) {
    afterStart = i; // This line and everything after is "after"
    break;
  }
}

console.log('beforeEnd:', beforeEnd+1);
console.log('funcStart:', funcStart+1);
console.log('funcEnd:', funcEnd+1);
console.log('afterStart:', afterStart+1);

// If we found the boundaries, reconstruct by replacing the old function with temp
if (beforeEnd !== -1 && funcStart !== -1 && funcEnd !== -1 && afterStart !== -1) {
  // Extract sections
  const beforeSection = curLines.slice(0, beforeEnd); // up to and including "// --- Plain Text Note Builder" comment
  // Note: the function ends at funcEnd, and afterStart should be right after funcEnd
  
  // But wait - the current file might not have the exact boundaries right.
  // Let me check if funcEnd and afterStart are adjacent
  console.log('\nfuncEnd line:', curLines[funcEnd] || '(empty)');
  if (funcEnd + 1 < curLines.length) {
    console.log('After funcEnd:', curLines[funcEnd+1]?.substring(0, 60));
  }
  console.log('afterStart line:', curLines[afterStart]?.substring(0, 60));
  
  // Check what the section between funcEnd and afterStart looks like
  if (funcEnd + 1 < afterStart) {
    console.log('Gap between funcEnd and afterStart:');
    for (let i = funcEnd + 1; i < afterStart; i++) {
      console.log('  Line', i+1, ':', curLines[i]?.substring(0, 80));
    }
  }
  
  // The new function should REPLACE everything from funcStart to funcEnd
  // But the current file's function body might not be the complete new function
  // Let's use temp lines instead
  
  const afterSection = curLines.slice(afterStart); // formatPMH onwards
  
  console.log('\nBefore section:', beforeSection.length, 'lines');
  console.log('After section:', afterSection.length, 'lines');
  console.log('Temp function:', tempLines.length, 'lines');
  
  // Combine: before + temp function + after
  const reconstructed = [...beforeSection, ...tempLines, ...afterSection];
  const result = reconstructed.join('\n');
  
  // Write
  fs.writeFileSync('app/consultation/respiratory/page.tsx', result, 'utf8');
  console.log('\nWritten! Total lines:', reconstructed.length);
}
