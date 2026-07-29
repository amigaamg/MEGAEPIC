import asyncio
import json
import uuid
import shutil
import hashlib
from pathlib import Path
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, Header, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta

from core.event_bus import EventBus
from storage.acet_store import ACETStore
from rules.rule_engine import RuleEngine
from reasoning.differential_engine import DifferentialEngine
from safety_engine import SafetyEngine
from core.encounter_loop import EncounterLoop
from storage.database import Database
from documentation_engine import DocumentationEngine
from pdf_exporter import PDFExporter
from auth import hash_password, verify_password, create_jwt, decode_jwt

app = FastAPI(title="AMEXAN Clinical OS")

app.mount("/static", StaticFiles(directory="static"), name="static")

db = Database()

# ── Rule file paths ──
RULES_FILES = {
    "rules": Path("rules/rules.json"),
    "diseases": Path("knowledge/diseases.json"),
    "safety": Path("safety_rules.json"),
}

# ── Global engine references (reloadable) ──
rule_engine = None
diff_engine = None
safety_engine = None
profile_rules = []
context_rules = []

def init_engines():
    global rule_engine, diff_engine, safety_engine, profile_rules, context_rules
    with open("rules/rules.json", 'r') as f:
        data = json.load(f)
    profile_rules = data.get("profile_rules", [])
    context_rules = data.get("context_rules", [])
    rule_engine = RuleEngine("rules/rules.json")
    diff_engine = DifferentialEngine("knowledge/diseases.json")
    safety_engine = SafetyEngine("safety_rules.json")

init_engines()


class SessionManager:
    def __init__(self):
        self.sessions: Dict[str, EncounterLoop] = {}
        self.ws_to_session: Dict[WebSocket, str] = {}

    def create_session(self, patient_id: str, user_id: str = None) -> str:
        session_id = str(uuid.uuid4())
        acet = ACETStore()
        patient = db.get_patient(patient_id)
        if patient:
            acet.update("identity.name", patient["name"])
            acet.update("identity.age", patient["age"])
            acet.update("identity.sex", patient["sex"])
            acet.update("identity.patient_id", patient_id)
        loop = EncounterLoop(
            event_bus=EventBus(),
            acet_store=acet,
            rule_engine=rule_engine,
            profile_rules=profile_rules,
            context_rules=context_rules,
            encounter_id=str(uuid.uuid4()),
            patient_id=patient_id,
            user_id=user_id
        )
        self.sessions[session_id] = loop
        return session_id

    def get_loop(self, session_id: str) -> Optional[EncounterLoop]:
        return self.sessions.get(session_id)

    def register_ws(self, session_id: str, websocket: WebSocket):
        self.ws_to_session[websocket] = session_id

    def remove_ws(self, websocket: WebSocket):
        self.ws_to_session.pop(websocket, None)


session_manager = SessionManager()


def forward_event(websocket: WebSocket, loop: EncounterLoop):
    def handler(event_type, data):
        asyncio.create_task(websocket.send_json({
            "type": event_type,
            "data": data
        }))

    for evt in ["next_question", "exam_question", "safety_alerts",
                "safety_override", "encounter_complete", "context_changed",
                "profile_changed", "exam_alert", "documents_ready",
                "investigations_ready", "differential_ready", "management_ready"]:
        loop.bus.subscribe(evt, handler)


# ── Auth dependency ──

