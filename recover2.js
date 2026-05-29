const fs = require('fs');

// Read the newNoteFunction.txt (which contains the COMPLETE new function)
const tempFunc = fs.readFileSync('newNoteFunction.txt', 'utf8');
const tempLines = tempFunc.split('\n');
console.log('Temp file lines:', tempLines.length);
console.log('Temp line 0:', tempLines[0]?.substring(0, 80));
console.log('Temp line 1:', tempLines[1]?.substring(0, 80));
console.log('Temp last non-empty:', tempLines.filter(l => l.trim().length > 0).pop()?.substring(0, 80));

// Read the CURRENT file (which is the PREVIOUS reconstruction)
const current = fs.readFileSync('app/consultation/respiratory/page.tsx', 'utf8');
const currentLines = current.split('\n');
console.log('\nCurrent file lines:', currentLines.length);
console.log('Current line 1:', currentLines[0]?.substring(0, 80));
console.log('Current line 2:', currentLines[1]?.substring(0, 80));

// The file that was corrupted originally had:
// - lines 0: everything from start of file to just before buildNoteText body (85K chars)
// - lines 1-1072: the NEW buildNoteText function body 
// - lines 1073: everything after buildNoteText (132K chars)

// Our recover.js first run read this file and tried to split lines 0 and 1073
// But the temp file has the FULL new function (signature + body)
// The corrupted file's lines 1-1072 only have the body (missing signature)
// The signature is at the END of corrupted line 0

// So the CURRENT file (from recover.js first run) has:
// - line 0: "'use client';" (from splitJS of corrupted line 0 - extremely buggy)
// - lines 1-1072: corrupted lines 1-1072 (function body from original corrupted file)
// - line 1073: one line from splitJS of corrupted line 1073 - buggy

// This is WRONG. We need to:
// 1. Get the ORIGINAL corrupted file content
// 2. Recover it properly

// But the original corrupted file was overwritten!
// HOWEVER, we can reconstruct it because:
// - corrupted line 0 + lines 1-1072 + line 1073 = the ENTIRE corrupted file
// - And we have:
//   * The CURRENT file (previous reconstruction) which has parts of it
//   * The temp file (newNoteFunction.txt) which has the complete new function
//   * The TS errors tell us what's wrong

// Actually, we can't get the original corrupted file back.
// But we CAN read the CURRENT file (which is the PREVIOUS reconstruction with 1343 lines)
// ... except that was overwritten by the SECOND run of recover.js too.

// Let me check what the ACTUAL current state is:
console.log('\nAnalyzing actual current state...');
console.log('Has buildNoteText at line with signature:');
for (let i = 0; i < Math.min(currentLines.length, 200); i++) {
  if (currentLines[i].includes('buildNoteText')) {
    console.log('  Line', i+1, ':', currentLines[i].substring(0, 100));
    console.log('  Next:', currentLines[i+1]?.substring(0, 80));
    console.log('  Prev:', currentLines[i-1]?.substring(0, 80));
  }
}
console.log('\nHas formatPMH at line:');
for (let i = 0; i < currentLines.length; i++) {
  if (currentLines[i].includes('formatPMH')) {
    console.log('  Line', i+1, ':', currentLines[i].substring(0, 100));
    break;
  }
}

// Find the end of buildNote body
for (let i = 0; i < currentLines.length; i++) {
  const t = currentLines[i]?.trim();
  if (t === '}' && i > 0 && currentLines[i-1]?.includes('buildNote(')) {
    console.log('\nbuildNote end at line', i+1);
  }
}
