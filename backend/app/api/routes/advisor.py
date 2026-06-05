from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.models.insight import AIInsight, InsightType
from app.services.ai_service import ai_service
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/ai", tags=["AI Advisor"])


class ChatMessage(BaseModel):
    message: str
    history: List[dict] = []


class InsightMarkRead(BaseModel):
    insight_ids: List[int]


@router.get("/insights")
async def get_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get AI-generated spending insights."""
    # First get smart analytics-based insights
    analytics_insights = AnalyticsService.get_spending_insights(db, current_user.id)

    # Then try to get AI-enhanced insights
    ai_insights = await ai_service.generate_insights(db, current_user.id)

    # Merge and deduplicate
    all_insights = analytics_insights + ai_insights
    seen = set()
    unique_insights = []
    for ins in all_insights[:10]:
        key = ins.get("text", "")[:50]
        if key not in seen:
            seen.add(key)
            unique_insights.append(ins)

    return {"insights": unique_insights[:8], "ai_powered": ai_service.has_api_key}


@router.post("/chat")
async def chat_with_advisor(
    payload: ChatMessage,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Chat with the AI financial advisor."""
    response = await ai_service.chat(db, current_user.id, payload.message, payload.history)

    # Save the insight to DB
    insight = AIInsight(
        user_id=current_user.id,
        insight_text=response,
        insight_type=InsightType.GENERAL,
    )
    db.add(insight)
    db.commit()

    return {"response": response, "ai_powered": ai_service.has_api_key}


@router.get("/budget-advice")
async def get_budget_advice(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get AI-generated budget recommendations."""
    advice = await ai_service.generate_budget_advice(db, current_user.id)
    return {"advice": advice, "ai_powered": ai_service.has_api_key}


@router.get("/health-score")
def get_health_score(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get detailed financial health score."""
    return AnalyticsService.calculate_health_score(db, current_user.id)
