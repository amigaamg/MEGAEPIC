from core.event_bus import EventBus
from storage.acet_store import ACETStore
from rules.rule_engine import RuleEngine
from profiles.profile_engine import ProfileEngine
from contexts.context_engine import ContextEngine
from symptom_loader import SymptomLoader
from history.history_engine import HistoryEngine
from reasoning.question_engine import QuestionEngine
from core.timeline_builder import TimelineBuilder
from examination.examination_engine import EXAM_MODULES, CONTEXT_EXAM_MAP
from reasoning.investigation_engine import InvestigationEngine
from reasoning.differential_engine import DifferentialEngine
from reasoning.management_engine import ManagementEngine
from safety_engine import SafetyEngine
from storage.database import Database
import uuid
from datetime import datetime

SYMPTOM_NAME_MAP = {
    "abdominal pain": "pain",
    "chest pain": "pain",
    "chest_pain": "pain",
    "back pain": "pain",
}

class EncounterLoop:
    def __init__(self, event_bus, acet_store, rule_engine, profile_rules, context_rules,
                 encounter_id=None, patient_id=None, user_id=None):
        self.bus = event_bus
        self.acet = acet_store
        self.rules = rule_engine
        self.user_id = user_id
        self._processing = False
        self.profile_engine = ProfileEngine(profile_rules)
        self.context_engine = ContextEngine(context_rules)
        self.question_engine = QuestionEngine()
        self.timeline = TimelineBuilder()
        self.symptom_loader = SymptomLoader("symptoms")
        self.history_engine = HistoryEngine("history")
        self.active_modules = {}
        self.history_modules = {}
        self.exam_modules = {}
        self.investigation_engine = InvestigationEngine()
        self.diff_engine = DifferentialEngine()
        self.mgmt_engine = ManagementEngine()
        self.safety_engine = SafetyEngine("safety_rules.json")
        self.safety_override_active = False
        self.current_alerts = []
        self.phase = "symptoms"
        self.exam_active = False

        self.db = Database()
        self.encounter_id = encounter_id or str(uuid.uuid4())
        self.patient_id = patient_id or str(uuid.uuid4())
        self.acet.update("encounter_id", self.encounter_id)
        self.acet.update("patient_id", self.patient_id)
        if user_id:
            self.acet.update("user_id", user_id)

        self.bus.subscribe("symptom", self.on_symptom)
        self.bus.subscribe("answer", self.on_answer)
        self.bus.subscribe("set_age", self.on_age_set)
        self.bus.subscribe("set_profile", self.on_profile_set)
        self.bus.subscribe("activate_context", self.on_context_activate)
        self.bus.subscribe("exam_finding", self.on_exam_finding)

        self.db.save_encounter(
            self.encounter_id, self.patient_id,
            datetime.now().isoformat(),
            user_id=self.user_id
        )

    def on_symptom(self, event_type, data):
        raw_symptom = data["name"].lower()
        module_key = SYMPTOM_NAME_MAP.get(raw_symptom, raw_symptom)
        self.timeline.add_event("symptom", {"name": raw_symptom})
        self.acet.update(f"symptom_present.{raw_symptom}", True)
        module = self.symptom_loader.get_module(module_key)
        if module and module_key not in self.active_modules:
            self.active_modules[module_key] = module
            self.acet.update(f"active_modules.{module_key}", True)
        self._auto_save_event("symptom", {"name": raw_symptom})
        self._update_context()
        self._run_safety_check()
        if self.phase == "symptoms":
            self._generate_next_question()

    def on_answer(self, event_type, data):
        qid = data["question_id"]
        answer = data["answer"]
        module_name = data.get("module")
        if self.phase == "history" and module_name in self.history_modules:
            mod = self.history_modules[module_name]
            mod.answer_question(qid, answer)
            self.acet.update(f"{mod.storage_path}.{qid}", answer)
        elif self.phase == "symptoms" and module_name in self.active_modules:
            mod = self.active_modules[module_name]
            mod.answer_question(qid, answer, self.acet.snapshot())
            self.acet.update(f"symptoms.{module_name}.{qid}", answer)
        else:
            return
        self.timeline.add_event("answer", {"question_id": qid, "answer": answer})
        self._update_context()
        self._process_rules()
        self._run_safety_check()
        self._generate_next_question()
        self._auto_save_event("answer", {"question_id": qid, "answer": answer, "module": module_name})

    def on_age_set(self, event_type, data):
        age = data["value"]
        self.acet.update("identity.age", age)
        self._update_profile()
        self._update_context()
        self._process_rules()
        self._generate_next_question()
        self._auto_save_event("set_age", {"value": age})
        self._run_safety_check()

    def on_profile_set(self, event_type, data):
        self.acet.update("profile", data["value"])

    def on_context_activate(self, event_type, data):
        self.acet.update("crs.active_context", data["value"])

    def on_exam_finding(self, event_type, data):
        if not self.exam_active:
            self.bus.publish("encounter_complete", {"message": "Exam not active - complete history first."})
            return
        module_name = data["module"]
        finding_id = data["finding_id"]
        value = data["value"]
        if module_name in self.exam_modules:
            alert = self.exam_modules[module_name].record_finding(finding_id, value)
            self.acet.update(f"examination.{module_name}.{finding_id}", value)
            if alert:
                self.bus.publish("exam_alert", {"alert": alert, "module": module_name, "finding": finding_id})
        self._auto_save_event("exam_finding", {"module": module_name, "finding_id": finding_id, "value": value})
        self._run_safety_check()
        self._ask_next_exam_finding()

    def _run_safety_check(self):
        state = self.acet.snapshot()
        alerts = self.safety_engine.evaluate(state)
        self.current_alerts = alerts
        self.acet.update("crs.current_alerts", alerts)
        if alerts:
            self.bus.publish("safety_alerts", {"alerts": alerts})
            critical = [a for a in alerts if a["level"] == "critical"]
            if critical and not self.safety_override_active:
                override_ctx = critical[0]["override_context"]
                if override_ctx:
                    self.acet.update("crs.safety_override_active", True)
                    self.acet.update("crs.safety_override_context", override_ctx)
                    self.acet.update("crs.safety_alert_message", critical[0]["message"])
                    self.safety_override_active = True
                    self.acet.update("crs.active_context", override_ctx)
                    self.bus.publish("safety_override", {
                        "context": override_ctx,
                        "message": critical[0]["message"],
                        "action": critical[0]["action"]
                    })

    def _update_profile(self):
        state = self.acet.snapshot()
        profile = self.profile_engine.evaluate(state)
        if profile and profile != self.acet.get("profile"):
            self.acet.update("profile", profile)
            self.bus.publish("set_profile", {"value": profile})

    def _update_context(self):
        state = self.acet.snapshot()
        contexts = self.context_engine.evaluate(state)
        if contexts:
            best = contexts[0]
            current = self.acet.get("crs.active_context")
            if best["context"] != current:
                self.acet.update("crs.active_context", best["context"])
                self.acet.update("crs.context_confidence", best["confidence"])
                self.bus.publish("activate_context", {"value": best["context"]})

    def _process_rules(self):
        if self._processing:
            return
        self._processing = True
        try:
            actions = self.rules.evaluate(self.acet.snapshot())
            for action in actions:
                self.bus.publish(action["action"], action)
        finally:
            self._processing = False

    def _publish_question(self, question_text, module=None, qid=None):
        if question_text is None:
            self.acet.update("crs.next_question", "Awaiting symptoms...")
            self.bus.publish("next_question", {"question": "Awaiting symptoms..."})
            return
        self.acet.update("crs.next_question", question_text)
        if module:
            self.acet.update("crs.next_question_module", module)
        if qid:
            self.acet.update("crs.next_question_id", qid)
        self.bus.publish("next_question", {"question": question_text, "module": module, "qid": qid})

    def _generate_next_question(self):
        if self.phase == "symptoms":
            if self.active_modules:
                all_complete = all(m.is_complete() for m in self.active_modules.values())
                if all_complete:
                    self.phase = "history"
                    self.bus.publish("history_complete", {"phase": "symptoms"})
                    self._activate_history_modules()
                    self._generate_next_question()
                    return
                active_instances = list(self.active_modules.values())
                next_q = self.question_engine.get_next_question(self.acet.snapshot(), active_instances)
                if next_q:
                    self._publish_question(next_q["question_text"], next_q["module"], next_q["question_id"])
                    return
            self._publish_question("Please enter a symptom (e.g., pain, cough, fever).")
            return

        if self.phase == "history":
            if self.history_modules:
                all_complete = all(m.is_complete() for m in self.history_modules.values())
                if all_complete:
                    self.phase = "exam"
                    self.bus.publish("history_complete", {"phase": "history"})
                    self._activate_exam_modules()
                    self._generate_next_question()
                    return
                for mod_name, mod in self.history_modules.items():
                    unanswered = mod.unanswered_questions()
                    if unanswered:
                        q = unanswered[0]
                        self._publish_question(q["text"], mod_name, q["id"])
                        return
            self.phase = "exam"
            self._activate_exam_modules()
            self._generate_next_question()
            return

        if self.phase == "exam":
            if self.exam_active:
                self._ask_next_exam_finding()
            else:
                self._finalize_encounter()

    def _activate_history_modules(self):
        profile = self.acet.get("profile")
        core = self.history_engine.get_all_core_modules()
        self.history_modules.update(core)
        profile_modules = self.history_engine.get_modules_for_profile(profile)
        self.history_modules.update(profile_modules)
        self.acet.update("crs.active_history_modules", list(self.history_modules.keys()))
        self.bus.publish("history_started", {"modules": list(self.history_modules.keys())})

    def _activate_exam_modules(self):
        context = self.acet.get("crs.active_context")
        exam_names = CONTEXT_EXAM_MAP.get(context, ["general"])
        for name in exam_names:
            if name in EXAM_MODULES and name not in self.exam_modules:
                module_class = EXAM_MODULES[name]
                mod = module_class()
                self.exam_modules[mod.name] = mod
                self.acet.update(f"examination.{mod.name}_active", True)
        self.exam_active = True
        self.bus.publish("exam_started", {"modules": list(self.exam_modules.keys())})

    def _ask_next_exam_finding(self):
        for mod_name, mod in self.exam_modules.items():
            unanswered = mod.get_unanswered_findings()
            if unanswered:
                f = unanswered[0]
                self.acet.update("crs.next_exam_finding", f)
                self.bus.publish("exam_question", {
                    "module": mod_name,
                    "finding_id": f["id"],
                    "question_text": f["text"],
                    "type": f.get("type", "text"),
                    "options": f.get("options")
                })
                return
        self.exam_active = False
        self._suggest_investigations()
        self._finalize_encounter()

    def _suggest_investigations(self):
        state = self.acet.snapshot()
        context = self.acet.get("crs.active_context")
        suggestions = self.investigation_engine.get_suggestions(state, context)
        self.acet.update("investigations.suggested", suggestions)
        self.bus.publish("investigations_ready", {"suggestions": suggestions})

    def _generate_differentials(self):
        state = self.acet.snapshot()
        diffs = self.diff_engine.evaluate(state)
        self.acet.update("differential", diffs)
        self.bus.publish("differential_ready", {"differentials": diffs})
        return diffs

    def _generate_management(self, top_diagnoses):
        state = self.acet.snapshot()
        plan = self.mgmt_engine.get_management(state, top_diagnoses)
        self.acet.update("management", plan)
        self.bus.publish("management_ready", {"plan": plan})
        return plan

    def _finalize_encounter(self):
        diffs = self._generate_differentials()
        if diffs:
            self._generate_management(diffs)
        inv = self.acet.get("investigations.suggested", [])
        self.acet.update("crs.encounter_complete", True)
        self.acet.update("timeline", self.timeline.get_sequence())
        self._generate_documents()
        self.save_current_snapshot()
        self.db.save_encounter(
            self.encounter_id, self.patient_id,
            start_time=None,
            end_time=datetime.now().isoformat(),
            profile=self.acet.get("profile"),
            context=self.acet.get("crs.active_context"),
            is_complete=True,
            user_id=self.user_id
        )
        parts = ["History and examination complete."]
        if diffs:
            parts.append(f"Top: {diffs[0]['name']}")
        if inv:
            names = [i["name"] for i in inv[:3]]
            parts.append(f"Inv: {', '.join(names)}")
        msg = " | ".join(parts)
        self.acet.update("crs.next_question", msg)
        self.bus.publish("encounter_complete", {"message": msg, "differentials": diffs, "management": self.acet.get("management")})

    def _generate_documents(self):
        from documentation_engine import DocumentationEngine
        doc_engine = DocumentationEngine()
        state = self.acet.snapshot()
        self.acet.update("documents.hp_note", doc_engine.generate_hp_note(state))
        self.acet.update("documents.soap_note", doc_engine.generate_soap_note(state))
        self.acet.update("documents.discharge_summary", doc_engine.generate_discharge_summary(state))
        self.acet.update("documents.referral_letter", doc_engine.generate_referral_letter(state))
        self.bus.publish("documents_ready", {"message": "Documents generated. Use 'note' commands to view/edit/export."})

    def _auto_save_event(self, event_type, data):
        self.db.log_event(self.encounter_id, event_type, data)

    def save_current_snapshot(self):
        snapshot = self.acet.snapshot()
        self.db.save_snapshot(self.encounter_id, snapshot)

    def _now(self):
        import time
        return time.time()
