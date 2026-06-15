/**
 * Build a compact reverse index: symptomId → KG diseases
 * Scans all KG disease JSON files, extracts historyFeatures,
 * and maps them to symptom library symptom IDs.
 *
 * Run: node scripts/buildKgSymptomIndex.mjs
 * Output: lib/history-engine/kgSymptomIndex.json
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, resolve } from 'path';

const KG_DIR = resolve('src/engine/knowledge-graph/diseases');
const OUT_FILE = resolve('lib/history-engine/kgSymptomIndex.json');

// Load symptom library IDs so we only index known symptoms
const SYMPTOM_LIB_FILE = resolve('lib/history-engine/symptomLibrary.ts');

// Extract symptom IDs from symptom library
const symptomLibContent = readFileSync(SYMPTOM_LIB_FILE, 'utf-8');
const symptomIds = new Set(
  [...symptomLibContent.matchAll(/id:\s*'([^']+)'/g)].map(m => m[1])
);
console.log(`Found ${symptomIds.size} symptom IDs in library`);

// Walk all KG directories
function walkDir(dir) {
  const results = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...walkDir(fullPath));
      } else if (entry.name.endsWith('.json')) {
        results.push(fullPath);
      }
    }
  } catch (e) {
    // skip inaccessible dirs
  }
  return results;
}

const kgFiles = walkDir(KG_DIR);
console.log(`Found ${kgFiles.length} KG JSON files`);

// Build reverse index: symptomId → [{kgId, name, weight}]
const index = new Map(); // symptomId -> Set of {kgId, name, weight} JSON strings

let totalDiseasesWithFeatures = 0;

for (const filePath of kgFiles) {
  try {
    const raw = readFileSync(filePath, 'utf-8').trim();
    if (!raw) continue;
    
    const parsed = JSON.parse(raw);
    // Handle both formats: {disease: {...}} and [...] arrays
    const diseases = parsed.disease ? [parsed.disease] : (Array.isArray(parsed) ? parsed : [parsed]);
    
    for (const disease of diseases) {
      if (!disease || !disease.id) continue;
      const hf = disease.historyFeatures;
      if (!hf || !Array.isArray(hf) || hf.length === 0) continue;
      
      totalDiseasesWithFeatures++;
      
      for (const feature of hf) {
        const sid = feature.symptomId;
        if (!sid || !symptomIds.has(sid)) continue;
        
        const weight = typeof feature.weight === 'number' ? feature.weight : 5;
        const entry = JSON.stringify({
          kgId: disease.id,
          name: disease.name || disease.id.replace(/_/g, ' '),
          weight,
        });
        
        if (!index.has(sid)) index.set(sid, new Set());
        index.get(sid).add(entry);
      }
    }
  } catch (e) {
    // skip malformed files
  }
}

// Convert to final format
const output = {};
for (const [sid, entries] of index) {
  output[sid] = [...entries].map(e => JSON.parse(e));
}

console.log(`KG diseases with historyFeatures: ${totalDiseasesWithFeatures}`);
console.log(`Symptoms mapped: ${Object.keys(output).length}`);
console.log(`Total KG-disease-to-symptom associations: ${
  Object.values(output).reduce((sum, arr) => sum + arr.length, 0)
}`);

writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));
console.log(`Written to ${OUT_FILE}`);
