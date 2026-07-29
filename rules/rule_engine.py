import json

class RuleEngine:
    def __init__(self, rules_path):
        with open(rules_path, 'r') as f:
            self.rules = json.load(f)["rules"]

    def evaluate(self, acet_state):
        """Return list of actions for rules that match current state"""
        actions = []
        for rule in self.rules:
            if self._matches(rule["if"], acet_state):
                actions.append(rule["then"])
        return actions

    def _matches(self, condition, state):
        """Support simple equality, comparisons, and 'contains' on lists"""
        for key, expr in condition.items():
            if "." in key:
                value = self._get_nested(state, key)
            else:
                value = state.get(key)

            if isinstance(expr, dict):
                if "lt" in expr:
                    if not (value is not None and value < expr["lt"]):
                        return False
                elif "lte" in expr:
                    if not (value is not None and value <= expr["lte"]):
                        return False
                elif "gt" in expr:
                    if not (value is not None and value > expr["gt"]):
                        return False
                elif "gte" in expr:
                    if not (value is not None and value >= expr["gte"]):
                        return False
                elif "contains" in expr:
                    if isinstance(value, list):
                        if expr["contains"] not in value:
                            return False
                    elif isinstance(value, dict):
                        if expr["contains"] not in value:
                            return False
                    else:
                        return False
                else:
                    return False
            else:
                if value != expr:
                    return False
        return True

    def _get_nested(self, state, path):
        parts = path.split(".")
        cur = state
        for p in parts:
            if isinstance(cur, dict) and p in cur:
                cur = cur[p]
            else:
                return None
        return cur
