from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
from collections import defaultdict

from app.models.transaction import Transaction, TransactionType, TransactionCategory
from app.models.profile import FinancialProfile, Budget
from app.models.goal import Goal, GoalStatus
from app.models.user import User


class AnalyticsService:

    @staticmethod
    def get_monthly_summary(db: Session, user_id: int, month: int, year: int) -> Dict:
        """Get comprehensive monthly financial summary."""
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)

        transactions = (
            db.query(Transaction)
            .filter(
                Transaction.user_id == user_id,
                Transaction.date >= start_date,
                Transaction.date < end_date,
            )
            .all()
        )

        income = sum(t.amount for t in transactions if t.type == TransactionType.INCOME)
        expenses = sum(t.amount for t in transactions if t.type == TransactionType.EXPENSE)
        by_category = defaultdict(float)
        for t in transactions:
            if t.type == TransactionType.EXPENSE:
                by_category[t.category.value] += t.amount

        return {
            "month": month,
            "year": year,
            "total_income": income,
            "total_expenses": expenses,
            "net_savings": income - expenses,
            "savings_rate": (income - expenses) / income * 100 if income > 0 else 0,
            "by_category": dict(by_category),
            "transaction_count": len(transactions),
        }

    @staticmethod
    def calculate_health_score(db: Session, user_id: int) -> Dict:
        """Calculate financial health score 0-100 with breakdown."""
        now = datetime.utcnow()
        profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == user_id).first()

        # Last 3 months data
        three_months_ago = now - timedelta(days=90)
        transactions = (
            db.query(Transaction)
            .filter(Transaction.user_id == user_id, Transaction.date >= three_months_ago)
            .all()
        )

        monthly_income = profile.total_monthly_income if profile else 0
        monthly_expenses = (
            sum(t.amount for t in transactions if t.type == TransactionType.EXPENSE) / 3
        )

        # ── Scoring Components ──────────────────────────────
        score = 0
        breakdown = {}

        # 1. Savings Rate (max 30 pts)
        savings_rate = (monthly_income - monthly_expenses) / monthly_income * 100 if monthly_income > 0 else 0
        if savings_rate >= 20:
            savings_score = 30
        elif savings_rate >= 10:
            savings_score = 20
        elif savings_rate >= 5:
            savings_score = 10
        else:
            savings_score = max(0, int(savings_rate * 1.5))
        score += savings_score
        breakdown["savings_rate"] = {"score": savings_score, "max": 30, "value": round(savings_rate, 1)}

        # 2. Spending Discipline (max 25 pts) — expenses vs income ratio
        expense_ratio = monthly_expenses / monthly_income if monthly_income > 0 else 1
        if expense_ratio <= 0.5:
            discipline_score = 25
        elif expense_ratio <= 0.7:
            discipline_score = 20
        elif expense_ratio <= 0.9:
            discipline_score = 12
        elif expense_ratio <= 1.0:
            discipline_score = 5
        else:
            discipline_score = 0
        score += discipline_score
        breakdown["spending_discipline"] = {"score": discipline_score, "max": 25, "value": round(expense_ratio * 100, 1)}

        # 3. Emergency Fund (max 20 pts)
        existing_savings = profile.existing_savings if profile else 0
        target_emergency = monthly_expenses * 6
        emergency_ratio = existing_savings / target_emergency if target_emergency > 0 else 0
        emergency_score = min(20, int(emergency_ratio * 20))
        score += emergency_score
        breakdown["emergency_fund"] = {"score": emergency_score, "max": 20, "value": round(emergency_ratio * 100, 1)}

        # 4. Debt Ratio (max 15 pts)
        existing_debts = profile.existing_debts if profile else 0
        annual_income = monthly_income * 12
        debt_ratio = existing_debts / annual_income if annual_income > 0 else 0
        if debt_ratio == 0:
            debt_score = 15
        elif debt_ratio <= 0.2:
            debt_score = 12
        elif debt_ratio <= 0.4:
            debt_score = 8
        elif debt_ratio <= 0.6:
            debt_score = 4
        else:
            debt_score = 0
        score += debt_score
        breakdown["debt_ratio"] = {"score": debt_score, "max": 15, "value": round(debt_ratio * 100, 1)}

        # 5. Goal Progress (max 10 pts)
        active_goals = db.query(Goal).filter(
            Goal.user_id == user_id, Goal.status == GoalStatus.ACTIVE
        ).all()
        if active_goals:
            avg_progress = sum(g.progress_percentage for g in active_goals) / len(active_goals)
            goal_score = min(10, int(avg_progress / 10))
        else:
            goal_score = 5
        score += goal_score
        breakdown["goal_progress"] = {"score": goal_score, "max": 10, "value": round(avg_progress if active_goals else 0, 1)}

        # Determine label
        if score >= 81:
            label = "Excellent"
            color = "#10b981"
        elif score >= 61:
            label = "Good"
            color = "#3b82f6"
        elif score >= 41:
            label = "Fair"
            color = "#f59e0b"
        else:
            label = "Poor"
            color = "#ef4444"

        return {
            "score": min(100, score),
            "label": label,
            "color": color,
            "breakdown": breakdown,
            "monthly_income": monthly_income,
            "monthly_expenses": monthly_expenses,
            "savings_rate": round(savings_rate, 1),
        }

    @staticmethod
    def get_spending_insights(db: Session, user_id: int) -> List[Dict]:
        """Generate intelligent spending insights."""
        now = datetime.utcnow()
        current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_month_start = (current_month_start - timedelta(days=1)).replace(day=1)

        current_txns = db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.date >= current_month_start,
            Transaction.type == TransactionType.EXPENSE,
        ).all()

        last_txns = db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.date >= last_month_start,
            Transaction.date < current_month_start,
            Transaction.type == TransactionType.EXPENSE,
        ).all()

        current_by_cat = defaultdict(float)
        for t in current_txns:
            current_by_cat[t.category.value] += t.amount

        last_by_cat = defaultdict(float)
        for t in last_txns:
            last_by_cat[t.category.value] += t.amount

        insights = []
        total_current = sum(current_by_cat.values())

        # Insight: Biggest spending category
        if current_by_cat:
            top_cat = max(current_by_cat, key=current_by_cat.get)
            top_pct = (current_by_cat[top_cat] / total_current * 100) if total_current > 0 else 0
            insights.append({
                "type": "warning" if top_pct > 35 else "general",
                "text": f"Your biggest expense this month is {top_cat} at {top_pct:.0f}% of total spending.",
                "category": top_cat,
                "value": current_by_cat[top_cat],
            })

        # Insight: Month-over-month changes
        for cat in current_by_cat:
            if cat in last_by_cat and last_by_cat[cat] > 0:
                change_pct = (current_by_cat[cat] - last_by_cat[cat]) / last_by_cat[cat] * 100
                if change_pct > 20:
                    insights.append({
                        "type": "alert",
                        "text": f"Your {cat} expenses increased by {change_pct:.0f}% compared to last month.",
                        "category": cat,
                        "value": change_pct,
                    })
                elif change_pct < -20:
                    insights.append({
                        "type": "achievement",
                        "text": f"Great job! You reduced {cat} spending by {abs(change_pct):.0f}% this month.",
                        "category": cat,
                        "value": change_pct,
                    })

        # Insight: Entertainment vs Food comparison
        entertainment = current_by_cat.get("Entertainment", 0)
        food = current_by_cat.get("Food", 0)
        if entertainment > food and food > 0:
            insights.append({
                "type": "warning",
                "text": f"You spent more on Entertainment (KES {entertainment:,.0f}) than Food (KES {food:,.0f}) this month.",
                "category": "Entertainment",
                "value": entertainment,
            })

        # Savings tip
        profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == user_id).first()
        if profile and total_current > 0:
            income = profile.total_monthly_income
            if income > 0 and total_current > income * 0.8:
                potential_save = total_current * 0.1
                insights.append({
                    "type": "tip",
                    "text": f"You could save an additional KES {potential_save:,.0f} monthly by reducing non-essential spending by 10%.",
                    "category": "Savings",
                    "value": potential_save,
                })

        return insights[:8]  # Return top 8 insights

    @staticmethod
    def get_income_trends(db: Session, user_id: int, months: int = 6) -> List[Dict]:
        """Get income and expense trends over N months."""
        now = datetime.utcnow()
        trends = []

        for i in range(months - 1, -1, -1):
            target = now.replace(day=1) - timedelta(days=i * 30)
            month_start = target.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            if target.month == 12:
                month_end = datetime(target.year + 1, 1, 1)
            else:
                month_end = datetime(target.year, target.month + 1, 1)

            txns = db.query(Transaction).filter(
                Transaction.user_id == user_id,
                Transaction.date >= month_start,
                Transaction.date < month_end,
            ).all()

            income = sum(t.amount for t in txns if t.type == TransactionType.INCOME)
            expenses = sum(t.amount for t in txns if t.type == TransactionType.EXPENSE)

            trends.append({
                "month": month_start.strftime("%b %Y"),
                "income": income,
                "expenses": expenses,
                "savings": income - expenses,
            })

        return trends
