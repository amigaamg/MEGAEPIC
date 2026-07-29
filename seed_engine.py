import json
import os
import hashlib
import uuid
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional

try:
    import yaml
except ImportError:
    yaml = None

from storage.database import Database
from auth import hash_password

SEED_DIR = Path(__file__).parent / "seed"

SEED_FILES = [
    "organizations.yaml",
    "facilities.yaml",
    "departments.yaml",
    "super_admins.yaml",
    "clinicians.yaml",
    "nurses.yaml",
    "allied_health.yaml",
    "admin_staff.yaml",
    "patients.yaml",
    "subscriptions.yaml",
    "verification_states.yaml",
    "api_tokens.yaml",
    "clinical_cases.yaml",
]

PROFILES = {
    "developer": SEED_FILES,
    "minimal": [
        "organizations.yaml",
        "facilities.yaml",
        "departments.yaml",
        "super_admins.yaml",
        "clinicians.yaml",
        "nurses.yaml",
        "patients.yaml",
    ],
    "teaching": [
        "organizations.yaml",
        "facilities.yaml",
        "departments.yaml",
        "super_admins.yaml",
        "clinicians.yaml",
        "nurses.yaml",
        "allied_health.yaml",
        "admin_staff.yaml",
        "patients.yaml",
        "subscriptions.yaml",
        "verification_states.yaml",
        "clinical_cases.yaml",
    ],
    "district-hospital": [
        "organizations.yaml",
        "facilities.yaml",
        "departments.yaml",
        "clinicians.yaml",
        "nurses.yaml",
        "patients.yaml",
        "subscriptions.yaml",
    ],
    "enterprise": SEED_FILES,
}


def deterministic_id(seed_str: str) -> str:
    h = hashlib.sha256(seed_str.encode()).hexdigest()
    return f"seed-{h[:24]}"


def load_yaml(filepath: Path) -> Optional[Dict]:
    if not filepath.exists():
        print(f"  [SKIP] {filepath.name} not found")
        return None
    if yaml is None:
        print("  [ERROR] PyYAML not installed. Run: pip install pyyaml")
        return None
    with open(filepath, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)


def seed_organizations(db: Database, data: Dict):
    for org in data.get("organizations", []):
        db.create_organization(
            org_id=org["org_id"],
            name=org["name"],
            org_type=org.get("type", "clinic"),
            subscription_plan=org.get("subscription_plan", "trial"),
            subscription_status=org.get("subscription_status", "trial"),
            tax_id=org.get("tax_id"),
            country=org.get("country", "KE"),
            created_at=org.get("created_at"),
        )
        print(f"  [OK] Organization: {org['name']} ({org['org_id']})")


def seed_facilities(db: Database, data: Dict):
    for fac in data.get("facilities", []):
        db.create_facility(
            facility_id=fac["facility_id"],
            org_id=fac["org_id"],
            name=fac["name"],
            fac_type=fac.get("type", "clinic"),
            verification_status=fac.get("verification_status", "pending"),
            phone=fac.get("phone"),
            email=fac.get("email"),
            address=fac.get("address"),
            bed_count=fac.get("bed_count", 0),
            created_at=fac.get("created_at"),
        )
        print(f"  [OK] Facility: {fac['name']} ({fac['facility_id']})")


def seed_departments(db: Database, data: Dict):
    for dept in data.get("departments", []):
        db.create_department(
            dept_id=dept["dept_id"],
            facility_id=dept["facility_id"],
            name=dept["name"],
            created_at=dept.get("created_at"),
        )
    print(f"  [OK] Departments: {len(data.get('departments', []))} created")


def _seed_users_from_list(db: Database, users: List[Dict], category: str):
    for user in users:
        uid = user.get("user_id") or deterministic_id(user["email"])
        db.create_user(
            user_id=uid,
            username=user["username"],
            password=user["password"],
            role=user.get("role", "doctor"),
            email=user.get("email"),
            phone=user.get("phone"),
            display_name=user.get("display_name"),
            verification_status=user.get("verification_status", "pending_email"),
            facility_id=user.get("facility_id"),
            dept_id=user.get("dept_id"),
            specialization=user.get("specialization"),
            years_experience=user.get("years_experience", 0),
        )

        license_number = user.get("license_number")
        if license_number:
            license_id = deterministic_id(f"lic-{uid}")
            db.create_license(
                license_id=license_id,
                user_id=uid,
                license_number=license_number,
                license_type=user.get("license_type", "full_practice"),
                status=user.get("license_status", "pending"),
            )

        print(f"  [OK] {category}: {user.get('display_name', user['username'])} ({user['email']})")


