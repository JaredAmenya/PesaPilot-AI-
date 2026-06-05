from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from app.models.goal import GoalCategory, GoalStatus


class GoalCreate(BaseModel):
    name: str
    category: GoalCategory = GoalCategory.CUSTOM
    target_amount: float
    target_date: datetime
    description: Optional[str] = None
    monthly_contribution: Optional[float] = None

    @field_validator("target_amount")
    @classmethod
    def amount_positive(cls, v):
        if v <= 0:
            raise ValueError("Target amount must be positive")
        return v


class GoalUpdate(BaseModel):
    name: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    target_date: Optional[datetime] = None
    status: Optional[GoalStatus] = None
    description: Optional[str] = None
    monthly_contribution: Optional[float] = None


class GoalResponse(BaseModel):
    id: int
    user_id: int
    name: str
    category: GoalCategory
    target_amount: float
    current_amount: float
    target_date: datetime
    status: GoalStatus
    description: Optional[str]
    monthly_contribution: Optional[float]
    progress_percentage: float
    months_remaining: Optional[int]
    required_monthly_savings: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


class GoalContribution(BaseModel):
    amount: float

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v):
        if v <= 0:
            raise ValueError("Contribution must be positive")
        return v
