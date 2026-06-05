from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.models.goal import Goal
from app.schemas.goal import GoalCreate, GoalUpdate, GoalResponse, GoalContribution

router = APIRouter(prefix="/goals", tags=["Goals"])


def enrich_goal(goal: Goal) -> dict:
    """Add computed fields to goal response."""
    now = datetime.utcnow()
    target = goal.target_date.replace(tzinfo=None) if goal.target_date.tzinfo else goal.target_date
    months_remaining = max(0, int((target - now).days / 30))
    remaining_amount = max(0, goal.target_amount - goal.current_amount)
    required_monthly = remaining_amount / months_remaining if months_remaining > 0 else 0

    return {
        "id": goal.id,
        "user_id": goal.user_id,
        "name": goal.name,
        "category": goal.category,
        "target_amount": goal.target_amount,
        "current_amount": goal.current_amount,
        "target_date": goal.target_date,
        "status": goal.status,
        "description": goal.description,
        "monthly_contribution": goal.monthly_contribution,
        "progress_percentage": goal.progress_percentage,
        "months_remaining": months_remaining,
        "required_monthly_savings": round(required_monthly, 2),
        "created_at": goal.created_at,
    }


@router.post("/", response_model=GoalResponse, status_code=201)
def create_goal(
    payload: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = Goal(user_id=current_user.id, **payload.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return GoalResponse(**enrich_goal(goal))


@router.get("/", response_model=List[GoalResponse])
def list_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
    return [GoalResponse(**enrich_goal(g)) for g in goals]


@router.get("/{goal_id}", response_model=GoalResponse)
def get_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return GoalResponse(**enrich_goal(goal))


@router.put("/{goal_id}", response_model=GoalResponse)
def update_goal(
    goal_id: int,
    payload: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(goal, field, value)
    db.commit()
    db.refresh(goal)
    return GoalResponse(**enrich_goal(goal))


@router.post("/{goal_id}/contribute", response_model=GoalResponse)
def contribute_to_goal(
    goal_id: int,
    payload: GoalContribution,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    goal.current_amount = min(goal.target_amount, goal.current_amount + payload.amount)
    if goal.current_amount >= goal.target_amount:
        from app.models.goal import GoalStatus
        goal.status = GoalStatus.COMPLETED
    db.commit()
    db.refresh(goal)
    return GoalResponse(**enrich_goal(goal))


@router.delete("/{goal_id}", status_code=204)
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(goal)
    db.commit()
