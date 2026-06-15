import json, os, re, sys

# 1. Extract all diseaseIds from symptomLibrary.ts
symptom_lib_path = r"C:\Users\Administrator\Desktop\client\lib\history-engine\symptomLibrary.ts"
with open(symptom_lib_path, "r", encoding="utf-8") as f:
    content = f.read()

# Find all differentials entries: diseaseId: 'xxx'
disease_ids_symptom = set()
# Pattern for diseaseId: '...'
for m in re.finditer(r"diseaseId:\s*'([^']+)'", content):
    disease_ids_symptom.add(m.group(1))

print(f"Symptom Library unique diseaseIds: {len(disease_ids_symptom)}")

# 2. Extract all disease IDs from KG JSON files
kg_dir = r"C:\Users\Administrator\Desktop\client\src\engine\knowledge-graph\diseases"
disease_ids_kg = set()
for root, dirs, files in os.walk(kg_dir):
    for f in files:
        if f.endswith(".json"):
            fp = os.path.join(root, f)
            try:
                with open(fp, "r", encoding="utf-8") as jf:
                    data = json.load(jf)
                if isinstance(data, list):
                    for item in data:
                        if "id" in item:
                            disease_ids_kg.add(item["id"])
                elif isinstance(data, dict) and "id" in data:
                    disease_ids_kg.add(data["id"])
            except:
                pass

print(f"KG JSON disease IDs (unique): {len(disease_ids_kg)}")

# 3. Compare
in_symptom_not_kg = disease_ids_symptom - disease_ids_kg
in_kg_not_symptom = disease_ids_kg - disease_ids_symptom
intersection = disease_ids_symptom & disease_ids_kg

print(f"\n=== DISEASE ID COMPARISON ===")
print(f"In symptomLibrary but NOT in KG: {len(in_symptom_not_kg)}")
for d in sorted(in_symptom_not_kg):
    print(f"  SYMPTOM-ONLY: {d}")

print(f"\nIn KG but NOT in symptomLibrary: {len(in_kg_not_symptom)}")
# Show first 50
for i, d in enumerate(sorted(in_kg_not_symptom)):
    if i >= 100:
        print(f"  ... and {len(in_kg_not_symptom) - 100} more")
        break
    print(f"  KG-ONLY: {d}")

print(f"\nMatching (intersection): {len(intersection)}")
