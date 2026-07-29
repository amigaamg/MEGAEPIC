import json

class DifferentialEngine:
    def __init__(self, diseases_path="knowledge/diseases.json"):
        with open(diseases_path, 'r') as f:
            data = json.load(f)
        self.diseases = data["diseases"]

    def evaluate(self, acet_state):
        scores = []
        symptoms = acet_state.get("symptoms", {})
        exam = acet_state.get("examination", {})
        profile = acet_state.get("profile")
        context = acet_state.get("crs", {}).get("active_context")
        age = acet_state.get("identity", {}).get("age")

        for disease in self.diseases:
            score = 0.0
            rules = disease["rules"]
            required = rules.get("symptoms_required", [])
            if required and not all(sym in symptoms for sym in required):
                continue
            exam_required = rules.get("exam_required", [])
            for req in exam_required:
                val = self._get_nested(exam, req)
                if not val:
                    break
            else:
                for sym, weight in rules.get("symptoms_boost", {}).items():
                    if sym in symptoms:
                        score += weight
                for finding, weight in rules.get("exam_boost", {}).items():
                    if isinstance(weight, dict) and "eq" in weight:
                        actual = self._get_nested(exam, finding)
                        if actual == weight["eq"]:
                            score += weight.get("weight", 0.3)
                    elif isinstance(weight, dict) and "gt" in weight:
                        actual = self._get_nested(exam, finding)
                        if actual is not None:
                            try:
                                if float(actual) > weight["gt"]:
                                    score += weight.get("weight", 0.3)
                            except (ValueError, TypeError):
                                pass
                    else:
                        actual = self._get_nested(exam, finding)
                        if actual:
                            score += weight
                dem = rules.get("demographics", {})
                if "age_min" in dem and age is not None and age < dem["age_min"]:
                    score *= 0.2
                if "age_max" in dem and age is not None and age > dem["age_max"]:
                    score *= 0.2
                disease_contexts = rules.get("context", [])
                if disease_contexts and context not in disease_contexts:
                    score *= 0.5
                red_flags = rules.get("red_flags", [])
                for rf in red_flags:
                    if self._get_nested(exam, rf) or symptoms.get(rf):
                        score += 0.2
                if score > 0:
                    scores.append({
                        "name": disease["name"],
                        "score": round(score, 2),
                        "specialty": disease["specialty"],
                        "management": disease["management"]
                    })
        scores.sort(key=lambda x: x["score"], reverse=True)
        return scores

    def _get_nested(self, obj, path):
        parts = path.split(".")
        cur = obj
        for p in parts:
            if isinstance(cur, dict):
                cur = cur.get(p)
            else:
                return None
        return cur
