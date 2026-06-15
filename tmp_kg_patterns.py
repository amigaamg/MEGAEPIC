import json, os, re

kg_dir = r"C:\Users\Administrator\Desktop\client\src\engine\knowledge-graph\diseases"
count = 0
patterns = {}
print("=== First 40 KG JSON files analysis ===")
print()

nested_ids = set()

for root, dirs, files in os.walk(kg_dir):
    for f in sorted(files):
        if not f.endswith(".json"):
            continue
        if count >= 40:
            break
        fp = os.path.join(root, f)
        try:
            with open(fp, "r", encoding="utf-8", errors="replace") as jf:
                raw = jf.read(800)
            m = re.search(r'\"id\":\s*\"([^\"]+)\"', raw)
            the_id = m.group(1) if m else "NO-ID"
            if '"disease"' in raw[:200]:
                t = "DISEASE-WRAPPER"
                if m:
                    nested_ids.add(the_id)
            elif raw.strip().startswith("["):
                t = "ARRAY"
                if m:
                    nested_ids.add(the_id)
            elif raw.strip().startswith("{"):
                t = "PLAIN-OBJECT"
            else:
                t = "OTHER"
            patterns[t] = patterns.get(t, 0) + 1
            print(f"  [{t:15s}] {f:45s} -> id={the_id}")
        except Exception as e:
            print(f"  [ERROR] {f}: {e}")
        count += 1

print()
print(f"Patterns: {patterns}")
print(f"Unique IDs from first 40: {len(nested_ids)}")
