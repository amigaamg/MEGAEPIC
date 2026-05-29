const fs = require('fs');

// Read the error log file that contains the original content
const logContent = fs.readFileSync('C:/Users/Administrator/.local/share/opencode/tool-output/tool_e368e353800135PCAZZzQOSipq', 'utf8');

// Find the start of JSON content after "Text: "
const textMarker = 'JSON parsing failed: Text: ';
const textStart = logContent.indexOf(textMarker);
if (textStart === -1) {
  console.log('Could not find JSON text marker');
  process.exit(1);
}

let jsonText = logContent.substring(textStart + textMarker.length);

// Now we need to find the content string. The JSON starts with:
// {"filePath": "...", "content": "...rest of file..."
// We need to find where the "content" value ends.

// Find the "content" key-value pair
const contentMarker = '"content": "';
const contentStart = jsonText.indexOf(contentMarker);
if (contentStart === -1) {
  console.log('Could not find content marker');
  process.exit(1);
}

// The content string starts after the marker
let contentStr = jsonText.substring(contentStart + contentMarker.length);

// Now we need to find where this JSON string ends.
// In JSON, a string ends at an unescaped quote character.
// We need to find the closing quote, taking escapes into account.

let endIdx = -1;
let i = 0;
while (i < contentStr.length) {
  const ch = contentStr[i];
  if (ch === '\\') {
    i += 2; // skip the escaped character
    continue;
  }
  if (ch === '"') {
    endIdx = i;
    break;
  }
  i++;
}

if (endIdx === -1) {
  console.log('Could not find end of content string (unterminated)');
  console.log('Content string length:', contentStr.length);
  // Try to use the whole content
  endIdx = contentStr.length;
}

// Extract the JSON-escaped content string
const escapedContent = contentStr.substring(0, endIdx);
console.log('Found content string, escaped length:', escapedContent.length);

// Now parse the JSON escape sequences to get the actual file content
// We can use JSON.parse on a properly quoted string
// But JSON.parse expects the ENTIRE string to be valid JSON
// The escaped content might have embedded quotes etc. that need proper escaping

try {
  // Try parsing as JSON string by wrapping in quotes
  const parsed = JSON.parse('"' + escapedContent + '"');
  console.log('Successfully parsed! Got', parsed.length, 'chars');
  console.log('First 100 chars:', parsed.substring(0, 100));
  console.log('Contains FormState:', parsed.includes('FormState'));
  console.log('Contains buildNoteText:', parsed.includes('buildNoteText'));
  console.log('Contains AmexanApp:', parsed.includes('AmexanApp'));
  console.log('Contains formatPMH:', parsed.includes('formatPMH'));
  
  // Check total lines (by counting \n)
  const newlineCount = (parsed.match(/\n/g) || []).length;
  console.log('Newline count:', newlineCount);
  
  // Write to a recovery file
  fs.writeFileSync('original_content_recovered.txt', parsed, 'utf8');
  console.log('Written to original_content_recovered.txt');
} catch (e) {
  console.log('Parse error:', e.message);
  console.log('Around error position:');
  const errMatch = e.message.match(/position (\d+)/);
  if (errMatch) {
    const pos = parseInt(errMatch[1]);
    console.log('Context:', escapedContent.substring(Math.max(0, pos - 50), Math.min(escapedContent.length, pos + 50)));
  }
}
