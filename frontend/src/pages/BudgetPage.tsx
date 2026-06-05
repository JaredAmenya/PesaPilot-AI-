import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { profileApi } from '../lib/api'
import { formatKES } from '../lib/utils'

const DEFAULT_BUDGET = { needs_percentage: 50, wants_percentage: 30, savings_percentage: 20 }

const NEEDS_CATEGORIES = ['Rent', 'Food', 'Utilities', 'Healthcare', 'Transport']
const WANTS_CATEGORIES = ['Entertainment', 'Shopping', 'Education']
const SAVINGS_CATEGORIES = ['Savings', 'Investments']

function BudgetRing({ label, percentage, amount, color, spent }: {
  label: string, percentage: number, amount: number, color: string, spent: number
}) {
  const data = [{ value: spent }, { value: Math.max(0, amount - spent) }]
  const overBudget = spent > amount

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 flex flex-col items-center"
    >
      <div className="relative w-32 h-32 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={46} outerRadius={62}
              dataKey="value" startAngle={90} endAngle={-270} stroke="none">
              <Cell fill={overBudget ? '#ef4444' : color} />
              <Cell fill="rgba(255,255,255,0.05)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk', color }}>
            {percentage}%
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
        </div>
      </div>
      <div className="text-center w-full">
        <div className="text-lg font-bold mb-1">{formatKES(amount)}</div>
        <div className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Budget allocation</div>
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(100, amount > 0 ? (spent / amount) * 100 : 0)}%`,
              background: overBudget ? '#ef4444' : color,
            }} />
        </div>
        <div className="flex justify-between mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>Spent: {formatKES(spent)}</span>
          <span className={overBudget ? 'text-red-400 font-bold' : ''}>
            {overBudget ? `+${formatKES(spent - amount)} over` : `${formatKES(amount - spent)} left`}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default function BudgetPage() {
  const qc = useQueryClient()
  const [customPct, setCustomPct] = useState({ needs: 50, wants: 30, savings: 20 })
  const [showCustomize, setShowCustomize] = useState(false)
  const [error, setError] = useState('')

  const { data: budget } = useQuery({
    queryKey: ['budget'],
    queryFn: () => profileApi.budget().then(r => r.data),
  })

  const { data: monthly } = useQuery({
    queryKey: ['monthly'],
    queryFn: () => profileApi.monthly().then(r => r.data),
  })

  const { data: adviceData } = useQuery({
    queryKey: ['budget-advice'],
    queryFn: () => import('../lib/api').then(m => m.aiApi.budgetAdvice()).then(r => r.data),
  })

  const saveBudget = useMutation({
    mutationFn: () => {
      const total = customPct.needs + customPct.wants + customPct.savings
      if (Math.abs(total - 100) > 0.1) {
        setError('Percentages must sum to 100%')
        throw new Error('Invalid percentages')
      }
      setError('')
      const now = new Date()
      return profileApi.createBudget({
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        needs_percentage: customPct.needs,
        wants_percentage: customPct.wants,
        savings_percentage: customPct.savings,
        is_custom: true,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budget'] })
      setShowCustomize(false)
    },
  })

  const totalIncome = budget?.total_income ?? 0
  const needsPct = budget?.needs_percentage ?? 50
  const wantsPct = budget?.wants_percentage ?? 30
  const savingsPct = budget?.savings_percentage ?? 20

  const needsAmount = totalIncome * (needsPct / 100)
  const wantsAmount = totalIncome * (wantsPct / 100)
  const savingsAmount = totalIncome * (savingsPct / 100)

  // Calculate spent per bucket
  const byCategory = monthly?.by_category ?? {}
  const needsSpent = NEEDS_CATEGORIES.reduce((s, c) => s + (byCategory[c] ?? 0), 0)
  const wantsSpent = WANTS_CATEGORIES.reduce((s, c) => s + (byCategory[c] ?? 0), 0)
  const savingsSpent = SAVINGS_CATEGORIES.reduce((s, c) => s + (byCategory[c] ?? 0), 0)

  return (
    <div className="page-container">
      {/* Title + customize */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Monthly income: <strong style={{ color: 'var(--text-primary)' }}>{formatKES(totalIncome)}</strong>
          </p>
        </div>
        <button
          id="customize-budget-btn"
          onClick={() => setShowCustomize(!showCustomize)}
          className="btn-secondary text-sm"
        >
          ⚙️ Customize Percentages
        </button>
      </div>

      {/* Customize Panel */}
      <AnimatePresence>
        {showCustomize && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="glass-card p-6 mb-6"
          >
            <h3 className="font-semibold mb-4">Customize Budget Split</h3>
            <div className="grid grid-cols-3 gap-4">
              {(['needs', 'wants', 'savings'] as const).map(key => (
                <div key={key}>
                  <label className="block text-xs font-medium mb-2 capitalize" style={{ color: 'var(--text-secondary)' }}>
                    {key} (%)
                  </label>
                  <input
                    id={`${key}-pct`}
                    type="number"
                    min={0} max={100}
                    value={customPct[key]}
                    onChange={e => setCustomPct({ ...customPct, [key]: parseFloat(e.target.value) || 0 })}
                    className="input-field text-center"
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm" style={{ color: customPct.needs + customPct.wants + customPct.savings === 100 ? '#10b981' : '#ef4444' }}>
                Total: {customPct.needs + customPct.wants + customPct.savings}%
                {customPct.needs + customPct.wants + customPct.savings === 100 ? ' ✓' : ' (must be 100%)'}
              </span>
              {error && <span className="text-xs text-red-400">{error}</span>}
              <button onClick={() => saveBudget.mutate()} className="btn-brand text-sm py-2 px-4">
                Save Budget
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Budget Rings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <BudgetRing label="Needs" percentage={needsPct} amount={needsAmount}
          color="#3b82f6" spent={needsSpent} />
        <BudgetRing label="Wants" percentage={wantsPct} amount={wantsAmount}
          color="#a855f7" spent={wantsSpent} />
        <BudgetRing label="Savings" percentage={savingsPct} amount={savingsAmount}
          color="#10b981" spent={savingsSpent} />
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Needs', categories: NEEDS_CATEGORIES, color: '#3b82f6', spent: needsSpent, budget: needsAmount },
          { label: 'Wants', categories: WANTS_CATEGORIES, color: '#a855f7', spent: wantsSpent, budget: wantsAmount },
          { label: 'Savings', categories: SAVINGS_CATEGORIES, color: '#10b981', spent: savingsSpent, budget: savingsAmount },
        ].map(bucket => (
          <div key={bucket.label} className="glass-card p-4">
            <h4 className="text-sm font-semibold mb-3" style={{ color: bucket.color }}>{bucket.label} Categories</h4>
            {bucket.categories.map(cat => (
              <div key={cat} className="flex justify-between text-xs py-1.5 border-b last:border-0"
                style={{ borderColor: 'var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{cat}</span>
                <span className="font-medium">{formatKES(byCategory[cat] ?? 0)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* AI Advice */}
      {adviceData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
          style={{ borderColor: 'rgba(124,58,237,0.2)', background: 'rgba(124,58,237,0.04)' }}
        >
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
              style={{ background: 'rgba(124,58,237,0.15)' }}>🤖</div>
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--purple-light)' }}>
                AI Budget Recommendations
              </p>
              <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                {adviceData.advice}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
