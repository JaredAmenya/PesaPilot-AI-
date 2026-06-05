# 🚀 PesaPilot AI — AI-Powered Personal Finance Advisor

> A premium fintech application for the Kenyan market. Built with FastAPI, React, PostgreSQL, and OpenAI GPT-4o.

![PesaPilot AI](https://img.shields.io/badge/PesaPilot-AI%20Finance-7c3aed?style=for-the-badge&logo=zap)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square)

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 AI Financial Advisor | GPT-4o-powered chat advisor with full financial context |
| 📊 Smart Dashboard | Real-time spending overview, charts, and health score |
| 💰 Expense Tracking | Full CRUD with category filtering and M-Pesa import |
| 📱 M-Pesa Import | Parse and categorize M-Pesa CSV statements |
| 🎯 Goal Planner | Track savings goals with timeline projections |
| 📈 50/30/20 Budgeting | Visual donut rings with custom percentages |
| 🔮 Future Projections | 6-month, 1-year, 5-year savings forecasts |
| 🛡️ Emergency Fund | 6x monthly expense target tracker |
| 💡 AI Insights | Automatic spending pattern analysis |
| 🏆 Health Score | 0-100 financial wellness score |

---

## 🏗️ Architecture

```
pesapilot-ai/
├── backend/            # FastAPI + Python 3.12
│   ├── app/
│   │   ├── api/        # Route handlers
│   │   ├── core/       # Config, security, DB
│   │   ├── models/     # SQLAlchemy ORM
│   │   ├── schemas/    # Pydantic validation
│   │   └── services/   # AI, analytics, projections
│   └── alembic/        # DB migrations
├── frontend/           # React 18 + TypeScript
│   └── src/
│       ├── pages/      # 10 app pages
│       ├── components/ # Reusable UI
│       ├── stores/     # Zustand state
│       └── lib/        # API client + utils
└── docker-compose.yml  # Full stack orchestration
```

---

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# 1. Clone and enter the project
cd pesapilot-ai

# 2. Copy environment variables
cp .env.example .env

# 3. Add your OpenAI API key (optional, app works without it)
# Edit .env and set OPENAI_API_KEY=sk-...

# 4. Start everything
docker-compose up -d

# 5. Open the app
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Local Development

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Set up PostgreSQL (or use Docker for just DB)
docker run -d --name pesapilot_db \
  -e POSTGRES_PASSWORD=pesapilot_secret \
  -e POSTGRES_USER=pesapilot \
  -e POSTGRES_DB=pesapilot \
  -p 5432:5432 postgres:16-alpine

# Copy and edit environment
cp ../.env.example .env

# Run the server
uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# App available at http://localhost:3000
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection URL | `postgresql://pesapilot:pesapilot_secret@db:5432/pesapilot` |
| `SECRET_KEY` | JWT signing secret (change in production!) | `change-this-key` |
| `OPENAI_API_KEY` | OpenAI API key (optional) | — |
| `OPENAI_MODEL` | OpenAI model to use | `gpt-4o` |
| `BACKEND_CORS_ORIGINS` | Allowed frontend origins | `["http://localhost:3000"]` |

> **Without an OpenAI key**: The app runs in **demo mode** with smart analytics-based insights. All features work — only AI responses use mock data.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Sign in |
| `POST` | `/api/profile/onboarding` | Save financial profile |
| `GET` | `/api/profile/health-score` | Get financial health score |
| `GET` | `/api/profile/emergency-fund` | Emergency fund status |
| `GET/POST` | `/api/transactions/` | List / create transactions |
| `GET/POST` | `/api/goals/` | List / create goals |
| `POST` | `/api/goals/{id}/contribute` | Add goal contribution |
| `GET` | `/api/ai/insights` | AI spending insights |
| `POST` | `/api/ai/chat` | Chat with AI advisor |
| `GET` | `/api/projections/` | Financial projections |
| `POST` | `/api/import/mpesa` | Import M-Pesa CSV |

Full docs at `http://localhost:8000/docs` (Swagger UI)

---

## 💳 M-Pesa Statement Import

1. Open **MySafaricom app** or **M-Pesa self-care portal**
2. Download your statement as **CSV**
3. Go to **Transactions** page in PesaPilot
4. Click **Import M-Pesa** and upload the CSV
5. Transactions are automatically categorized

Expected CSV format:
```csv
Date,Description,Paid In,Withdrawn,Balance
06/05/2025,Transfer from John Doe,5000,,15000
06/04/2025,Safaricom KPLC,,2500,10000
```

---

## 🏦 Kenya-Specific Features

- **KES currency** throughout the app
- **M-Pesa** statement import with auto-categorization
- **Airtel Money** statement import
- **SACCO** and **Chama** transaction categories
- Local financial context in AI advice

---

## 🎨 Design System

- **Dark mode** first with glassmorphism cards
- **Color palette**: Deep navy + Electric purple + Emerald green
- **Typography**: Space Grotesk (headings) + Inter (body)
- **Animations**: Framer Motion transitions + micro-animations
- **Charts**: Recharts with custom dark-mode styling

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | FastAPI 0.115, Python 3.12, Uvicorn |
| **Database** | PostgreSQL 16, SQLAlchemy 2.0, Alembic |
| **Auth** | JWT (jose), bcrypt |
| **AI** | OpenAI Python SDK 1.x, GPT-4o |
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | TailwindCSS v4, Framer Motion |
| **State** | Zustand, TanStack Query |
| **Charts** | Recharts |
| **Deployment** | Docker Compose |

---

## 🔐 Security

- JWT access tokens (60 min) + refresh tokens (30 days)
- bcrypt password hashing
- CORS restrictions
- Input validation via Pydantic

---

Built with ❤️ for Kenya 🇰🇪
