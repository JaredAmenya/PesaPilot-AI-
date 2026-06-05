from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Enum, Text, Boolean, func
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class TransactionCategory(str, enum.Enum):
    RENT = "Rent"
    FOOD = "Food"
    TRANSPORT = "Transport"
    UTILITIES = "Utilities"
    ENTERTAINMENT = "Entertainment"
    SHOPPING = "Shopping"
    HEALTHCARE = "Healthcare"
    EDUCATION = "Education"
    SAVINGS = "Savings"
    INVESTMENTS = "Investments"
    MISCELLANEOUS = "Miscellaneous"
    SALARY = "Salary"
    FREELANCING = "Freelancing"
    SIDE_HUSTLE = "Side Hustle"
    BUSINESS = "Business"
    MPESA = "M-Pesa"
    SACCO = "SACCO"
    CHAMA = "Chama"


class TransactionType(str, enum.Enum):
    INCOME = "income"
    EXPENSE = "expense"


class TransactionSource(str, enum.Enum):
    MANUAL = "manual"
    MPESA = "mpesa"
    AIRTEL = "airtel"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String(500), nullable=False)
    category = Column(Enum(TransactionCategory), nullable=False)
    type = Column(Enum(TransactionType), nullable=False)
    source = Column(Enum(TransactionSource), default=TransactionSource.MANUAL)
    date = Column(DateTime(timezone=True), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="transactions")
