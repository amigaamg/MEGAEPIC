import os
import json
from symptoms.symptom_engine import SymptomModule

class SymptomLoader:
    def __init__(self, symptoms_dir="symptoms"):
        self.symptoms_dir = symptoms_dir
        self.modules = {}
        self._load_all_modules()

    def _load_all_modules(self):
        if not os.path.isdir(self.symptoms_dir):
            return
        for entry in os.listdir(self.symptoms_dir):
            module_dir = os.path.join(self.symptoms_dir, entry)
            if not os.path.isdir(module_dir):
                continue
            questions_path = os.path.join(module_dir, "questions.json")
            if not os.path.isfile(questions_path):
                continue
            with open(questions_path, 'r') as f:
                data = json.load(f)
            questions = data.get("questions", [])
            rules_path = os.path.join(module_dir, "rules.json")
            rules = None
            if os.path.isfile(rules_path):
                try:
                    with open(rules_path, 'r') as rf:
                        content = rf.read().strip()
                        if content:
                            rules = json.loads(content)
                except (json.JSONDecodeError, Exception):
                    rules = None
            self.modules[entry] = SymptomModule(entry, questions, rules)

    def get_module(self, symptom_name):
        return self.modules.get(symptom_name)

    def list_modules(self):
        return list(self.modules.keys())
