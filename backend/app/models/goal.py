from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Enum, Text, Boolean, func
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class GoalCategory(str, enum.Enum):
    CAR = "Buy a Car"
    LAND = "Buy Land"
    EMERGENCY_FUND = "Emergency Fund"
    BUSINESS = "Start a Business"
    TRAVEL = "Save for Travel"
    EDUCATION = "Education"
    HOUSE = "Buy a House"
    RETIREMENT = "Retirement"
    CUSTOM = "Custom"


class GoalStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    PAUSED = "paused"


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(200), nullable=False)
    category = Column(Enum(GoalCategory), default=GoalCategory.CUSTOM)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    target_date = Column(DateTime(timezone=True), nullable=False)
    status = Column(Enum(GoalStatus), default=GoalStatus.ACTIVE)
    description = Column(Text, nullable=True)
    monthly_contribution = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="goals")

    @property
    def progress_percentage(self) -> float:
        if self.target_amount == 0:
            return 0.0
        return min(100.0, (self.current_amount / self.target_amount) * 100)
