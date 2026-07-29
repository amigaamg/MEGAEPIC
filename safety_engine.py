import json

class SafetyEngine:
    def __init__(self, rules_path="safety_rules.json"):
        with open(rules_path, 'r') as f:
            data = json.load(f)
        self.rules = data["rules"]

    def evaluate(self, acet_state):
        alerts = []
        for rule in self.rules:
            if self._rule_matches(rule["conditions"], acet_state):
                alerts.append({
                    "name": rule["name"],
                    "level": rule["level"],
                    "override_context": rule.get("override_context"),
                    "message": rule["message"],
                    "action": rule["action"]
                })
        severity_order = {"critical": 0, "high": 1, "moderate": 2}
        alerts.sort(key=lambda x: severity_order.get(x["level"], 3))
        return alerts

    def _rule_matches(self, condition_group, state):
        if "any" in condition_group:
            return any(self._rule_matches(sub, state) for sub in condition_group["any"])
        if "all" in condition_group:
            return all(self._rule_matches(sub, state) for sub in condition_group["all"])
        path = condition_group.get("path")
        op = condition_group.get("operator")
        val = condition_group.get("value")
        if not path or not op:
            return False
        actual = self._get_nested(state, path)
        return self._compare(actual, op, val)

    def _get_nested(self, state, path):
        parts = path.split(".")
        cur = state
        for p in parts:
            if isinstance(cur, dict):
                cur = cur.get(p)
            else:
                return None
        return cur

    def _compare(self, actual, operator, value):
        if actual is None:
            return False
        if operator == "eq":
            return actual == value
        if operator == "lt":
            try:
                return float(actual) < float(value)
            except (ValueError, TypeError):
                return False
        if operator == "gt":
            try:
                return float(actual) > float(value)
            except (ValueError, TypeError):
                return False
        if operator == "le":
            try:
                return float(actual) <= float(value)
            except (ValueError, TypeError):
                return False
        if operator == "ge":
            try:
                return float(actual) >= float(value)
            except (ValueError, TypeError):
                return False
        if operator == "in":
            if isinstance(value, list):
                return actual in value
            return False
        return False
