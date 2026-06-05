from openai import AsyncOpenAI, OpenAI
from typing import List, Dict, AsyncIterator, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import json

from app.core.config import settings
from app.models.transaction import Transaction, TransactionType
from app.models.goal import Goal, GoalStatus
from app.models.profile import FinancialProfile
from app.services.analytics_service import AnalyticsService


MOCK_INSIGHTS = [
    {
        "type": "warning",
        "text": "You spent 24% of your income on entertainment this month. Consider reducing to 10-15% to hit your savings goals faster.",
        "category": "Entertainment",
    },
    {
        "type": "tip",
        "text": "You could save an additional KES 8,500 monthly by reducing non-essential spending. This would accelerate your car savings goal by 4 months.",
        "category": "Savings",
    },
    {
        "type": "achievement",
        "text": "Your food expenses decreased by 12% compared to last month. Great discipline!",
        "category": "Food",
    },
    {
        "type": "alert",
        "text": "Your transport costs increased by 11% compared to last month. Review your Uber/taxi usage.",
        "category": "Transport",
    },
    {
        "type": "general",
        "text": "Based on your current savings rate, you'll reach your emergency fund goal in approximately 8 months.",
        "category": "Emergency Fund",
    },
]

MOCK_ADVISOR_RESPONSES = [
    "Based on your spending patterns, I can see you're allocating a significant portion of income to discretionary spending. Here's my advice: try the 50/30/20 rule — 50% for needs (rent, food, utilities), 30% for wants (entertainment, dining out), and 20% for savings and debt repayment.",
    "Your financial health score indicates there's room for improvement. The biggest opportunity I see is increasing your savings rate. Even saving an extra KES 2,000-3,000 per month would significantly accelerate your goals.",
    "Looking at your transaction history, your weekend spending accounts for a disproportionate share of your entertainment budget. Consider setting a weekly spending limit for discretionary expenses.",
    "Great question! For your car savings goal, I recommend setting up an automatic transfer to a dedicated savings account on payday. This 'pay yourself first' strategy is one of the most effective wealth-building habits.",
]


def build_financial_context(db: Session, user_id: int) -> str:
    """Build rich financial context string for AI prompts."""
    now = datetime.utcnow()
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == user_id).first()

    # Last 30 days transactions
    last_month = now - timedelta(days=30)
    recent_txns = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.date >= last_month,
    ).all()

    goals = db.query(Goal).filter(
        Goal.user_id == user_id,
        Goal.status == GoalStatus.ACTIVE,
    ).all()

    health = AnalyticsService.calculate_health_score(db, user_id)
    monthly_summary = AnalyticsService.get_monthly_summary(db, user_id, now.month, now.year)

    context = f"""
USER FINANCIAL PROFILE:
- Monthly Salary: KES {profile.monthly_salary:,.0f if profile else 0}
- Additional Income: KES {profile.additional_income:,.0f if profile else 0}
- Total Monthly Income: KES {profile.total_monthly_income:,.0f if profile else 0}
- Existing Savings: KES {profile.existing_savings:,.0f if profile else 0}
- Existing Debts: KES {profile.existing_debts:,.0f if profile else 0}

CURRENT MONTH SUMMARY:
- Total Income: KES {monthly_summary['total_income']:,.0f}
- Total Expenses: KES {monthly_summary['total_expenses']:,.0f}
- Net Savings: KES {monthly_summary['net_savings']:,.0f}
- Savings Rate: {monthly_summary['savings_rate']:.1f}%
- Spending by Category: {json.dumps(monthly_summary['by_category'], indent=2)}

FINANCIAL HEALTH SCORE: {health['score']}/100 ({health['label']})
- Savings Rate Score: {health['breakdown'].get('savings_rate', {}).get('score', 0)}/30
- Spending Discipline: {health['breakdown'].get('spending_discipline', {}).get('score', 0)}/25
- Emergency Fund: {health['breakdown'].get('emergency_fund', {}).get('score', 0)}/20
- Debt Ratio: {health['breakdown'].get('debt_ratio', {}).get('score', 0)}/15
- Goal Progress: {health['breakdown'].get('goal_progress', {}).get('score', 0)}/10

ACTIVE FINANCIAL GOALS:
{chr(10).join([f"- {g.name}: KES {g.current_amount:,.0f} / KES {g.target_amount:,.0f} ({g.progress_percentage:.0f}% complete)" for g in goals]) if goals else "No active goals set."}

RECENT TRANSACTIONS (last 30 days): {len(recent_txns)} transactions
"""
    return context.strip()


