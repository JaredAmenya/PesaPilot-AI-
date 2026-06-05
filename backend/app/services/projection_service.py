from typing import List, Dict
from datetime import datetime, timedelta
from app.models.profile import FinancialProfile


class ProjectionService:

    @staticmethod
    def generate_projections(
        monthly_income: float,
        monthly_expenses: float,
        current_savings: float,
        annual_return_rate: float = 0.08,  # 8% annual return (conservative)
    ) -> Dict:
        """Generate 6-month, 1-year, and 5-year financial projections."""
        monthly_savings = max(0, monthly_income - monthly_expenses)
        monthly_return_rate = annual_return_rate / 12

        projections = {
            "six_months": [],
            "one_year": [],
            "five_years": [],
            "summary": {},
        }

        # 6-month projection (monthly data)
        balance = current_savings
        for month in range(1, 7):
            balance = balance * (1 + monthly_return_rate) + monthly_savings
            date = datetime.utcnow() + timedelta(days=month * 30)
            projections["six_months"].append({
                "month": date.strftime("%b %Y"),
                "balance": round(balance, 2),
                "contributions": round(monthly_savings * month, 2),
                "interest": round(balance - current_savings - monthly_savings * month, 2),
            })

        # 1-year projection (monthly data)
        balance = current_savings
        for month in range(1, 13):
            balance = balance * (1 + monthly_return_rate) + monthly_savings
            date = datetime.utcnow() + timedelta(days=month * 30)
            projections["one_year"].append({
                "month": date.strftime("%b %Y"),
                "balance": round(balance, 2),
                "contributions": round(monthly_savings * month, 2),
                "interest": round(balance - current_savings - monthly_savings * month, 2),
            })

        # 5-year projection (quarterly data)
        balance = current_savings
        for quarter in range(1, 21):  # 20 quarters = 5 years
            for _ in range(3):
                balance = balance * (1 + monthly_return_rate) + monthly_savings
            date = datetime.utcnow() + timedelta(days=quarter * 90)
            projections["five_years"].append({
                "month": date.strftime("Q%q '%y").replace(
                    "Q1", "Q1").replace("Q2", "Q2").replace("Q3", "Q3").replace("Q4", "Q4"),
                "label": date.strftime("%b %Y"),
                "balance": round(balance, 2),
                "contributions": round(monthly_savings * quarter * 3, 2),
                "interest": round(balance - current_savings - monthly_savings * quarter * 3, 2),
            })

        # Summary
        final_6m = projections["six_months"][-1]["balance"] if projections["six_months"] else current_savings
        final_1y = projections["one_year"][-1]["balance"] if projections["one_year"] else current_savings
        final_5y = projections["five_years"][-1]["balance"] if projections["five_years"] else current_savings

        projections["summary"] = {
            "current_savings": current_savings,
            "monthly_savings": monthly_savings,
            "savings_rate": (monthly_savings / monthly_income * 100) if monthly_income > 0 else 0,
            "projected_6m": final_6m,
            "projected_1y": final_1y,
            "projected_5y": final_5y,
            "growth_6m": round(((final_6m - current_savings) / current_savings * 100) if current_savings > 0 else 0, 1),
            "growth_1y": round(((final_1y - current_savings) / current_savings * 100) if current_savings > 0 else 0, 1),
            "growth_5y": round(((final_5y - current_savings) / current_savings * 100) if current_savings > 0 else 0, 1),
        }

        return projections

    @staticmethod
    def calculate_goal_timeline(
        target_amount: float,
        current_amount: float,
        monthly_contribution: float,
        annual_return_rate: float = 0.06,
    ) -> Dict:
        """Calculate how long to reach a goal."""
        if monthly_contribution <= 0:
            return {"months": None, "feasible": False}

        remaining = target_amount - current_amount
        monthly_rate = annual_return_rate / 12

        if monthly_rate == 0:
            months = remaining / monthly_contribution
        else:
            import math
            try:
                months = math.log(1 + remaining * monthly_rate / monthly_contribution) / math.log(1 + monthly_rate)
            except (ValueError, ZeroDivisionError):
                months = remaining / monthly_contribution

        return {
            "months": round(months),
            "years": round(months / 12, 1),
            "completion_date": datetime.utcnow() + timedelta(days=months * 30),
            "feasible": months < 600,  # ~50 years max
        }
