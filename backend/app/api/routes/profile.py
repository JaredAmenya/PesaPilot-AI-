from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.models.profile import FinancialProfile, Budget
from app.schemas.profile import (
    FinancialProfileCreate, FinancialProfileResponse,
    BudgetCreate, BudgetResponse, HealthScore, EmergencyFund,
)
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/profile", tags=["Profile & Budget"])


@router.post("/onboarding", response_model=FinancialProfileResponse)
def complete_onboarding(
    payload: FinancialProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Upsert profile
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    if profile:
        for field, value in payload.model_dump(exclude={"financial_goals"}).items():
            setattr(profile, field, value)
    else:
        profile_data = payload.model_dump(exclude={"financial_goals"})
        profile = FinancialProfile(user_id=current_user.id, **profile_data)
        db.add(profile)

    current_user.onboarding_completed = True
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/", response_model=FinancialProfileResponse)
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Complete onboarding first.")
    return profile


@router.put("/", response_model=FinancialProfileResponse)
def update_profile(
    payload: FinancialProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    for field, value in payload.model_dump(exclude={"financial_goals"}).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/health-score", response_model=dict)
def get_health_score(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return AnalyticsService.calculate_health_score(db, current_user.id)


@router.get("/emergency-fund", response_model=EmergencyFund)
def get_emergency_fund(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    now = datetime.utcnow()
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    monthly_summary = AnalyticsService.get_monthly_summary(db, current_user.id, now.month, now.year)
    monthly_expenses = monthly_summary["total_expenses"]
    if monthly_expenses == 0:
        monthly_expenses = profile.total_monthly_income * 0.7  # Estimate if no data

    target = monthly_expenses * 6
    current = profile.existing_savings
    remaining = max(0, target - current)
    completion_pct = min(100.0, (current / target * 100) if target > 0 else 0)
    months_covered = current / monthly_expenses if monthly_expenses > 0 else 0

    return EmergencyFund(
        target_amount=target,
        current_amount=current,
        remaining_amount=remaining,
        completion_percentage=completion_pct,
        monthly_expenses=monthly_expenses,
        months_covered=months_covered,
    )


@router.post("/budget", response_model=BudgetResponse)
def create_budget(
    payload: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if abs(payload.needs_percentage + payload.wants_percentage + payload.savings_percentage - 100) > 0.01:
        raise HTTPException(status_code=400, detail="Budget percentages must sum to 100")

    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    total_income = profile.total_monthly_income if profile else 0

    # Check if budget for this month/year exists
    existing = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.month == payload.month,
        Budget.year == payload.year,
    ).first()

    if existing:
        for field, value in payload.model_dump().items():
            setattr(existing, field, value)
        existing.total_income = total_income
        db.commit()
        db.refresh(existing)
        return existing

    budget = Budget(user_id=current_user.id, total_income=total_income, **payload.model_dump())
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


@router.get("/budget", response_model=BudgetResponse)
def get_current_budget(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    now = datetime.utcnow()
    budget = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.month == now.month,
        Budget.year == now.year,
    ).first()

    if not budget:
        # Auto-generate default 50/30/20 budget
        profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
        total_income = profile.total_monthly_income if profile else 0
        budget = Budget(
            user_id=current_user.id,
            month=now.month,
            year=now.year,
            total_income=total_income,
        )
        db.add(budget)
        db.commit()
        db.refresh(budget)

    return budget


@router.get("/analytics/trends")
def get_trends(
    months: int = 6,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return AnalyticsService.get_income_trends(db, current_user.id, months)


@router.get("/analytics/monthly")
def get_monthly(
    month: int = None,
    year: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    now = datetime.utcnow()
    return AnalyticsService.get_monthly_summary(db, current_user.id, month or now.month, year or now.year)