def seed_super_admins(db: Database, data: Dict):
    _seed_users_from_list(db, data.get("super_admins", []), "Super Admin")


def seed_clinicians(db: Database, data: Dict):
    _seed_users_from_list(db, data.get("clinicians", []), "Clinician")


def seed_nurses(db: Database, data: Dict):
    _seed_users_from_list(db, data.get("nurses", []), "Nurse")


def seed_allied_health(db: Database, data: Dict):
    _seed_users_from_list(db, data.get("allied_health", []), "Allied Health")


def seed_admin_staff(db: Database, data: Dict):
    _seed_users_from_list(db, data.get("admin_staff", []), "Admin Staff")


def seed_verification_states(db: Database, data: Dict):
    _seed_users_from_list(db, data.get("verification_users", []), "Verification State")


def seed_patients(db: Database, data: Dict):
    for pat in data.get("patients", []):
        pid = pat["patient_id"]
        db.save_patient(
            patient_id=pid,
            name=pat["name"],
            age=pat["age"],
            sex=pat["sex"],
            user_id=None,
            dob=pat.get("dob"),
            phone=pat.get("phone"),
            address=pat.get("address"),
            blood_type=pat.get("blood_type"),
            conditions=pat.get("conditions", []),
            allergies=pat.get("allergies", []),
            medications=pat.get("medications", []),
            weight_kg=pat.get("weight_kg"),
            height_cm=pat.get("height_cm"),
        )
        print(f"  [OK] Patient: {pat['name']} ({pat['patient_id']})")


def seed_subscriptions(db: Database, data: Dict):
    for sub in data.get("subscriptions", []):
        db.create_subscription(
            sub_id=sub["sub_id"],
            org_id=sub["org_id"],
            plan=sub["plan"],
            status=sub["status"],
            started_at=sub.get("started_at"),
            expires_at=sub.get("expires_at"),
            features=sub.get("features", []),
        )
        print(f"  [OK] Subscription: {sub['sub_id']} ({sub['plan']}/{sub['status']})")


def seed_api_tokens(db: Database, data: Dict):
    for tok in data.get("api_tokens", []):
        token_hash_value = hash_password(f"{tok['token_id']}-{tok['token_type']}-dev-secret")
        db.create_api_token(
            token_id=tok["token_id"],
            user_id=tok["user_id"],
            token_type=tok["token_type"],
            token_hash=token_hash_value,
            description=tok.get("description"),
            scopes=tok.get("scopes", []),
            expires_at=tok.get("expires_at"),
        )
        print(f"  [OK] API Token: {tok['token_id']} ({tok['token_type']})")


def seed_clinical_cases(db: Database, data: Dict):
    for case in data.get("clinical_cases", []):
        db.create_clinical_case(
            case_id=case["case_id"],
            name=case["name"],
            patient_id=case.get("patient_id"),
            symptoms=case.get("symptoms", []),
            history=case.get("history", []),
            vitals=case.get("vitals", {}),
            exam_findings=case.get("exam_findings", []),
            investigations=case.get("investigations", {}),
            expected_context=case.get("expected_context"),
            expected_differentials=case.get("expected_differentials", []),
            expected_management=case.get("expected_management", []),
        )
        print(f"  [OK] Clinical Case: {case['name']} ({case['case_id']})")


SEED_HANDLERS = {
    "organizations.yaml": ("Organizations", seed_organizations),
    "facilities.yaml": ("Facilities", seed_facilities),
    "departments.yaml": ("Departments", seed_departments),
    "super_admins.yaml": ("Super Admins", seed_super_admins),
    "clinicians.yaml": ("Clinicians", seed_clinicians),
    "nurses.yaml": ("Nurses", seed_nurses),
    "allied_health.yaml": ("Allied Health", seed_allied_health),
    "admin_staff.yaml": ("Admin Staff", seed_admin_staff),
    "patients.yaml": ("Patients", seed_patients),
    "subscriptions.yaml": ("Subscriptions", seed_subscriptions),
    "verification_states.yaml": ("Verification States", seed_verification_states),
    "api_tokens.yaml": ("API Tokens", seed_api_tokens),
    "clinical_cases.yaml": ("Clinical Cases", seed_clinical_cases),
}


