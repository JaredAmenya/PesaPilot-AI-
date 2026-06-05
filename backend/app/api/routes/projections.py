from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.models.profile import FinancialProfile
from app.services.projection_service import ProjectionService
from app.services.analytics_service import AnalyticsService
from datetime import datetime

router = APIRouter(prefix="/projections", tags=["Projections"])


@router.get("/")
def get_projections(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate 6-month, 1-year, and 5-year financial projections."""
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    now = datetime.utcnow()

    monthly_income = profile.total_monthly_income if profile else 0
    current_savings = profile.existing_savings if profile else 0

    # Get actual monthly expenses from last month's data
    monthly_summary = AnalyticsService.get_monthly_summary(db, current_user.id, now.month, now.year)
    monthly_expenses = monthly_summary["total_expenses"]

    if monthly_expenses == 0 and profile:
        monthly_expenses = profile.total_monthly_income * 0.7

    return ProjectionService.generate_projections(
        monthly_income=monthly_income,
        monthly_expenses=monthly_expenses,
        current_savings=current_savings,
    )


@router.get("/mpesa-import-template")
def get_mpesa_template():
    """Return the expected M-Pesa CSV format documentation."""
    return {
        "format": "CSV",
        "columns": ["Date", "Description", "Paid In", "Withdrawn", "Balance"],
        "example": "06/05/2025,M-Pesa Transfer from John,5000,,15000",
        "notes": "Download your M-Pesa statement from the M-Pesa app or MySafaricom app.",
    }
