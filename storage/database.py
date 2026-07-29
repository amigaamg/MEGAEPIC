import sqlite3
import json
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime
from auth import hash_password

DB_PATH = "amexan.db"

class Database:
    def __init__(self, db_path=DB_PATH):
        self.db_path = db_path
        self._init_tables()

    def _init_tables(self):
        with sqlite3.connect(self.db_path) as conn:
            cur = conn.cursor()

            cur.execute("""
                CREATE TABLE IF NOT EXISTS organizations (
                    org_id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    subscription_plan TEXT DEFAULT 'trial',
                    subscription_status TEXT DEFAULT 'trial',
                    tax_id TEXT,
                    country TEXT DEFAULT 'KE',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            cur.execute("""
                CREATE TABLE IF NOT EXISTS facilities (
                    facility_id TEXT PRIMARY KEY,
                    org_id TEXT NOT NULL,
                    name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    verification_status TEXT DEFAULT 'pending',
                    phone TEXT,
                    email TEXT,
                    address TEXT,
                    bed_count INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (org_id) REFERENCES organizations(org_id)
                )
            """)

            cur.execute("""
                CREATE TABLE IF NOT EXISTS departments (
                    dept_id TEXT PRIMARY KEY,
                    facility_id TEXT NOT NULL,
                    name TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (facility_id) REFERENCES facilities(facility_id)
                )
            """)

            cur.execute("""
                CREATE TABLE IF NOT EXISTS licenses (
                    license_id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    license_number TEXT,
                    license_type TEXT,
                    status TEXT DEFAULT 'pending',
                    issued_at TIMESTAMP,
                    expires_at TIMESTAMP,
                    verified_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(user_id)
                )
            """)

            cur.execute("""
                CREATE TABLE IF NOT EXISTS subscriptions (
                    sub_id TEXT PRIMARY KEY,
                    org_id TEXT NOT NULL,
                    plan TEXT NOT NULL,
                    status TEXT NOT NULL,
                    started_at TIMESTAMP,
                    expires_at TIMESTAMP,
                    features TEXT DEFAULT '[]',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (org_id) REFERENCES organizations(org_id)
                )
            """)

            cur.execute("""
                CREATE TABLE IF NOT EXISTS api_tokens (
                    token_id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    token_type TEXT NOT NULL,
                    token_hash TEXT,
                    description TEXT,
                    scopes TEXT DEFAULT '[]',
                    expires_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(user_id)
                )
            """)

            cur.execute("""
                CREATE TABLE IF NOT EXISTS clinical_cases (
                    case_id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    patient_id TEXT,
                    symptoms TEXT DEFAULT '[]',
                    history TEXT DEFAULT '[]',
                    vitals TEXT DEFAULT '{}',
                    exam_findings TEXT DEFAULT '[]',
                    investigations TEXT DEFAULT '{}',
                    expected_context TEXT,
                    expected_differentials TEXT DEFAULT '[]',
                    expected_management TEXT DEFAULT '[]',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
                )
            """)

            cur.execute("""
                CREATE TABLE IF NOT EXISTS password_reset_tokens (
                    reset_id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    token_hash TEXT NOT NULL,
                    expires_at TIMESTAMP NOT NULL,
                    used BOOLEAN DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(user_id)
                )
            """)

            cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    user_id TEXT PRIMARY KEY,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    role TEXT DEFAULT 'doctor',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            cur.execute("""
                CREATE TABLE IF NOT EXISTS patients (
                    patient_id TEXT PRIMARY KEY,
                    name TEXT,
                    age INTEGER,
                    sex TEXT,
                    user_id TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(user_id)
                )
            """)

            cur.execute("""
                CREATE TABLE IF NOT EXISTS encounters (
                    encounter_id TEXT PRIMARY KEY,
                    patient_id TEXT,
                    user_id TEXT,
                    start_time TIMESTAMP,
                    end_time TIMESTAMP,
                    profile TEXT,
                    context TEXT,
                    is_complete BOOLEAN DEFAULT 0,
                    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
                    FOREIGN KEY (user_id) REFERENCES users(user_id)
                )
            """)

            cur.execute("""
                CREATE TABLE IF NOT EXISTS events (
                    event_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    encounter_id TEXT,
                    event_type TEXT,
                    event_data TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (encounter_id) REFERENCES encounters(encounter_id)
                )
            """)

            cur.execute("""
                CREATE TABLE IF NOT EXISTS acet_snapshots (
                    snapshot_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    encounter_id TEXT,
                    snapshot_time TIMESTAMP,
                    snapshot_json TEXT,
                    FOREIGN KEY (encounter_id) REFERENCES encounters(encounter_id)
                )
            """)

            cur.execute("PRAGMA table_info(users)")
            existing_cols = [row[1] for row in cur.fetchall()]

            needed_cols = {
                "email": "TEXT",
                "phone": "TEXT",
                "display_name": "TEXT",
                "verification_status": "TEXT DEFAULT 'pending_email'",
                "facility_id": "TEXT",
                "dept_id": "TEXT",
                "specialization": "TEXT",
                "years_experience": "INTEGER DEFAULT 0"
            }

            for col, col_type in needed_cols.items():
                if col not in existing_cols:
                    cur.execute(f"ALTER TABLE users ADD COLUMN {col} {col_type}")

            cur.execute("PRAGMA table_info(patients)")
            pat_cols = [row[1] for row in cur.fetchall()]
            pat_needed = {
                "dob": "TEXT",
                "phone": "TEXT",
                "address": "TEXT",
                "blood_type": "TEXT",
                "conditions": "TEXT DEFAULT '[]'",
                "allergies": "TEXT DEFAULT '[]'",
                "medications": "TEXT DEFAULT '[]'",
                "weight_kg": "REAL",
                "height_cm": "REAL"
            }
            for col, col_type in pat_needed.items():
                if col not in pat_cols:
                    cur.execute(f"ALTER TABLE patients ADD COLUMN {col} {col_type}")

            conn.commit()

    # ── Organization methods ──

    def create_organization(self, org_id, name, org_type, subscription_plan="trial",
                            subscription_status="trial", tax_id=None, country="KE",
                            created_at=None):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT OR REPLACE INTO organizations
                (org_id, name, type, subscription_plan, subscription_status, tax_id, country, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (org_id, name, org_type, subscription_plan, subscription_status, tax_id, country, created_at))

    def get_organization(self, org_id):
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            row = conn.execute("SELECT * FROM organizations WHERE org_id = ?", (org_id,)).fetchone()
            return dict(row) if row else None

    def list_organizations(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            rows = conn.execute("SELECT * FROM organizations ORDER BY created_at").fetchall()
            return [dict(r) for r in rows]

    # ── Facility methods ──

    def create_facility(self, facility_id, org_id, name, fac_type,
                        verification_status="pending", phone=None, email=None,
                        address=None, bed_count=0, created_at=None):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT OR REPLACE INTO facilities
                (facility_id, org_id, name, type, verification_status, phone, email, address, bed_count, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (facility_id, org_id, name, fac_type, verification_status, phone, email, address, bed_count, created_at))

    def get_facility(self, facility_id):
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            row = conn.execute("SELECT * FROM facilities WHERE facility_id = ?", (facility_id,)).fetchone()
            return dict(row) if row else None

    def list_facilities(self, org_id=None):
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            if org_id:
                rows = conn.execute("SELECT * FROM facilities WHERE org_id = ? ORDER BY created_at", (org_id,)).fetchall()
            else:
                rows = conn.execute("SELECT * FROM facilities ORDER BY created_at").fetchall()
            return [dict(r) for r in rows]

    # ── Department methods ──

    def create_department(self, dept_id, facility_id, name, created_at=None):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT OR REPLACE INTO departments (dept_id, facility_id, name, created_at)
                VALUES (?, ?, ?, ?)
            """, (dept_id, facility_id, name, created_at))

    def list_departments(self, facility_id=None):
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            if facility_id:
                rows = conn.execute("SELECT * FROM departments WHERE facility_id = ? ORDER BY name", (facility_id,)).fetchall()
            else:
                rows = conn.execute("SELECT * FROM departments ORDER BY name").fetchall()
            return [dict(r) for r in rows]

    # ── License methods ──

    def create_license(self, license_id, user_id, license_number=None,
                       license_type=None, status="pending", issued_at=None,
                       expires_at=None, verified_at=None):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT OR REPLACE INTO licenses
                (license_id, user_id, license_number, license_type, status, issued_at, expires_at, verified_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (license_id, user_id, license_number, license_type, status, issued_at, expires_at, verified_at))

    def get_user_license(self, user_id):
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            row = conn.execute("SELECT * FROM licenses WHERE user_id = ? ORDER BY created_at DESC LIMIT 1", (user_id,)).fetchone()
            return dict(row) if row else None

    # ── Subscription methods ──

    def create_subscription(self, sub_id, org_id, plan, status,
                            started_at=None, expires_at=None, features=None):
        features_json = json.dumps(features or [])
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT OR REPLACE INTO subscriptions
                (sub_id, org_id, plan, status, started_at, expires_at, features)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (sub_id, org_id, plan, status, started_at, expires_at, features_json))

    def get_org_subscription(self, org_id):
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            row = conn.execute("SELECT * FROM subscriptions WHERE org_id = ? ORDER BY created_at DESC LIMIT 1", (org_id,)).fetchone()
            if row:
                result = dict(row)
                result["features"] = json.loads(result["features"])
                return result
            return None

    # ── API Token methods ──

    def create_api_token(self, token_id, user_id, token_type, token_hash=None,
                         description=None, scopes=None, expires_at=None):
        scopes_json = json.dumps(scopes or [])
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT OR REPLACE INTO api_tokens
                (token_id, user_id, token_type, token_hash, description, scopes, expires_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (token_id, user_id, token_type, token_hash, description, scopes_json, expires_at))

    def list_api_tokens(self, user_id=None, token_type=None):
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            query = "SELECT * FROM api_tokens WHERE 1=1"
            params = []
            if user_id:
                query += " AND user_id = ?"
                params.append(user_id)
            if token_type:
                query += " AND token_type = ?"
                params.append(token_type)
            query += " ORDER BY created_at"
            rows = conn.execute(query, params).fetchall()
            result = []
            for r in rows:
                d = dict(r)
                d["scopes"] = json.loads(d["scopes"])
                result.append(d)
            return result

    # ── Clinical Case methods ──

    def create_clinical_case(self, case_id, name, patient_id=None, symptoms=None,
                             history=None, vitals=None, exam_findings=None,
                             investigations=None, expected_context=None,
                             expected_differentials=None, expected_management=None):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT OR REPLACE INTO clinical_cases
                (case_id, name, patient_id, symptoms, history, vitals, exam_findings,
                 investigations, expected_context, expected_differentials, expected_management)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                case_id, name, patient_id,
                json.dumps(symptoms or []),
                json.dumps(history or []),
                json.dumps(vitals or {}),
                json.dumps(exam_findings or []),
                json.dumps(investigations or {}),
                expected_context,
                json.dumps(expected_differentials or []),
                json.dumps(expected_management or [])
            ))

    def list_clinical_cases(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            rows = conn.execute("SELECT * FROM clinical_cases ORDER BY name").fetchall()
            result = []
            for r in rows:
                d = dict(r)
                for field in ["symptoms", "history", "exam_findings", "expected_differentials", "expected_management"]:
                    if isinstance(d.get(field), str):
                        d[field] = json.loads(d[field])
                if isinstance(d.get("vitals"), str):
                    d["vitals"] = json.loads(d["vitals"])
                if isinstance(d.get("investigations"), str):
                    d["investigations"] = json.loads(d["investigations"])
                result.append(d)
            return result

    # ── Password Reset methods ──

    def create_password_reset(self, user_id, token_hash, expires_at):
        reset_id = str(uuid.uuid4())
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT INTO password_reset_tokens (reset_id, user_id, token_hash, expires_at)
                VALUES (?, ?, ?, ?)
            """, (reset_id, user_id, token_hash, expires_at))
            return reset_id

    def find_password_reset(self, token_hash):
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            row = conn.execute(
                "SELECT * FROM password_reset_tokens WHERE token_hash = ? AND used = 0 AND expires_at > datetime('now')",
                (token_hash,)
            ).fetchone()
            return dict(row) if row else None

    def mark_reset_used(self, reset_id):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("UPDATE password_reset_tokens SET used = 1 WHERE reset_id = ?", (reset_id,))

    # ── User methods (enhanced) ──

    def create_user(self, username: str, password: str, role: str = "doctor",
                    email=None, phone=None, display_name=None,
                    verification_status="pending_email", facility_id=None,
                    dept_id=None, specialization=None, years_experience=0,
                    user_id=None):
        uid = user_id or str(uuid.uuid4())
        pwhash = hash_password(password)
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT INTO users (user_id, username, password_hash, role, email, phone,
                                   display_name, verification_status, facility_id, dept_id,
                                   specialization, years_experience)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (uid, username, pwhash, role, email, phone, display_name,
                  verification_status, facility_id, dept_id, specialization, years_experience))
        return uid

    def update_user_verification(self, user_id, verification_status):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("UPDATE users SET verification_status = ? WHERE user_id = ?",
                         (verification_status, user_id))

    def update_user_password(self, user_id, new_password_hash):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("UPDATE users SET password_hash = ? WHERE user_id = ?",
                         (new_password_hash, user_id))

    def find_user_by_username(self, username: str) -> Optional[Dict]:
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            row = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
            return dict(row) if row else None

    def find_user_by_email(self, email: str) -> Optional[Dict]:
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
            return dict(row) if row else None

    def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            row = conn.execute("SELECT * FROM users WHERE user_id = ?", (user_id,)).fetchone()
            return dict(row) if row else None

    def list_users(self, facility_id=None, role=None) -> List[Dict]:
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            query = "SELECT * FROM users WHERE 1=1"
            params = []
            if facility_id:
                query += " AND facility_id = ?"
                params.append(facility_id)
            if role:
                query += " AND role = ?"
                params.append(role)
            query += " ORDER BY created_at DESC"
            rows = conn.execute(query, params).fetchall()
            return [dict(r) for r in rows]

    def user_exists_by_email(self, email: str) -> bool:
        with sqlite3.connect(self.db_path) as conn:
            row = conn.execute("SELECT 1 FROM users WHERE email = ?", (email,)).fetchone()
            return row is not None

    # ── Patient methods (enhanced) ──

    def save_patient(self, patient_id: str, name: str, age: int, sex: str,
                     user_id: str = None, dob=None, phone=None, address=None,
                     blood_type=None, conditions=None, allergies=None,
                     medications=None, weight_kg=None, height_cm=None):
        conditions_json = json.dumps(conditions or [])
        allergies_json = json.dumps(allergies or [])
        medications_json = json.dumps(medications or [])
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT OR REPLACE INTO patients
                (patient_id, name, age, sex, user_id, dob, phone, address, blood_type,
                 conditions, allergies, medications, weight_kg, height_cm)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (patient_id, name, age, sex, user_id, dob, phone, address,
                  blood_type, conditions_json, allergies_json, medications_json,
                  weight_kg, height_cm))

    def get_patient(self, patient_id: str) -> Optional[Dict]:
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            row = conn.execute("SELECT * FROM patients WHERE patient_id = ?", (patient_id,)).fetchone()
            if row:
                d = dict(row)
                for field in ["conditions", "allergies", "medications"]:
                    if isinstance(d.get(field), str):
                        try:
                            d[field] = json.loads(d[field])
                        except (json.JSONDecodeError, TypeError):
                            d[field] = []
                return d
            return None

    def list_patients(self, user_id: str = None) -> List[Dict]:
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            if user_id:
                rows = conn.execute(
                    "SELECT * FROM patients WHERE user_id = ? ORDER BY created_at DESC",
                    (user_id,)
                ).fetchall()
            else:
                rows = conn.execute("SELECT * FROM patients ORDER BY created_at DESC").fetchall()
            return [dict(r) for r in rows]

    # ── Encounter methods (unchanged) ──

    def save_encounter(self, encounter_id: str, patient_id: str, start_time: str,
                       end_time: str = None, profile: str = None,
                       context: str = None, is_complete: bool = False,
                       user_id: str = None):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT OR REPLACE INTO encounters "
                "(encounter_id, patient_id, user_id, start_time, end_time, profile, context, is_complete) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (encounter_id, patient_id, user_id, start_time, end_time,
                 profile, context, int(is_complete))
            )

    def get_encounter(self, encounter_id: str) -> Optional[Dict]:
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            row = conn.execute("SELECT * FROM encounters WHERE encounter_id = ?",
                               (encounter_id,)).fetchone()
            return dict(row) if row else None

    def list_encounters(self, patient_id: str = None, user_id: str = None) -> List[Dict]:
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            if patient_id and user_id:
                rows = conn.execute(
                    "SELECT * FROM encounters WHERE patient_id = ? AND user_id = ? ORDER BY start_time DESC",
                    (patient_id, user_id)
                ).fetchall()
            elif user_id:
                rows = conn.execute(
                    "SELECT * FROM encounters WHERE user_id = ? ORDER BY start_time DESC",
                    (user_id,)
                ).fetchall()
            elif patient_id:
                rows = conn.execute(
                    "SELECT * FROM encounters WHERE patient_id = ? ORDER BY start_time DESC",
                    (patient_id,)
                ).fetchall()
            else:
                rows = conn.execute("SELECT * FROM encounters ORDER BY start_time DESC").fetchall()
            return [dict(r) for r in rows]

    # ── Event methods (unchanged) ──

    def log_event(self, encounter_id: str, event_type: str, event_data: Dict):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT INTO events (encounter_id, event_type, event_data) VALUES (?, ?, ?)",
                (encounter_id, event_type, json.dumps(event_data))
            )

    def get_events(self, encounter_id: str) -> List[Dict]:
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            rows = conn.execute(
                "SELECT * FROM events WHERE encounter_id = ? ORDER BY timestamp",
                (encounter_id,)
            ).fetchall()
            return [dict(r) for r in rows]

    # ── Snapshot methods (unchanged) ──

    def save_snapshot(self, encounter_id: str, snapshot_json: Dict):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT INTO acet_snapshots (encounter_id, snapshot_json) VALUES (?, ?)",
                (encounter_id, json.dumps(snapshot_json))
            )

    def get_latest_snapshot(self, encounter_id: str) -> Optional[Dict]:
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            row = conn.execute(
                "SELECT snapshot_json FROM acet_snapshots "
                "WHERE encounter_id = ? ORDER BY snapshot_time DESC LIMIT 1",
                (encounter_id,)
            ).fetchone()
            return json.loads(row["snapshot_json"]) if row else None

    def get_all_snapshots(self, encounter_id: str) -> List[Dict]:
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            rows = conn.execute(
                "SELECT snapshot_time, snapshot_json FROM acet_snapshots "
                "WHERE encounter_id = ? ORDER BY snapshot_time",
                (encounter_id,)
            ).fetchall()
            return [{"time": r["snapshot_time"], "data": json.loads(r["snapshot_json"])} for r in rows]
