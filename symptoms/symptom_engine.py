class SymptomModule:
    def __init__(self, symptom_name, questions, rules=None):
        self.symptom_name = symptom_name
        self.questions = questions
        self.rules = rules
        self.answers = {}

    def is_complete(self):
        required = [q for q in self.questions if q.get("priority", 0) > 0]
        return all(q["id"] in self.answers for q in required)

    def unanswered_questions(self, acet_state):
        available = []
        for q in self.questions:
            if q["id"] in self.answers:
                continue
            deps_met = all(dep in self.answers for dep in q.get("depends_on", []))
            if deps_met:
                available.append(q)
        available.sort(key=lambda x: x.get("priority", 0), reverse=True)
        return available

    def answer_question(self, qid, answer, acet_state):
        self.answers[qid] = answer
