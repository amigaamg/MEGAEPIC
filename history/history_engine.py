import os
import json

class HistoryModule:
    def __init__(self, name, questions, storage_path):
        self.name = name
        self.questions = questions
        self.storage_path = storage_path
        self.answers = {}

    def is_complete(self):
        required = [q for q in self.questions if q.get("priority", 0) > 0]
        return all(q["id"] in self.answers for q in required)

    def unanswered_questions(self):
        available = []
        for q in self.questions:
            if q["id"] in self.answers:
                continue
            deps_met = all(dep in self.answers for dep in q.get("depends_on", []))
            if deps_met:
                available.append(q)
        available.sort(key=lambda x: x.get("priority", 0), reverse=True)
        return available

    def answer_question(self, qid, answer):
        self.answers[qid] = answer
        return self.answers


class HistoryEngine:
    def __init__(self, history_dir="history"):
        self.history_dir = history_dir
        self.core_modules = {}
        self.profile_modules = {}
        self._load_all_history()

    def _load_all_history(self):
        core_dir = os.path.join(self.history_dir, "core")
        if os.path.isdir(core_dir):
            for fn in os.listdir(core_dir):
                if not fn.endswith(".json"):
                    continue
                name = fn.replace(".json", "")
                path = os.path.join(core_dir, fn)
                try:
                    with open(path, 'r') as f:
                        data = json.load(f)
                    questions = data.get("questions", [])
                except (json.JSONDecodeError, Exception):
                    questions = []
                storage_path = f"history.core.{name}"
                self.core_modules[name] = HistoryModule(name, questions, storage_path)

        profile_dir = os.path.join(self.history_dir, "profile_specific")
        if os.path.isdir(profile_dir):
            for fn in os.listdir(profile_dir):
                if not fn.endswith(".json"):
                    continue
                name = fn.replace(".json", "")
                path = os.path.join(profile_dir, fn)
                try:
                    with open(path, 'r') as f:
                        data = json.load(f)
                    questions = data.get("questions", [])
                except (json.JSONDecodeError, Exception):
                    questions = []
                storage_path = f"history.profile.{name}"
                self.profile_modules[name] = HistoryModule(name, questions, storage_path)

    def get_modules_for_profile(self, profile):
        if profile == "child":
            relevant = ["birth_history", "developmental_history", "immunization_history", "feeding_history", "growth_history"]
        elif profile == "infant":
            relevant = ["birth_history", "developmental_history", "immunization_history", "feeding_history", "growth_history"]
        elif profile == "neonate":
            relevant = ["birth_history", "feeding_history"]
        elif profile == "adult":
            relevant = ["functional_status", "cognitive_status"]
        elif profile == "elderly":
            relevant = ["functional_status", "cognitive_status"]
        elif profile == "pregnancy":
            relevant = ["obstetric_history", "gynecologic_history"]
        elif profile == "adolescent":
            relevant = ["developmental_history", "immunization_history"]
        else:
            relevant = []
        return {name: mod for name, mod in self.profile_modules.items() if name in relevant}

    def get_all_core_modules(self):
        return dict(self.core_modules)

    def list_modules(self):
        return list(self.core_modules.keys()), list(self.profile_modules.keys())
