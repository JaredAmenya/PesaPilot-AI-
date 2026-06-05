# 🚀 PesaPilot AI: Your Personal Financial Co-Pilot

Welcome to **PesaPilot AI**, the intelligent financial companion built specifically for the Kenyan context. This guide explains how the platform works and how it solves the most common day-to-day challenges in personal finance.

---

## 🎯 The Day-to-Day Challenges We Solve

Managing money can feel overwhelming. Financial data is often scattered across different apps, statements, and mental notes. PesaPilot tackles these real-world problems head-on:

### 1. The "Where Did My Money Go?" Problem
> **Challenge:** You receive your salary via bank or M-Pesa, pay bills, buy groceries, send money to relatives, and suddenly, you're out of cash. Tracking every single shilling manually is exhausting.
> 
> **How PesaPilot Solves It:** 
> **Automated M-Pesa Import.** Instead of typing every transaction, simply download your M-Pesa statement as a CSV and upload it. PesaPilot automatically parses, cleans, and categorizes your transactions (e.g., KPLC, Safaricom data, Send Money). You instantly get a visual breakdown of your spending habits.

### 2. The Budgeting Struggle
> **Challenge:** Creating a budget is easy; sticking to it is hard. Most people don't know how much they should be allocating to different areas of their life.
> 
> **How PesaPilot Solves It:** 
> **The 50/30/20 Rule, Automated.** The dashboard automatically categorizes your spending into Needs (50%), Wants (30%), and Savings (20%). Visual donut charts and progress bars show you instantly if you are overspending on "Wants" before the month ends.

### 3. Lack of Personalized Financial Advice
> **Challenge:** Professional financial advisors are expensive. Generic advice online ("stop buying coffee") doesn't apply to your specific situation or the local context.
> 
> **How PesaPilot Solves It:** 
> **GPT-4o Powered AI Advisor.** PesaPilot features an embedded AI chat that *understands your actual data*. You can ask, *"Can I afford to go to Mombasa this weekend?"* The AI will look at your current balance, your monthly burn rate, and your upcoming goals to give you a realistic, personalized answer.

### 4. Vague Savings Goals
> **Challenge:** Saving without a clear target often leads to dipping into savings for everyday expenses.
> 
> **How PesaPilot Solves It:** 
> **Smart Goal Planning & Projections.** You can create specific goals (e.g., "Emergency Fund", "New Laptop"). PesaPilot tracks your progress and uses predictive analytics to project *exactly* when you will hit your target based on your current savings rate (6-month, 1-year, and 5-year forecasts).

---

## ⚙️ How It Works (The Mechanics)

PesaPilot is a full-stack application designed for speed, security, and intelligence.

### The User Flow
1. **Onboarding:** When you sign up, you provide your basic financial profile (monthly income, fixed expenses).
2. **Dashboard Overview:** You land on the Smart Dashboard, which calculates your **Financial Health Score (0-100)** based on your savings rate, emergency fund status, and budget adherence.
3. **Data Intake:** You add data via the **Transactions** page, either manually or via bulk M-Pesa CSV import.
4. **Analysis:** The system recalculates your metrics in real-time. If you hit a milestone (like reaching 10% of a goal), the dashboard reflects this.
5. **AI Interaction:** You navigate to the **AI Insights** page. The backend securely bundles your recent transactions, current goals, and health score, sending it to OpenAI. The AI returns contextual insights, highlighting spending anomalies (e.g., "You spent 15% more on entertainment this week").

### Under the Hood
- **Frontend (React/TypeScript):** Provides a beautiful, responsive, dark-mode-first interface. It uses Framer Motion for smooth transitions, making financial tracking feel premium and engaging rather than like a chore.
- **Backend (FastAPI/Python):** Acts as the brain. It handles the heavy lifting of parsing M-Pesa CSVs, calculating complex financial projections, and safely interacting with the OpenAI API.
- **Database (PostgreSQL):** Securely stores your encrypted data, ensuring that your financial history is safe, structured, and instantly retrievable.

---

## 🏆 Key Benefits at a Glance

| Feature | Day-to-Day Benefit |
|---------|-------------------|
| **Emergency Fund Tracker** | Gives you peace of mind by aiming for 6x your monthly expenses. |
| **Custom Local Categories** | Tracks SACCO contributions, Chama payments, and mobile money fees accurately. |
| **Health Score** | Gamifies your finances. A single number tells you if you are doing well or need to cut back. |
| **Privacy First** | Your financial data is securely stored and processed. AI interactions only use necessary context. |

## 💡 Pro Tip for New Users
Start by uploading your last month's M-Pesa statement. Within 30 seconds, the AI will generate a complete analysis of your spending habits and suggest a baseline budget for this month!
