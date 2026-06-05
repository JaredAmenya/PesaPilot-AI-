from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime


class FinancialProfileCreate(BaseModel):
    monthly_salary: float = 0.0
    additional_income: float = 0.0
    existing_savings: float = 0.0
    existing_debts: float = 0.0
    currency: str = "KES"
    financial_goals: Optional[List[str]] = []


class FinancialProfileResponse(BaseModel):
    id: int
    user_id: int
    monthly_salary: float
    additional_income: float
    existing_savings: float
    existing_debts: float
    currency: str
    total_monthly_income: float
    created_at: datetime

    class Config:
        from_attributes = True


class BudgetCreate(BaseModel):
    month: int
    year: int
    needs_percentage: float = 50.0
    wants_percentage: float = 30.0
    savings_percentage: float = 20.0
    is_custom: bool = False

    @field_validator("needs_percentage", "wants_percentage", "savings_percentage")
    @classmethod
    def valid_percentage(cls, v):
        if not 0 <= v <= 100:
            raise ValueError("Percentage must be between 0 and 100")
        return v


class BudgetResponse(BaseModel):
    id: int
    user_id: int
    month: int
    year: int
    needs_percentage: float
    wants_percentage: float
    savings_percentage: float
    total_income: float
    needs_amount: float
    wants_amount: float
    savings_amount: float
    is_custom: bool
    created_at: datetime

    class Config:
        from_attributes = True


class HealthScore(BaseModel):
    score: int
    label: str  # Poor, Fair, Good, Excellent
    breakdown: dict
    recommendations: List[str]
    generated_at: datetime


class EmergencyFund(BaseModel):
    target_amount: float
    current_amount: float
    remaining_amount: float
    completion_percentage: float
    monthly_expenses: float
    months_covered: float
