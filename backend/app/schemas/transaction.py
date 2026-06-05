from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime
from app.models.transaction import TransactionCategory, TransactionType, TransactionSource


class TransactionCreate(BaseModel):
    amount: float
    description: str
    category: TransactionCategory
    type: TransactionType
    date: datetime
    notes: Optional[str] = None
    source: TransactionSource = TransactionSource.MANUAL

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v):
        if v <= 0:
            raise ValueError("Amount must be positive")
        return v


class TransactionUpdate(BaseModel):
    amount: Optional[float] = None
    description: Optional[str] = None
    category: Optional[TransactionCategory] = None
    type: Optional[TransactionType] = None
    date: Optional[datetime] = None
    notes: Optional[str] = None


class TransactionResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    description: str
    category: TransactionCategory
    type: TransactionType
    source: TransactionSource
    date: datetime
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class TransactionFilter(BaseModel):
    category: Optional[TransactionCategory] = None
    type: Optional[TransactionType] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    search: Optional[str] = None
    page: int = 1
    page_size: int = 20


class TransactionSummary(BaseModel):
    total_income: float
    total_expenses: float
    net: float
    by_category: dict
    transactions: List[TransactionResponse]
    total_count: int
