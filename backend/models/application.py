from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime, timezone

class LoanApplication(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    user_id: str
    mfi_id: str
    loan_product_id: Optional[str] = None
    
    # Business Information
    business_name: str
    business_type: str
    business_age_years: int
    monthly_revenue: float
    
    # Loan Details
    loan_amount: float
    loan_purpose: str
    tenure_months: int
    
    # Documents
    documents: List[dict] = []
    
    # Application Status
    status: str = "submitted"  # submitted, under_review, approved, rejected, disbursed
    officer_id: Optional[str] = None
    officer_notes: Optional[str] = None
    rejection_reason: Optional[str] = None
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ApplicationCreate(BaseModel):
    mfi_id: str
    loan_product_id: Optional[str] = None
    business_name: str
    business_type: str
    business_age_years: int
    monthly_revenue: float
    loan_amount: float
    loan_purpose: str
    tenure_months: int

class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    officer_notes: Optional[str] = None
    rejection_reason: Optional[str] = None
