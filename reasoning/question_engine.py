class QuestionEngine:
    """Selects the next best question across all active symptom modules"""
    def __init__(self):
        pass

    def get_next_question(self, acet_state, active_modules):
        candidates = []
        for module in active_modules:
            unanswered = module.unanswered_questions(acet_state)
            for q in unanswered:
                candidates.append({
                    "module": module.symptom_name,
                    "question_id": q["id"],
                    "question_text": q["text"],
                    "priority": q.get("priority", 0)
                })
        if not candidates:
            return None
        candidates.sort(key=lambda x: x["priority"], reverse=True)
        return candidates[0]
