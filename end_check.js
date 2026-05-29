const fs = require('fs');
const logContent = fs.readFileSync('C:/Users/Administrator/.local/share/opencode/tool-output/tool_e368e353800135PCAZZzQOSipq', 'utf8');
const textMarker = 'JSON parsing failed: Text: ';
const textStart = logContent.indexOf(textMarker);
let jsonText = logContent.substring(textStart + textMarker.length);
const contentMarker = '"content": "';
const contentStart = jsonText.indexOf(contentMarker);
let contentStr = jsonText.substring(contentStart + contentMarker.length);

// Find where the error message begins
const errorMarker = '\nError message:';
const errorIdx = contentStr.indexOf(errorMarker);

let validContent;
if (errorIdx > 0) {
  validContent = contentStr.substring(0, errorIdx);
} else {
  validContent = contentStr;
}

console.log('Valid content length:', validContent.length);
console.log('Last 200 chars:', validContent.substring(validContent.length - 200));

// Now try to parse the entire content string
// We need to properly handle JSON escape sequences
try {
  const parsed = JSON.parse('"' + validContent + '"');
  console.log('Parse succeeded! Length:', parsed.length);
  console.log('Contains FormState:', parsed.includes('FormState'));
  console.log('Contains buildNoteText:', parsed.includes('buildNoteText'));
  console.log('Contains AmexanApp:', parsed.includes('AmexanApp'));
  console.log('Contains formatPMH:', parsed.includes('formatPMH'));
  console.log('Newline count:', (parsed.match(/\n/g) || []).length);
  fs.writeFileSync('original_recovered.txt', parsed, 'utf8');
  console.log('Written to original_recovered.txt');
} catch (e) {
  console.log('Parse error:', e.message);
  // Find problematic area
  const errMatch = e.message.match(/position (\d+)/);
  if (errMatch) {
    const pos = parseInt(errMatch[1]);
    console.log('Context:', validContent.substring(Math.max(0, pos - 100), Math.min(validContent.length, pos + 100)));
  }
}
