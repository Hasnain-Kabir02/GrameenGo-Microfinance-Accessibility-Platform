from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime

class User(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    
    id: str
    email: EmailStr
    name: str
    password_hash: Optional[str] = None
    role: str = "borrower"  # borrower, officer, admin
    picture: Optional[str] = None
    phone: Optional[str] = None
    nid: Optional[str] = None
    address: Optional[str] = None
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "borrower"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    email: str
    name: str
    role: str
    picture: Optional[str] = None
    phone: Optional[str] = None
    business_name: Optional[str] = None

from datetime import timezone
