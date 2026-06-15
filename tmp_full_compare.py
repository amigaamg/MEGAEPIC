import json, os, re

# === 1. Extract IDs from symptomLibrary.ts ===
with open(r"C:\Users\Administrator\Desktop\client\lib\history-engine\symptomLibrary.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Extract all diseaseIds used in differentials
symptom_ids = set()
for m in re.finditer(r"diseaseId:\s*'([^']+)'", content):
    symptom_ids.add(m.group(1))

# Extract DISEASE_PROFILES keys
profile_ids = set()
for m in re.finditer(r"'([^']+)':\s*\{", content):
    if m.group(1) not in ("SymptomEntry", "DISEASE_PROFILES", "Record"):
        profile_ids.add(m.group(1))

print(f"Symptom Library (from differentials): {len(symptom_ids)} unique diseaseIds")
print(f"DISEASE_PROFILES entries: {len(profile_ids)}")
print()

# === 2. Extract IDs from KG JSON files ===
kg_dir = r"C:\Users\Administrator\Desktop\client\src\engine\knowledge-graph\diseases"
kg_ids = set()
file_count = 0
error_files = []

for root, dirs, files in os.walk(kg_dir):
    for f in sorted(files):
        if not f.endswith(".json"):
            continue
        fp = os.path.join(root, f)
        file_count += 1
        try:
            with open(fp, "r", encoding="utf-8", errors="replace") as jf:
                raw = jf.read()
            data = json.loads(raw)
            if isinstance(data, list):
                for item in data:
                    if isinstance(item, dict) and "id" in item:
                        kg_ids.add(item["id"])
            elif isinstance(data, dict):
                if "id" in data:
                    kg_ids.add(data["id"])
                elif "disease" in data and isinstance(data["disease"], dict) and "id" in data["disease"]:
                    kg_ids.add(data["disease"]["id"])
                elif "diseases" in data and isinstance(data["diseases"], list):
                    for item in data["diseases"]:
                        if isinstance(item, dict) and "id" in item:
                            kg_ids.add(item["id"])
        except Exception as e:
            error_files.append(f)

print(f"Total KG JSON files scanned: {file_count}")
print(f"Files with parse errors: {len(error_files)}")
print(f"Unique KG disease IDs: {len(kg_ids)}")
print()

# === 3. Compare ===
in_symptom_not_kg = symptom_ids - kg_ids
in_kg_not_symptom = kg_ids - symptom_ids
intersection = symptom_ids & kg_ids

print(f"=== CROSS-REFERENCE ===")
print(f"In symptomLibrary but NOT in KG: {len(in_symptom_not_kg)}")
print(f"In KG but NOT in symptomLibrary: {len(in_kg_not_symptom)}")
print(f"Matching (intersection): {len(intersection)}")
print()

# Find matching IDs by normalizing symptom IDs (removing _pulm, _card suffixes)
def normalize_symptom_id(sid):
    # Try to find base disease name by removing system suffixes
    suffixes = ["_pulm", "_card", "_t1", "_t2"]
    for suffix in suffixes:
        if sid.endswith(suffix):
            base = sid[:-len(suffix)]
            return base
    return sid

normalized_symptom = {normalize_symptom_id(s): s for s in symptom_ids}
print("=== PARTIAL MATCHES (after normalization) ===")
partial_matches = []
for kg_id in sorted(in_kg_not_symptom):
    norm = kg_id.replace("-", "_")
    if norm in normalized_symptom:
        partial_matches.append((kg_id, normalized_symptom[norm]))

print(f"Normalized matches (KG -> Symptom): {len(partial_matches)}")
for kg_id, sym_id in sorted(partial_matches):
    print(f"  KG: {kg_id:40s} <-> Symptom: {sym_id}")

# Show samples of unmatched
print()
print("=== SAMPLE: In symptom but not KG ===")
for i, d in enumerate(sorted(in_symptom_not_kg)):
    if i >= 20:
        break
    print(f"  {d}")
print(f"  ... ({len(in_symptom_not_kg)} total)")

print()
print("=== SAMPLE: In KG but not symptom ===")
for i, d in enumerate(sorted(in_kg_not_symptom)):
    if i >= 30:
        break
    print(f"  {d}")
print(f"  ... ({len(in_kg_not_symptom)} total)")
