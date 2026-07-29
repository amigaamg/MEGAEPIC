import json
import datetime
import uuid
from core.event_bus import EventBus
from storage.acet_store import ACETStore
from storage.database import Database
from rules.rule_engine import RuleEngine
from core.encounter_loop import EncounterLoop

DB = Database()

def load_rules(rules_path):
    with open(rules_path, 'r') as f:
        data = json.load(f)
    return data["profile_rules"], data["context_rules"]

def setup_encounter(encounter_id=None, patient_id=None, load_snapshot=None):
    bus = EventBus()
    acet = ACETStore()
    profile_rules, context_rules = load_rules("rules/rules.json")
    rule_engine = RuleEngine("rules/rules.json")
    loop = EncounterLoop(bus, acet, rule_engine, profile_rules, context_rules,
                         encounter_id=encounter_id, patient_id=patient_id)
    if load_snapshot:
        acet.load_from_snapshot(load_snapshot)
    return bus, acet, loop

def subscribe_handlers(bus, acet, loop):
    def print_state(event, data):
        print("\n" + "="*50)
        enc_id = acet.get("encounter_id", loop.encounter_id)
        pat_id = acet.get("patient_id", loop.patient_id)
        print(f"  Encounter: {enc_id[:8]}... | Patient: {pat_id[:8]}...")
        print(f"  Profile: {acet.get('profile')}")
        print(f"  Context: {acet.get('crs.active_context')} (conf: {acet.get('crs.context_confidence')})")
        complete = acet.get("crs.encounter_complete")
        print(f"  Encounter complete: {complete}")

        safety_over = acet.get("crs.safety_override_active")
        if safety_over:
            print(f"\n  SAFETY OVERRIDE ACTIVE")
            print(f"     Context: {acet.get('crs.safety_override_context')}")
            print(f"     Alert: {acet.get('crs.safety_alert_message')}")
        else:
            alerts = acet.get("crs.current_alerts")
            if alerts:
                print(f"\n  SAFETY ALERTS ({len(alerts)}):")
                for a in alerts[:3]:
                    print(f"     - {a['name']} ({a['level']})")

        if complete:
            diffs = acet.get("differential")
            if diffs:
                print("\n  DIFFERENTIAL DIAGNOSES:")
                for i, d in enumerate(diffs[:5], 1):
                    print(f"    {i}. {d['name']} (score: {d['score']}")
            mgmt = acet.get("management")
            if mgmt:
                print("\n  MANAGEMENT PLAN:")
                for key, items in mgmt.items():
                    if items:
                        val = ', '.join(items) if isinstance(items, list) else items
                        print(f"    {key.upper()}: {val}")
        else:
            print(f"  Active symptom modules: {acet.get('crs.active_symptom_modules')}")
            print(f"  History complete: {loop.history_complete}")
            print(f"  Exam active: {loop.exam_active}")
            print(f"  Timeline: {loop.timeline.get_progression()}")
            if not loop.history_complete:
                print(f"\n  Next question: {acet.get('crs.next_question')}")
            elif loop.exam_active:
                nf = acet.get("crs.next_exam_finding")
                if nf:
                    opts = nf.get("options")
                    opt_str = f"  Options: {', '.join(opts)}" if opts else ""
                    print(f"\n  Next exam finding: {nf.get('text')}")
                    if opt_str:
                        print(opt_str)
            else:
                inv = acet.get("investigations.suggested")
                if inv:
                    print("\n  Suggested investigations:")
                    for i in inv[:6]:
                        print(f"    - {i['name']} ({i.get('reason', '')})")
                print(f"\n  Status: {acet.get('crs.next_question')}")
        print("="*50 + "\n")

    def on_safety_alerts(event, data):
        for a in data["alerts"]:
            print(f"  [{a['level'].upper()}] {a['name']}")
            print(f"    {a['message']}")
            print(f"    Action: {a['action']}")
            print("")

    def on_safety_override(event, data):
        print(f"  SAFETY OVERRIDE")
        print(f"  Context changed to: {data['context']}")
        print(f"  Alert: {data['message']}")
        print(f"  Action: {data['action']}")
        print("")

    bus.subscribe("symptom", print_state)
    bus.subscribe("answer", print_state)
    bus.subscribe("exam_finding", print_state)
    bus.subscribe("set_age", print_state)
    bus.subscribe("next_question", lambda e, d: None)
    bus.subscribe("exam_question", lambda e, d: None)
    bus.subscribe("exam_alert", lambda e, d: print(f"\n  EXAM ALERT: {d['alert']}\n"))
    bus.subscribe("encounter_complete", lambda e, d: print(f"\n>>> {d['message']} <<<\n"))
    bus.subscribe("safety_alerts", on_safety_alerts)
    bus.subscribe("safety_override", on_safety_override)
    bus.subscribe("documents_ready", lambda e, d: print(f"\n  {d['message']}\n"))