async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = authorization.split(" ")[1]
    payload = decode_jwt(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.get_user_by_id(payload["user_id"])
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ── Pydantic models ──

class NewPatientRequest(BaseModel):
    name: str
    age: int
    sex: str

class RegisterRequest(BaseModel):
    username: str
    password: str
    role: str = "doctor"
    email: Optional[str] = None
    phone: Optional[str] = None
    display_name: Optional[str] = None
    facility_id: Optional[str] = None
    license_number: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class RuleUpdateRequest(BaseModel):
    content: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class VerifyUserRequest(BaseModel):
    verification_status: str

class SeedRequest(BaseModel):
    profile: str = "developer"


# ── Helper: backup before write ──

def backup_file(filepath: Path):
    backup_path = filepath.with_suffix(f".bak_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
    shutil.copy(str(filepath), str(backup_path))
    return backup_path.name


# ── Auth endpoints ──

@app.post("/api/register")
def register(req: RegisterRequest):
    existing = db.find_user_by_username(req.username)
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    if req.email and db.user_exists_by_email(req.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    verification = "pending_email" if not req.license_number else "identity_pending"
    if req.email and req.email.endswith("@amexan.dev"):
        verification = "super_verified"

    display_name = req.display_name or req.username
    user_id = db.create_user(
        username=req.username,
        password=req.password,
        role=req.role,
        email=req.email,
        phone=req.phone,
        display_name=display_name,
        verification_status=verification,
        facility_id=req.facility_id,
    )

    if req.license_number:
        from seed_engine import deterministic_id
        db.create_license(
            license_id=deterministic_id(f"lic-{user_id}"),
            user_id=user_id,
            license_number=req.license_number,
            license_type="full_practice",
            status="pending",
        )

    return {
        "message": "User created",
        "user_id": user_id,
        "verification_status": verification,
        "note": "Check email to verify account" if verification == "pending_email" else None
    }


@app.post("/api/login")
def login(req: LoginRequest):
    user = db.find_user_by_username(req.username)
    if not user:
        user = db.find_user_by_email(req.username)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    facility_id = user.get("facility_id")
    org_id = None
    if facility_id:
        fac = db.get_facility(facility_id)
        if fac:
            org_id = fac.get("org_id")

    token = create_jwt(
        user_id=user["user_id"],
        username=user["username"],
        role=user["role"],
        verification_status=user.get("verification_status", "pending_email"),
        facility_id=facility_id,
        org_id=org_id,
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "user_id": user["user_id"],
            "username": user["username"],
            "role": user["role"],
            "display_name": user.get("display_name"),
            "email": user.get("email"),
            "phone": user.get("phone"),
            "verification_status": user.get("verification_status", "pending_email"),
            "facility_id": facility_id,
            "org_id": org_id,
        }
    }


# ── Password Recovery Endpoints ──

@app.post("/api/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    user = db.find_user_by_email(req.email)
    if not user:
        return {"message": "If the email exists, a reset link has been sent"}

    reset_token = str(uuid.uuid4())
    token_hash = hashlib.sha256(reset_token.encode()).hexdigest()
    expires_at = (datetime.utcnow() + timedelta(hours=1)).isoformat()

    db.create_password_reset(user["user_id"], token_hash, expires_at)

    reset_link = f"/reset-password?token={reset_token}"
    print(f"\n  [DEV PASSWORD RESET] User: {user['email']}")
    print(f"  [DEV PASSWORD RESET] Link: {reset_link}")
    print(f"  [DEV PASSWORD RESET] Token: {reset_token}\n")

    return {
        "message": "If the email exists, a reset link has been sent",
        "dev_token": reset_token,
    }


@app.post("/api/reset-password")
def reset_password(req: ResetPasswordRequest):
    token_hash = hashlib.sha256(req.token.encode()).hexdigest()
    reset = db.find_password_reset(token_hash)
    if not reset:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    new_hash = hash_password(req.new_password)
    db.update_user_password(reset["user_id"], new_hash)
    db.mark_reset_used(reset["reset_id"])

    return {"message": "Password has been reset successfully"}


# ── Verification Workflow Endpoints ──

@app.post("/api/verify/email")
def verify_email(current_user=Depends(get_current_user)):
    db.update_user_verification(current_user["user_id"], "email_verified")
    return {"message": "Email verified", "verification_status": "email_verified"}


@app.post("/api/verify/phone")
def verify_phone(current_user=Depends(get_current_user)):
    db.update_user_verification(current_user["user_id"], "phone_verified")
    return {"message": "Phone verified", "verification_status": "phone_verified"}


@app.post("/api/verify/license")
def verify_license(current_user=Depends(get_current_user)):
    db.update_user_verification(current_user["user_id"], "license_pending")
    return {"message": "License submitted for verification", "verification_status": "license_pending"}


@app.post("/api/verify/identity")
def verify_identity(current_user=Depends(get_current_user)):
    db.update_user_verification(current_user["user_id"], "identity_pending")
    return {"message": "Identity documents submitted", "verification_status": "identity_pending"}


@app.post("/api/verify/approve")
def approve_user(
    user_id: str = Query(..., description="User ID to approve"),
    current_user=Depends(get_current_user)
):
    if current_user.get("verification_status") != "super_verified":
        raise HTTPException(status_code=403, detail="Only super verified users can approve others")
    target = db.get_user_by_id(user_id)
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    db.update_user_verification(user_id, "verified")
    return {"message": f"User {user_id} approved", "verification_status": "verified"}


@app.post("/api/verify/suspend")
def suspend_user(
    user_id: str = Query(...),
    current_user=Depends(get_current_user)
):
    if current_user.get("verification_status") != "super_verified":
        raise HTTPException(status_code=403, detail="Only super verified users can suspend others")
    db.update_user_verification(user_id, "suspended")
    return {"message": f"User {user_id} suspended"}


@app.get("/api/me")
def get_profile(current_user=Depends(get_current_user)):
    user = db.get_user_by_id(current_user["user_id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    password_hash = user.pop("password_hash", None)
    fac = db.get_facility(user.get("facility_id")) if user.get("facility_id") else None
    org = db.get_organization(fac["org_id"]) if fac else None
    lic = db.get_user_license(user["user_id"])
    user["facility"] = fac
    user["organization"] = org
    user["license"] = lic
    return user


# ── Organization & Facility Endpoints ──

@app.get("/api/organizations")
def list_organizations(current_user=Depends(get_current_user)):
    return db.list_organizations()


@app.get("/api/organizations/{org_id}")
def get_organization(org_id: str, current_user=Depends(get_current_user)):
    org = db.get_organization(org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org


@app.get("/api/facilities")
def list_facilities(org_id: str = None, current_user=Depends(get_current_user)):
    if org_id:
        return db.list_facilities(org_id)
    return db.list_facilities()


@app.get("/api/facilities/{facility_id}")
def get_facility(facility_id: str, current_user=Depends(get_current_user)):
    fac = db.get_facility(facility_id)
    if not fac:
        raise HTTPException(status_code=404, detail="Facility not found")
    return fac


@app.get("/api/departments")
def list_departments(facility_id: str = None, current_user=Depends(get_current_user)):
    return db.list_departments(facility_id)


@app.get("/api/users")
def list_users(facility_id: str = None, role: str = None, current_user=Depends(get_current_user)):
    return db.list_users(facility_id=facility_id, role=role)


# ── Seed Endpoint ──

@app.post("/api/seed")
def seed_database(req: SeedRequest, current_user=Depends(get_current_user)):
    if current_user.get("role") not in ("super_admin", "platform_architect", "deployment_engineer"):
        raise HTTPException(status_code=403, detail="Not authorized to seed database")
    from seed_engine import run_seed
    success = run_seed(profile=req.profile, db=db)
    if not success:
        raise HTTPException(status_code=500, detail="Seeding failed")
    return {"message": f"Database seeded with profile '{req.profile}'"}


@app.get("/api/seed/profiles")
def list_seed_profiles(current_user=Depends(get_current_user)):
    from seed_engine import PROFILES
    return {"profiles": list(PROFILES.keys())}


@app.get("/api/seed/stats")
def seed_stats(current_user=Depends(get_current_user)):
    from seed_engine import show_stats
    import io
    import contextlib
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        show_stats(db)
    return {"stats": buf.getvalue()}


# ── Clinical Cases Endpoints ──

@app.get("/api/clinical-cases")
def list_clinical_cases(current_user=Depends(get_current_user)):
    return db.list_clinical_cases()


@app.get("/api/clinical-cases/{case_id}")
def get_clinical_case(case_id: str, current_user=Depends(get_current_user)):
    cases = db.list_clinical_cases()
    for case in cases:
        if case["case_id"] == case_id:
            return case
    raise HTTPException(status_code=404, detail="Clinical case not found")


# ── Subscription Endpoints ──

@app.get("/api/subscriptions/{org_id}")
def get_subscription(org_id: str, current_user=Depends(get_current_user)):
    sub = db.get_org_subscription(org_id)
    if not sub:
        raise HTTPException(status_code=404, detail="No subscription found")
    return sub


# ── Rule API endpoints ──

@app.get("/api/rules/{rule_type}")
def get_rule_file(rule_type: str, current_user=Depends(get_current_user)):
    if rule_type not in RULES_FILES:
        raise HTTPException(404, "Rule type not found. Use: rules, diseases, safety")
    filepath = RULES_FILES[rule_type]
    if not filepath.exists():
        return {"content": "{}", "filename": str(filepath)}
    with open(filepath, 'r') as f:
        content = f.read()
    return {"content": content, "filename": str(filepath)}


@app.put("/api/rules/{rule_type}")
def update_rule_file(rule_type: str, req: RuleUpdateRequest, current_user=Depends(get_current_user)):
    if rule_type not in RULES_FILES:
        raise HTTPException(404, "Rule type not found. Use: rules, diseases, safety")
    filepath = RULES_FILES[rule_type]
    try:
        json.loads(req.content)
    except json.JSONDecodeError as e:
        raise HTTPException(400, f"Invalid JSON: {str(e)}")
    backup_name = None
    if filepath.exists():
        backup_name = backup_file(filepath)
    with open(filepath, 'w') as f:
        f.write(req.content)
    if rule_type == "rules":
        reload_rules_engine()
    elif rule_type == "diseases":
        reload_diseases_engine()
    elif rule_type == "safety":
        reload_safety_engine()
    return {"message": f"Updated {filepath.name}", "backup": backup_name}


def reload_rules_engine():
    global rule_engine, profile_rules, context_rules
    try:
        with open("rules/rules.json", 'r') as f:
            data = json.load(f)
        profile_rules = data.get("profile_rules", [])
        context_rules = data.get("context_rules", [])
        rule_engine = RuleEngine("rules/rules.json")
    except Exception as e:
        raise HTTPException(500, f"Failed to reload rules engine: {str(e)}")


def reload_diseases_engine():
    global diff_engine
    try:
        diff_engine = DifferentialEngine("knowledge/diseases.json")
    except Exception as e:
        raise HTTPException(500, f"Failed to reload diseases engine: {str(e)}")


def reload_safety_engine():
    global safety_engine
    try:
        safety_engine = SafetyEngine("safety_rules.json")
    except Exception as e:
        raise HTTPException(500, f"Failed to reload safety engine: {str(e)}")


# ── Protected patient endpoints ──

@app.post("/api/patient")
def create_patient(req: NewPatientRequest, current_user=Depends(get_current_user)):
    patient_id = str(uuid.uuid4())
    db.save_patient(patient_id, req.name, req.age, req.sex, current_user["user_id"])
    return {"patient_id": patient_id, "name": req.name}


@app.get("/api/patients")
def list_patients(current_user=Depends(get_current_user)):
    return db.list_patients(user_id=current_user["user_id"])


@app.get("/api/patient/{patient_id}")
def get_patient(patient_id: str, current_user=Depends(get_current_user)):
    pat = db.get_patient(patient_id)
    if not pat:
        raise HTTPException(404, "Patient not found")
    if pat.get("user_id") and pat["user_id"] != current_user["user_id"]:
        raise HTTPException(403, "Patient not owned by user")
    return pat


@app.post("/api/encounter/start")
def start_encounter(patient_id: str, current_user=Depends(get_current_user)):
    pat = db.get_patient(patient_id)
    if not pat:
        raise HTTPException(404, "Patient not found")
    if pat.get("user_id") and pat["user_id"] != current_user["user_id"]:
        raise HTTPException(403, "Patient not owned by user")
    session_id = session_manager.create_session(patient_id, current_user["user_id"])
    return {"session_id": session_id}


@app.get("/api/encounter/state/{session_id}")
def get_state(session_id: str, current_user=Depends(get_current_user)):
    loop = session_manager.get_loop(session_id)
    if not loop:
        raise HTTPException(404, "Session not found")
    if loop.user_id and loop.user_id != current_user["user_id"]:
        raise HTTPException(403, "Session not owned by user")
    return loop.acet.snapshot()


@app.get("/api/document/{session_id}/{doc_type}")
def get_document(session_id: str, doc_type: str, current_user=Depends(get_current_user)):
    loop = session_manager.get_loop(session_id)
    if not loop:
        raise HTTPException(404, "Session not found")
    if loop.user_id and loop.user_id != current_user["user_id"]:
        raise HTTPException(403, "Session not owned by user")
    doc = loop.acet.get(f"documents.{doc_type}")
    if not doc:
        doc_engine = DocumentationEngine()
        state = loop.acet.snapshot()
        if doc_type == "hp_note":
            doc = doc_engine.generate_hp_note(state)
        elif doc_type == "soap_note":
            doc = doc_engine.generate_soap_note(state)
        elif doc_type == "discharge_summary":
            doc = doc_engine.generate_discharge_summary(state)
        elif doc_type == "referral_letter":
            doc = doc_engine.generate_referral_letter(state)
        elif doc_type == "clinic_note":
            doc = doc_engine.generate_clinic_note(state)
        else:
            raise HTTPException(404, f"Unknown document type: {doc_type}")
        loop.acet.update(f"documents.{doc_type}", doc)
    return {"content": doc}


@app.post("/api/document/pdf/{session_id}/{doc_type}")
def export_pdf(session_id: str, doc_type: str, current_user=Depends(get_current_user)):
    loop = session_manager.get_loop(session_id)
    if not loop:
        raise HTTPException(404, "Session not found")
    if loop.user_id and loop.user_id != current_user["user_id"]:
        raise HTTPException(403, "Session not owned by user")
    doc = loop.acet.get(f"documents.{doc_type}")
    if not doc:
        doc_engine = DocumentationEngine()
        state = loop.acet.snapshot()
        if doc_type == "hp_note":
            doc = doc_engine.generate_hp_note(state)
        elif doc_type == "soap_note":
            doc = doc_engine.generate_soap_note(state)
        elif doc_type == "discharge_summary":
            doc = doc_engine.generate_discharge_summary(state)
        elif doc_type == "referral_letter":
            doc = doc_engine.generate_referral_letter(state)
        elif doc_type == "clinic_note":
            doc = doc_engine.generate_clinic_note(state)
        else:
            raise HTTPException(404, f"Unknown document type: {doc_type}")
        loop.acet.update(f"documents.{doc_type}", doc)
    pdf_name = f"{doc_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    exporter = PDFExporter(pdf_name)
    exporter.export_text(doc, title=doc_type.replace('_', ' ').title())
    return {"filename": pdf_name}


# ── WebSocket with token auth ──

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str, token: str = None):
    if not token:
        await websocket.close(code=1008, reason="Missing token")
        return
    payload = decode_jwt(token)
    if not payload:
        await websocket.close(code=1008, reason="Invalid token")
        return
    user = db.get_user_by_id(payload["user_id"])
    if not user:
        await websocket.close(code=1008, reason="User not found")
        return

    await websocket.accept()
    loop = session_manager.get_loop(session_id)
    if not loop:
        await websocket.close(code=1008, reason="Invalid session")
        return
    if loop.user_id and loop.user_id != user["user_id"]:
        await websocket.close(code=1008, reason="Session not owned by user")
        return

    session_manager.register_ws(session_id, websocket)
    forward_event(websocket, loop)

    await websocket.send_json({
        "type": "state",
        "data": loop.acet.snapshot()
    })

    try:
        while True:
            message = await websocket.receive_text()
            data = json.loads(message)
            cmd = data.get("command")
            payload = data.get("payload", {})

            if cmd == "symptom":
                loop.bus.publish("symptom", {"name": payload["symptom"]})
            elif cmd == "answer":
                loop.bus.publish("answer", payload)
            elif cmd == "exam":
                loop.bus.publish("exam_finding", payload)
            elif cmd == "age":
                loop.bus.publish("set_age", {"value": payload["age"]})
            elif cmd == "save":
                loop.save_current_snapshot()
                await websocket.send_json({"type": "info", "data": "Snapshot saved"})
            else:
                await websocket.send_json({"type": "error", "data": f"Unknown command: {cmd}"})
    except WebSocketDisconnect:
        session_manager.remove_ws(websocket)


@app.get("/editor")
async def rule_editor_page():
    with open("static/rule_editor.html", "r") as f:
        return HTMLResponse(f.read())


@app.get("/")
async def get_index():
    with open("static/index.html", "r") as f:
        return HTMLResponse(f.read())


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
