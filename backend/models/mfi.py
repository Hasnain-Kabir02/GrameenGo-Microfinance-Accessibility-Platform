from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime, timezone

class MFI(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    name: str
    description: Optional[str] = None
    min_loan_amount: float
    max_loan_amount: float
    interest_rate: float  # Annual percentage
    processing_time_days: int
    requirements: List[str] = []
    collateral_required: bool = False
    website: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    logo_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LoanProduct(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    mfi_id: str
    name: str
    description: Optional[str] = None
    min_amount: float
    max_amount: float
    interest_rate: float
    tenure_months: List[int] = []  # Available loan periods
    eligibility_criteria: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