def show_patients():
    patients = DB.list_patients()
    if not patients:
        print("No patients found.")
        return
    print(f"\n{'ID':<12} {'Name':<20} {'Age':<5} {'Sex':<6} {'Created':<20}")
    print("-"*63)
    for p in patients:
        print(f"{p['patient_id'][:10]:<12} {p['name']:<20} {p['age']:<5} {p['sex']:<6} {str(p.get('created_at',''))[:19]:<20}")

def show_encounters(patient_id=None):
    encs = DB.list_encounters(patient_id) if patient_id else DB.list_encounters()
    if not encs:
        print("No encounters found.")
        return
    print(f"\n{'ID':<12} {'Patient':<12} {'Start':<20} {'Context':<20} {'Complete':<8}")
    print("-"*72)
    for e in encs:
        cid = e['encounter_id'][:8]
        pid = e['patient_id'][:8]
        print(f"{cid:<12} {pid:<12} {str(e.get('start_time',''))[:19]:<20} {str(e.get('context',''))[:19]:<20} {e['is_complete']:<8}")

def main():
    current_patient_id = None
    bus, acet, loop = setup_encounter()

    def print_help():
        print("Commands:")
        print("  patient list                    List all patients")
        print("  patient new <name> <age> <sex>  Create new patient")
        print("  patient select <id>             Select current patient")
        print("  encounter list [patient_id]     List encounters")
        print("  encounter new                   Start new encounter")
        print("  encounter load <encounter_id>   Load previous encounter")
        print("  age: <number>")
        print("  symptom: <symptom>")
        print("  answer: <module>|<qid>|<value>")
        print("  exam: <module>|<finding>|<value>")
        print("  header: <field>|<value>")
        print("  note list|show|edit|pdf")
        print("  save                            Save ACET snapshot")
        print("  export                          Export ACET as JSON")
        print("  seed profile [name]             Seed database with developer data")
        print("  seed users                      List seeded users")
        print("  seed stats                      Show seed statistics")
        print("  seed profiles                   List available profiles")
        print("  help                            This help")
        print("  quit")

    subscribe_handlers(bus, acet, loop)

    print("AMEXAN Phase 7 - Storage & Multi-Patient Management")
    print_help()
    print()

    while True:
        try:
            cmd = input("> ").strip()
        except EOFError:
            break
        if not cmd:
            continue
        if cmd == "quit":
            break
        if cmd == "help":
            print_help()
            continue

        # ── seed command ──
        if cmd.startswith("seed"):
            parts = cmd.split()
            if len(parts) < 2:
                print("Usage: seed profile [name] | users | stats | profiles")
                continue
            sub = parts[1]
            if sub == "profile":
                profile = parts[2] if len(parts) > 2 else "developer"
                from seed_engine import run_seed
                run_seed(profile)
            elif sub == "users":
                from seed_engine import list_users
                list_users()
            elif sub == "stats":
                from seed_engine import show_stats
                show_stats()
            elif sub == "profiles":
                from seed_engine import list_profiles
                list_profiles()
            else:
                print("Unknown seed subcommand.")
            continue

        # ── patient commands ──
        if cmd.startswith("patient"):
            parts = cmd.split()
            if len(parts) < 2:
                print("Usage: patient list | new <name> <age> <sex> | select <id>")
                continue
            sub = parts[1]
            if sub == "list":
                show_patients()
            elif sub == "new":
                # Format: patient new <name> <age> <sex>
                # Name can have multiple words; age is the second-to-last token
                if len(parts) < 5:
                    print("Usage: patient new <name> <age> <sex>")
                    continue
                try:
                    age = int(parts[-2])
                    sex = parts[-1]
                    name = " ".join(parts[2:-2])
                except (ValueError, IndexError):
                    print("Usage: patient new <name> <age> <sex>")
                    continue
                if not name:
                    print("Name cannot be empty.")
                    continue
                pid = str(uuid.uuid4())
                DB.save_patient(pid, name, age, sex)
                current_patient_id = pid
                print(f"Patient '{name}' created with ID: {pid[:8]}...")
            elif sub == "select":
                if len(parts) < 3:
                    print("Usage: patient select <id>")
                    continue
                sel_id = parts[2]
                pat = DB.get_patient(sel_id)
                if not pat:
                    print(f"Patient '{sel_id}' not found.")
                    continue
                current_patient_id = pat["patient_id"]
                print(f"Selected patient: {pat['name']} ({pat['age']}y/{pat['sex']})")
            else:
                print("Unknown patient command.")

        # ── encounter commands ──
        elif cmd.startswith("encounter"):
            parts = cmd.split()
            if len(parts) < 2:
                print("Usage: encounter list [patient_id] | new | load <id>")
                continue
            sub = parts[1]
            if sub == "list":
                if len(parts) >= 3:
                    show_encounters(parts[2])
                else:
                    show_encounters(current_patient_id)
            elif sub == "new":
                bus, acet, loop = setup_encounter(patient_id=current_patient_id)
                subscribe_handlers(bus, acet, loop)
                print(f"New encounter started (ID: {loop.encounter_id[:8]}...)")
            elif sub == "load":
                if len(parts) < 3:
                    print("Usage: encounter load <encounter_id>")
                    continue
                enc_id = parts[2]
                enc = DB.get_encounter(enc_id)
                if not enc:
                    print(f"Encounter '{enc_id}' not found.")
                    continue
                snap = DB.get_latest_snapshot(enc_id)
                if snap:
                    bus, acet, loop = setup_encounter(
                        encounter_id=enc_id,
                        patient_id=enc["patient_id"],
                        load_snapshot=snap
                    )
                    subscribe_handlers(bus, acet, loop)
                    print(f"Loaded encounter {enc_id[:8]}... from {enc.get('start_time','?')[:19]}")
                else:
                    print("No snapshot found for this encounter.")
            else:
                print("Unknown encounter command.")

        # ── encounter workflow commands ──
        elif cmd.startswith("age:"):
            try:
                age = int(cmd.split(":", 1)[1].strip())
                bus.publish("set_age", {"value": age})
            except ValueError:
                print("Age must be a number.")
        elif cmd.startswith("symptom:"):
            sym = cmd.split(":", 1)[1].strip().lower()
            bus.publish("symptom", {"name": sym})
        elif cmd.startswith("answer:"):
            parts = cmd.split(":", 1)[1].strip().split("|")
            if len(parts) == 3:
                module, qid, ans = parts
                bus.publish("answer", {"module": module, "question_id": qid, "answer": ans})
            else:
                print("Format: answer: module|question_id|answer")
        elif cmd.startswith("exam:"):
            parts = cmd.split(":", 1)[1].strip().split("|")
            if len(parts) == 3:
                module, finding_id, value = parts
                bus.publish("exam_finding", {"module": module, "finding_id": finding_id, "value": value})
            else:
                print("Format: exam: module|finding_id|value")
        elif cmd.startswith("header:"):
            parts = cmd.split(":", 1)[1].strip().split("|")
            if len(parts) == 2:
                field, value = parts
                if field in ("name", "age", "sex", "patient_id"):
                    acet.update(f"identity.{field}", value)
                    print(f"Set {field} to {value}")
                else:
                    print("Fields: name, age, sex, patient_id")
            else:
                print("Format: header: field|value")

        # ── note commands ──
        elif cmd.startswith("note"):
            parts = cmd.split()
            if len(parts) < 2:
                print("Usage: note list | show <type> | edit <type> | pdf <type>")
                continue
            sub = parts[1]
            if sub == "list":
                print("Available note types: hp_note, soap_note, discharge_summary, referral_letter, clinic_note")
            elif sub == "show":
                if len(parts) < 3:
                    print("Specify note type")
                    continue
                note_type = parts[2]
                note_text = acet.get(f"documents.{note_type}")
                if note_text:
                    print(f"\n--- {note_type} ---\n{note_text}\n")
                else:
                    print(f"Note '{note_type}' not found. Complete an encounter first.")
            elif sub == "edit":
                if len(parts) < 3:
                    print("Specify note type")
                    continue
                note_type = parts[2]
                current = acet.get(f"documents.{note_type}")
                if current is None:
                    print("Note not found.")
                    continue
                print("Enter new text (end with a line containing only 'END'):")
                lines = []
                while True:
                    try:
                        line = input()
                    except EOFError:
                        break
                    if line.strip() == "END":
                        break
                    lines.append(line)
                new_text = "\n".join(lines)
                acet.update(f"documents.{note_type}", new_text)
                print(f"Updated {note_type}.")
            elif sub == "pdf":
                if len(parts) < 3:
                    print("Specify note type")
                    continue
                note_type = parts[2]
                note_text = acet.get(f"documents.{note_type}")
                if not note_text:
                    print("Note not found.")
                    continue
                from pdf_exporter import PDFExporter
                pdf_name = f"{note_type}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
                exporter = PDFExporter(pdf_name)
                exporter.export_text(note_text, title=note_type.replace('_', ' ').title())
                print(f"PDF saved as {pdf_name}")
            else:
                print("Usage: note list | show <type> | edit <type> | pdf <type>")

        # ── save / export ──
        elif cmd == "save":
            loop.save_current_snapshot()
            print("Snapshot saved.")
        elif cmd == "export":
            print(json.dumps(acet.snapshot(), indent=2))
        else:
            # Try passing to loop as header set if it starts with known field
            if ':' in cmd and not cmd.startswith(("age:", "symptom:", "answer:", "exam:", "header:", "note")):
                pass
            elif cmd.strip():
                print("Unknown command. Type 'help' for available commands.")

if __name__ == "__main__":
    main()
