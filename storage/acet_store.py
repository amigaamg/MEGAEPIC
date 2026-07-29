import json
from copy import deepcopy

class ACETStore:
    """Single source of truth – patient clinical tree"""
    def __init__(self):
        self.state = {
            "identity": {},
            "profile": None,
            "timeline": [],
            "symptoms": {},
            "history": {},
            "examination": {},
            "differential": [],
            "crs": {
                "active_context": None,
                "active_modules": [],
                "next_question": None
            }
        }

    def update(self, path, value):
        """Update nested dict using dot notation, e.g., 'identity.age'"""
        parts = path.split(".")
        target = self.state
        for part in parts[:-1]:
            if part not in target:
                target[part] = {}
            target = target[part]
        target[parts[-1]] = value

    def get(self, path, default=None):
        parts = path.split(".")
        target = self.state
        for part in parts:
            if isinstance(target, dict) and part in target:
                target = target[part]
            else:
                return default
        return target

    def snapshot(self):
        return deepcopy(self.state)

    def load_from_snapshot(self, snapshot: dict):
        self.state = deepcopy(snapshot)

    def __repr__(self):
        return json.dumps(self.state, indent=2)
