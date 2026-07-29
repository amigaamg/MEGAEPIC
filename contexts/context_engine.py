class ContextEngine:
    """Detects clinical context from symptoms and other ACET data"""
    def __init__(self, context_rules):
        self.context_rules = context_rules

    def evaluate(self, acet_state):
        """Return list of possible contexts with confidence, sorted by confidence"""
        candidates = []
        symptoms = set(acet_state.get("symptoms", {}).keys())
        for rule in self.context_rules:
            required = set(rule["if"].get("symptoms", []))
            if required.issubset(symptoms):
                candidates.append({
                    "context": rule["then"]["context"],
                    "confidence": rule["then"].get("confidence", 0.5)
                })
        candidates.sort(key=lambda x: x["confidence"], reverse=True)
        return candidates
