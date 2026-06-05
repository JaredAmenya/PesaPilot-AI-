from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Enum, func
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class InsightType(str, enum.Enum):
    WARNING = "warning"
    TIP = "tip"
    ACHIEVEMENT = "achievement"
    ALERT = "alert"
    GENERAL = "general"


class AIInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    insight_text = Column(Text, nullable=False)
    insight_type = Column(Enum(InsightType), default=InsightType.GENERAL)
    category = Column(String(100), nullable=True)
    is_read = Column(Boolean, default=False)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="insights")
