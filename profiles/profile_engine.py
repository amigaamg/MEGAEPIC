class ProfileEngine:
    """Determines patient profile (child/adult/pregnancy/etc.) from ACET state"""
    def __init__(self, profile_rules):
        self.profile_rules = profile_rules

    def evaluate(self, acet_state):
        """Return profile name or None if no rule matches"""
        for rule in self.profile_rules:
            if self._matches(rule["if"], acet_state):
                return rule["then"]["profile"]
        return None

    def _matches(self, condition, state):
        for key, expr in condition.items():
            value = self._get_nested(state, key)
            if isinstance(expr, dict):
                if "lt" in expr and not (value is not None and value < expr["lt"]):
                    return False
                if "gte" in expr and not (value is not None and value >= expr["gte"]):
                    return False
                if "eq" in expr and value != expr["eq"]:
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