class AIService:
    def __init__(self):
        self.has_api_key = bool(settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != "sk-your-openai-api-key-here")
        if self.has_api_key:
            self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            self.sync_client = OpenAI(api_key=settings.OPENAI_API_KEY)

    SYSTEM_PROMPT = """You are PesaPilot AI, an expert personal finance advisor specializing in the Kenyan market.

Your role:
- Analyze user financial data and provide personalized, actionable advice
- Speak in a warm, professional, and encouraging tone
- Reference specific numbers from the user's data (always in KES)
- Give concrete recommendations, not generic advice
- Be aware of Kenya-specific context: M-Pesa, SACCOs, Chamas, NSE
- Keep responses concise (2-3 paragraphs max) unless a detailed breakdown is requested

Important guidelines:
- Always acknowledge the user's specific situation before giving advice
- Celebrate wins (reduced spending, goal progress, savings milestones)
- Be direct about financial risks but not alarmist
- Suggest specific, actionable next steps
- Reference the 50/30/20 budget rule when relevant"""

    async def generate_insights(self, db: Session, user_id: int) -> List[Dict]:
        """Generate AI-powered spending insights."""
        if not self.has_api_key:
            return MOCK_INSIGHTS

        try:
            context = build_financial_context(db, user_id)
            response = await self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": self.SYSTEM_PROMPT},
                    {
                        "role": "user",
                        "content": f"""Based on this financial data, generate 5 specific, personalized insights:

{context}

Return a JSON array of insights. Each insight must have:
- type: "warning" | "tip" | "achievement" | "alert" | "general"
- text: specific insight with actual KES numbers
- category: spending category this relates to

Respond ONLY with valid JSON array, no extra text.""",
                    },
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
            )

            content = response.choices[0].message.content
            data = json.loads(content)
            insights = data.get("insights", data) if isinstance(data, dict) else data
            return insights[:8]

        except Exception as e:
            return MOCK_INSIGHTS

    async def chat(self, db: Session, user_id: int, message: str, history: List[Dict]) -> str:
        """AI advisor chat - returns full response."""
        if not self.has_api_key:
            import random
            return random.choice(MOCK_ADVISOR_RESPONSES)

        try:
            context = build_financial_context(db, user_id)
            messages = [
                {
                    "role": "system",
                    "content": f"{self.SYSTEM_PROMPT}\n\nUSER FINANCIAL CONTEXT:\n{context}",
                }
            ]

            # Add conversation history
            for h in history[-10:]:  # Last 10 messages for context
                messages.append({"role": h["role"], "content": h["content"]})

            messages.append({"role": "user", "content": message})

            response = await self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=messages,
                temperature=0.75,
                max_tokens=600,
            )
            return response.choices[0].message.content

        except Exception as e:
            return f"I'm having trouble connecting right now. Please check your API configuration. Error: {str(e)}"

    async def generate_budget_advice(self, db: Session, user_id: int) -> str:
        """Generate personalized budget recommendations."""
        if not self.has_api_key:
            return "Based on your income and spending patterns, I recommend following the 50/30/20 rule. Allocate 50% to essentials (rent, food, utilities), 30% to lifestyle (entertainment, dining), and 20% to savings and investments. Your current spending shows opportunities to optimize your entertainment and transport categories."

        try:
            context = build_financial_context(db, user_id)
            response = await self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": self.SYSTEM_PROMPT},
                    {
                        "role": "user",
                        "content": f"Based on this data, provide specific budget recommendations:\n\n{context}\n\nGive practical, numbered recommendations specific to this user's situation.",
                    },
                ],
                temperature=0.7,
                max_tokens=500,
            )
            return response.choices[0].message.content
        except Exception:
            return "Unable to generate personalized advice at this time. Please check your OpenAI API configuration."


ai_service = AIService()
