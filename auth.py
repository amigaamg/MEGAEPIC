import bcrypt
import jwt
import uuid
import datetime
from typing import Optional, Dict

SECRET_KEY = "amexan-super-secret-key-change-in-production"
ALGORITHM = "HS256"
TOKEN_EXPIRY_HOURS = 24

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))

def create_jwt(user_id: str, username: str, role: str,
               verification_status: str = "pending_email",
               facility_id: str = None,
               org_id: str = None) -> str:
    payload = {
        "user_id": user_id,
        "username": username,
        "role": role,
        "verification_status": verification_status,
        "facility_id": facility_id,
        "org_id": org_id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=TOKEN_EXPIRY_HOURS)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_jwt(token: str) -> Optional[Dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        return None
