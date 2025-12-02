from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime, timezone

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    user_id: str
    title: str
    message: str
    type: str  # info, success, warning, error
    read: bool = False
    link: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
