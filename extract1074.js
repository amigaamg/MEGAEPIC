const fs = require('fs');

// Read the debug output file
const debugContent = fs.readFileSync('C:/Users/Administrator/.local/share/opencode/tool-output/tool_e3aa7d3c5001nRTfF4UyyRBjWH', 'utf8');

// Find the line with the corrupted content
const marker = "Last line (1074): '";
const startIdx = debugContent.indexOf(marker);
if (startIdx === -1) {
  console.log('Could not find marker');
  process.exit(1);
}

const contentStart = startIdx + marker.length;
// The content ends with the closing quote
// Find it - it should be at the very end of the file
const contentEnd = debugContent.lastIndexOf("'");
if (contentEnd <= contentStart) {
  console.log('Could not find closing quote');
  process.exit(1);
}

const line1074Content = debugContent.substring(contentStart, contentEnd);
console.log('Extracted line 1074 length:', line1074Content.length);
console.log('Starts with:', line1074Content.substring(0, 100));
console.log('Ends with:', line1074Content.substring(line1074Content.length - 100));

// Save to file for processing
fs.writeFileSync('line1074_raw.txt', line1074Content, 'utf8');
console.log('Saved to line1074_raw.txt');
