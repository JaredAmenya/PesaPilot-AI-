import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Target, Calendar, TrendingUp, CheckCircle, Trash2 } from 'lucide-react'
import { goalsApi } from '../lib/api'
import { formatKES, getCategoryEmoji, monthsUntil } from '../lib/utils'
import { format } from 'date-fns'

const GOAL_CATEGORIES = [
  'Buy a Car', 'Buy Land', 'Emergency Fund', 'Start a Business',
  'Save for Travel', 'Education', 'Buy a House', 'Retirement', 'Custom',
]

const GOAL_EMOJIS: Record<string, string> = {
  'Buy a Car': '🚗', 'Buy Land': '🌍', 'Emergency Fund': '🛡️',
  'Start a Business': '🏢', 'Save for Travel': '✈️', 'Education': '🎓',
  'Buy a House': '🏠', 'Retirement': '🌅', 'Custom': '⭐',
}

function GoalCard({ goal, onDelete, onContribute }: { goal: any, onDelete: () => void, onContribute: (amount: number) => void }) {
  const [showContribute, setShowContribute] = useState(false)
  const [amount, setAmount] = useState('')
  const isCompleted = goal.status === 'completed'
  const emoji = GOAL_EMOJIS[goal.category] ?? '⭐'
  const color = isCompleted ? '#10b981' : 'var(--purple)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
      style={isCompleted ? { borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.04)' } : {}}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: `${color}20` }}>
            {emoji}
          </div>
          <div>
            <h3 className="font-semibold">{goal.name}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: isCompleted ? 'rgba(16,185,129,0.15)' : 'rgba(124,58,237,0.15)',
                color: isCompleted ? '#10b981' : 'var(--purple-light)',
              }}>
              {isCompleted ? '✓ Completed' : goal.category}
            </span>
          </div>
        </div>
        <button onClick={onDelete} className="p-2 rounded-lg transition-all hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
          <Trash2 size={14} />
        </button>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm font-semibold mb-2">
          <span style={{ color: 'var(--text-secondary)' }}>Progress</span>
          <span style={{ color }}>{goal.progress_percentage.toFixed(0)}%</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: isCompleted ? 'var(--gradient-emerald)' : 'var(--gradient-brand)' }}
            initial={{ width: 0 }}
            animate={{ width: `${goal.progress_percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>{formatKES(goal.current_amount)} saved</span>
          <span>Target: {formatKES(goal.target_amount)}</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 rounded-xl" style={{ background: 'var(--bg-card)' }}>
          <div className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Monthly needed</div>
          <div className="text-sm font-bold">{goal.required_monthly_savings ? formatKES(goal.required_monthly_savings) : '—'}</div>
        </div>
        <div className="text-center p-2 rounded-xl" style={{ background: 'var(--bg-card)' }}>
          <div className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Months left</div>
          <div className="text-sm font-bold">{goal.months_remaining ?? '—'}</div>
        </div>
        <div className="text-center p-2 rounded-xl" style={{ background: 'var(--bg-card)' }}>
          <div className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Target date</div>
          <div className="text-sm font-bold">{format(new Date(goal.target_date), 'MMM yy')}</div>
        </div>
      </div>

      {/* Contribute */}
      {!isCompleted && (
        <div>
          {showContribute ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
              <input
                type="number" placeholder="Amount (KES)"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="input-field flex-1 text-sm py-2"
              />
              <button
                onClick={() => { onContribute(parseFloat(amount)); setShowContribute(false); setAmount('') }}
                disabled={!amount || parseFloat(amount) <= 0}
                className="btn-brand text-xs py-2 px-4"
              >
                Add
              </button>
              <button onClick={() => setShowContribute(false)} className="btn-secondary text-xs py-2 px-3">
                <X size={14} />
              </button>
            </motion.div>
          ) : (
            <button
              id={`contribute-goal-${goal.id}`}
              onClick={() => setShowContribute(true)}
              className="w-full btn-secondary justify-center text-sm py-2"
            >
              <Plus size={14} /> Add Contribution
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}

function CreateGoalModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    name: '', category: 'Buy a Car', target_amount: '', target_date: '', description: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await goalsApi.create({
        ...form,
        target_amount: parseFloat(form.target_amount),
        target_date: new Date(form.target_date).toISOString(),
      })
      qc.invalidateQueries({ queryKey: ['goals'] })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const monthsToTarget = form.target_date ? monthsUntil(form.target_date) : 0
  const monthlyNeeded = form.target_amount && monthsToTarget > 0
    ? parseFloat(form.target_amount) / monthsToTarget : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: '#0f0f2a', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Create Financial Goal</h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Goal Name</label>
            <input id="goal-name" type="text" placeholder="e.g. Buy a Nissan Note"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="input-field" required />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Category</label>
            <select id="goal-category" value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="input-field">
              {GOAL_CATEGORIES.map(c => <option key={c}>{GOAL_EMOJIS[c]} {c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Target Amount (KES)</label>
              <input id="goal-amount" type="number" placeholder="1,000,000"
                value={form.target_amount} onChange={e => setForm({ ...form, target_amount: e.target.value })}
                className="input-field" required min="1" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Target Date</label>
              <input id="goal-date" type="date"
                value={form.target_date} onChange={e => setForm({ ...form, target_date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="input-field" required />
            </div>
          </div>

          {monthlyNeeded > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="p-3 rounded-xl text-sm"
              style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
              <p style={{ color: 'var(--purple-light)' }}>
                💡 You'll need to save <strong>{formatKES(monthlyNeeded)}/month</strong> to reach this goal in {monthsToTarget} months.
              </p>
            </motion.div>
          )}

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Notes (optional)</label>
            <input type="text" placeholder="Any notes about this goal..."
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="input-field" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button id="save-goal-btn" type="submit" disabled={loading} className="btn-brand flex-1 justify-center">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Target size={16} />}
              Create Goal
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function GoalsPage() {
  const [showModal, setShowModal] = useState(false)
  const qc = useQueryClient()

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalsApi.list().then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => goalsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })

  const contributeMutation = useMutation({
    mutationFn: ({ id, amount }: { id: number, amount: number }) => goalsApi.contribute(id, amount),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })

  const activeGoals = goals.filter((g: any) => g.status === 'active')
  const completedGoals = goals.filter((g: any) => g.status === 'completed')

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-4">
          <div className="px-4 py-2 rounded-xl text-sm"
            style={{ background: 'rgba(124,58,237,0.1)', color: 'var(--purple-light)', border: '1px solid rgba(124,58,237,0.2)' }}>
            {activeGoals.length} Active
          </div>
          <div className="px-4 py-2 rounded-xl text-sm"
            style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
            {completedGoals.length} Completed
          </div>
        </div>
        <button id="create-goal-btn" onClick={() => setShowModal(true)} className="btn-brand">
          <Plus size={16} /> Create Goal
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-64 rounded-2xl shimmer" />)}
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-xl font-bold mb-2">Set your first financial goal</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Goals give your savings purpose. Start planning your dream today.
          </p>
          <button onClick={() => setShowModal(true)} className="btn-brand">
            <Plus size={16} /> Create First Goal
          </button>
        </div>
      ) : (
        <>
          {activeGoals.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Active Goals</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {activeGoals.map((goal: any) => (
                  <GoalCard key={goal.id} goal={goal}
                    onDelete={() => deleteMutation.mutate(goal.id)}
                    onContribute={(amount) => contributeMutation.mutate({ id: goal.id, amount })} />
                ))}
              </div>
            </div>
          )}

          {completedGoals.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                ✓ Completed Goals
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {completedGoals.map((goal: any) => (
                  <GoalCard key={goal.id} goal={goal}
                    onDelete={() => deleteMutation.mutate(goal.id)}
                    onContribute={() => {}} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {showModal && <CreateGoalModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  )
}
