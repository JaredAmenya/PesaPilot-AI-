import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Wallet, Target, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react'
import {
  AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, Tooltip, BarChart, Bar
} from 'recharts'
import { profileApi, transactionApi, goalsApi } from '../lib/api'
import { formatKES, getHealthScoreColor, getHealthScoreLabel, getCategoryEmoji } from '../lib/utils'
import { Link } from 'react-router-dom'

const CATEGORY_COLORS = [
  '#7c3aed', '#10b981', '#3b82f6', '#f59e0b', '#ef4444',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#a855f7',
]

function HealthScoreGauge({ score }: { score: number }) {
  const color = getHealthScoreColor(score)
  const label = getHealthScoreLabel(score)
  const circumference = 2 * Math.PI * 54
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
          {/* Progress circle */}
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1.5s ease', filter: `drop-shadow(0 0 8px ${color}50)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color, fontFamily: 'Space Grotesk' }}>{score}</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/ 100</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <div className="text-sm font-bold" style={{ color }}>{label}</div>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Financial Health</div>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl px-4 py-3 text-sm"
        style={{ background: '#1a1a3a', border: '1px solid var(--border)', boxShadow: 'var(--shadow-elevated)' }}>
        <p className="font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex gap-3">
            <span style={{ color: p.color }}>{p.name}:</span>
            <span className="font-semibold">{formatKES(p.value)}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const { data: healthData } = useQuery({
    queryKey: ['health-score'],
    queryFn: () => profileApi.healthScore().then(r => r.data),
  })

  const { data: trendsData } = useQuery({
    queryKey: ['trends'],
    queryFn: () => profileApi.trends(6).then(r => r.data),
  })

  const { data: monthlyData } = useQuery({
    queryKey: ['monthly'],
    queryFn: () => profileApi.monthly().then(r => r.data),
  })

  const { data: goalsData } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalsApi.list().then(r => r.data),
  })

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.get().then(r => r.data),
    retry: false,
  })

  const score = healthData?.score ?? 72
  const totalIncome = monthlyData?.total_income ?? profileData?.total_monthly_income ?? 0
  const totalExpenses = monthlyData?.total_expenses ?? 0
  const netSavings = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome * 100) : 0

  const categoryData = Object.entries(monthlyData?.by_category ?? {})
    .map(([name, value]) => ({ name, value: value as number }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  const activeGoals = (goalsData ?? []).filter((g: any) => g.status === 'active').slice(0, 3)

  const statsCards = [
    {
      label: 'Total Income',
      value: formatKES(totalIncome),
      icon: TrendingUp,
      color: '#10b981',
      trend: '+12%',
      up: true,
      gradient: 'var(--gradient-emerald)',
    },
    {
      label: 'Total Expenses',
      value: formatKES(totalExpenses),
      icon: TrendingDown,
      color: '#ef4444',
      trend: '-3%',
      up: false,
      gradient: 'var(--gradient-danger)',
    },
    {
      label: 'Net Savings',
      value: formatKES(netSavings),
      icon: Wallet,
      color: '#7c3aed',
      trend: `${savingsRate.toFixed(0)}% rate`,
      up: netSavings > 0,
      gradient: 'var(--gradient-brand)',
    },
    {
      label: 'Active Goals',
      value: `${(goalsData ?? []).filter((g: any) => g.status === 'active').length}`,
      icon: Target,
      color: '#f59e0b',
      trend: 'In progress',
      up: true,
      gradient: 'var(--gradient-amber)',
    },
  ]

  return (
    <div className="page-container">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="stat-card"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${card.color}18` }}
              >
                <card.icon size={18} style={{ color: card.color }} />
              </div>
              <span
                className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
                style={{
                  background: card.up ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  color: card.up ? '#10b981' : '#ef4444',
                }}
              >
                {card.up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                {card.trend}
              </span>
            </div>
            <div className="text-2xl font-bold mb-1" style={{ fontFamily: 'Space Grotesk' }}>
              {card.value}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Income vs Expenses Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Income vs Expenses</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>6-month trend</p>
            </div>
            <Link to="/projections" className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--purple-light)' }}>
              View projections →
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendsData ?? []}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" fill="url(#incomeGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#7c3aed" fill="url(#expenseGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Health Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass-card p-6 flex flex-col items-center justify-center"
        >
          <HealthScoreGauge score={score} />
          <div className="w-full mt-6 space-y-2">
            {healthData?.breakdown && Object.entries(healthData.breakdown).map(([key, val]: any) => (
              <div key={key} className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--text-muted)' }}>
                  {key.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(val.score / val.max) * 100}%`,
                        background: 'var(--gradient-brand)',
                      }}
                    />
                  </div>
                  <span className="font-medium">{val.score}/{val.max}</span>
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/advisor"
            className="btn-brand w-full justify-center mt-4 text-xs py-2"
            style={{ fontSize: '12px', padding: '8px 16px' }}
          >
            <Zap size={13} /> Get AI Advice
          </Link>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Spending by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="font-semibold mb-4">Spending by Category</h3>
          {categoryData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                    dataKey="value" stroke="none">
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {categoryData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {getCategoryEmoji(item.name)} {item.name}
                      </span>
                    </div>
                    <span className="font-semibold">{formatKES(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <p style={{ color: 'var(--text-muted)' }}>No expense data yet</p>
              <Link to="/transactions" className="btn-brand mt-3 text-xs" style={{ fontSize: '12px', padding: '6px 16px' }}>
                Add Transaction
              </Link>
            </div>
          )}
        </motion.div>

        {/* Goals Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Goal Progress</h3>
            <Link to="/goals" className="text-xs" style={{ color: 'var(--purple-light)' }}>View all →</Link>
          </div>
          {activeGoals.length > 0 ? (
            <div className="space-y-4">
              {activeGoals.map((goal: any) => (
                <div key={goal.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium">{goal.name}</span>
                    <span className="text-xs font-bold" style={{ color: 'var(--purple-light)' }}>
                      {goal.progress_percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'var(--gradient-brand)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress_percentage}%` }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>{formatKES(goal.current_amount)}</span>
                    <span>{formatKES(goal.target_amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <p style={{ color: 'var(--text-muted)' }}>No goals set yet</p>
              <Link to="/goals" className="btn-brand mt-3" style={{ fontSize: '12px', padding: '6px 16px' }}>
                Create Goal
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