def run_seed(profile: str = "developer", db: Optional[Database] = None, verbose: bool = True):
    if yaml is None:
        print("ERROR: PyYAML is required. Install with: pip install pyyaml")
        return False

    if db is None:
        db = Database()

    if profile not in PROFILES:
        valid = ", ".join(PROFILES.keys())
        print(f"ERROR: Unknown profile '{profile}'. Valid profiles: {valid}")
        return False

    files_to_seed = PROFILES[profile]

    if verbose:
        print(f"\n{'='*60}")
        print(f"  AMEXAN Seed Engine")
        print(f"  Profile: {profile}")
        print(f"  Files: {', '.join(files_to_seed)}")
        print(f"{'='*60}\n")

    for filename in files_to_seed:
        filepath = SEED_DIR / filename
        if not filepath.exists():
            if verbose:
                print(f"  [SKIP] {filename} not found in {SEED_DIR}")
            continue

        if verbose:
            print(f"\n--- {filename} ---")

        data = load_yaml(filepath)
        if data is None:
            continue

        name, handler = SEED_HANDLERS.get(filename, (None, None))
        if handler:
            handler(db, data)
        else:
            print(f"  [WARN] No handler for {filename}")

    if verbose:
        print(f"\n{'='*60}")
        print(f"  Seed complete! Profile: {profile}")
        print(f"  Database: {db.db_path}")
        print(f"{'='*60}\n")

    return True


def list_profiles():
    print("Available seed profiles:")
    for name, files in PROFILES.items():
        print(f"  {name}: {', '.join(files)}")
    print()


def list_users(db: Optional[Database] = None):
    if db is None:
        db = Database()
    users = db.list_users()
    print(f"\n{'Username':<25} {'Email':<35} {'Role':<25} {'Verification':<20} {'Facility':<20}")
    print("-" * 145)
    for u in users:
        print(f"{u['username']:<25} {str(u.get('email', '')):<35} {u['role']:<25} {str(u.get('verification_status', '')):<20} {str(u.get('facility_id', '')):<20}")
    print(f"\nTotal: {len(users)} users\n")


def show_stats(db: Optional[Database] = None):
    if db is None:
        db = Database()
    with sqlite3.connect(db.db_path) as conn:
        cur = conn.cursor()
        tables = ["organizations", "facilities", "departments", "users", "patients",
                   "encounters", "events", "licenses", "subscriptions", "api_tokens",
                   "clinical_cases"]
        print(f"\n{'Table':<25} {'Count':<10}")
        print("-" * 35)
        for table in tables:
            try:
                cur.execute(f"SELECT COUNT(*) FROM {table}")
                count = cur.fetchone()[0]
                print(f"{table:<25} {count:<10}")
            except sqlite3.OperationalError:
                print(f"{table:<25} {'N/A':<10}")
        print()


if __name__ == "__main__":
    import sys
    import sqlite3

    action = sys.argv[1] if len(sys.argv) > 1 else "seed"

    if action == "seed":
        profile = sys.argv[2] if len(sys.argv) > 2 else "developer"
        run_seed(profile)
    elif action == "profiles":
        list_profiles()
    elif action == "users":
        list_users()
    elif action == "stats":
        show_stats()
    elif action == "reset":
        db_path = sys.argv[2] if len(sys.argv) > 2 else "amexan.db"
        confirm = input(f"Delete all data in {db_path} and re-seed? (yes/no): ")
        if confirm.lower() == "yes":
            os.remove(db_path)
            print(f"Deleted {db_path}")
            profile = sys.argv[3] if len(sys.argv) > 3 else "developer"
            run_seed(profile)
        else:
            print("Aborted.")
    else:
        print(f"Unknown action: {action}")
        print("Usage: python seed_engine.py [seed|profiles|users|stats|reset] [profile]")
