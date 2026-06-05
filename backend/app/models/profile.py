from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Boolean, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class FinancialProfile(Base):
    __tablename__ = "financial_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    monthly_salary = Column(Float, default=0.0)
    additional_income = Column(Float, default=0.0)
    existing_savings = Column(Float, default=0.0)
    existing_debts = Column(Float, default=0.0)
    currency = Column(String(10), default="KES")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="profile")

    @property
    def total_monthly_income(self) -> float:
        return self.monthly_salary + self.additional_income


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    month = Column(Integer, nullable=False)  # 1-12
    year = Column(Integer, nullable=False)
    needs_percentage = Column(Float, default=50.0)
    wants_percentage = Column(Float, default=30.0)
    savings_percentage = Column(Float, default=20.0)
    total_income = Column(Float, default=0.0)
    is_custom = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="budgets")

    @property
    def needs_amount(self) -> float:
        return self.total_income * (self.needs_percentage / 100)

    @property
    def wants_amount(self) -> float:
        return self.total_income * (self.wants_percentage / 100)

    @property
    def savings_amount(self) -> float:
        return self.total_income * (self.savings_percentage / 100)
