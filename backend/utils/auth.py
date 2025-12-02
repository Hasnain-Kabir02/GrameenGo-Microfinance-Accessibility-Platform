from datetime import datetime, timezone, timedelta
from passlib.hash import bcrypt
from jose import jwt
import os
from motor.motor_asyncio import AsyncIOMotorClient

SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

def hash_password(password: str) -> str:
    """Hash a password for storing."""
    return bcrypt.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a stored password against one provided by user."""
    return bcrypt.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str):
    """Decode JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except:
        return None

async def get_current_user(db, token: str = None, session_token: str = None):
    """Get current user from JWT token or Emergent session token."""
    # Try Emergent session first
    if session_token:
        session = await db.user_sessions.find_one({"session_token": session_token})
        if session and session.get('expires_at') > datetime.now(timezone.utc):
            user = await db.users.find_one({"id": session['user_id']})
            if user:
                user['_id'] = str(user['_id'])
                return user
    
    # Try JWT token
    if token:
        payload = decode_token(token)
        if payload:
            user_id = payload.get('user_id')
            user = await db.users.find_one({"id": user_id})
            if user:
                user['_id'] = str(user['_id'])
                return user
    
    return None
