import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DollarSign, Target, TrendingUp, CheckCircle, ArrowRight, ArrowLeft, Zap
} from 'lucide-react'
import { profileApi } from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import { formatKES } from '../lib/utils'

const GOALS_OPTIONS = [
  'Buy a Car', 'Buy Land', 'Emergency Fund', 'Start a Business',
  'Save for Travel', 'Education', 'Buy a House', 'Retirement',
]

const steps = [
  { title: 'Your Income', subtitle: 'Tell us about your monthly earnings', icon: DollarSign },
  { title: 'Your Finances', subtitle: 'Help us understand your current situation', icon: TrendingUp },
  { title: 'Your Goals', subtitle: 'What do you want to achieve financially?', icon: Target },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [form, setForm] = useState({
    monthly_salary: '',
    additional_income: '',
    existing_savings: '',
    existing_debts: '',
  })
  const { updateUser } = useAuthStore()
  const navigate = useNavigate()

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    )
  }

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await profileApi.onboarding({
        monthly_salary: parseFloat(form.monthly_salary) || 0,
        additional_income: parseFloat(form.additional_income) || 0,
        existing_savings: parseFloat(form.existing_savings) || 0,
        existing_debts: parseFloat(form.existing_debts) || 0,
        financial_goals: selectedGoals,
      })
      updateUser({ onboarding_completed: true })
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const StepIcon = steps[step].icon

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{ background: 'var(--purple)' }} />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl"
          style={{ background: 'var(--emerald)' }} />
      </div>

      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--gradient-brand)' }}>
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk' }}>PesaPilot AI</span>
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === step ? '32px' : '8px',
                  height: '8px',
                  background: i <= step ? 'var(--gradient-brand)' : 'var(--border)',
                }}
              />
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(124,58,237,0.15)', color: 'var(--purple-light)' }}>
              <StepIcon size={20} />
            </div>
          </div>
          <h1 className="text-2xl font-bold">{steps[step].title}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{steps[step].subtitle}</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <AnimatePresence mode="wait">
            {/* Step 0: Income */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Monthly Salary (KES)
                  </label>
                  <input
                    id="salary-input"
                    type="number"
                    placeholder="e.g. 80000"
                    value={form.monthly_salary}
                    onChange={e => setForm({ ...form, monthly_salary: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Additional Income (KES) <span style={{ color: 'var(--text-muted)' }}>— optional</span>
                  </label>
                  <input
                    id="additional-income-input"
                    type="number"
                    placeholder="Freelancing, side hustles, etc."
                    value={form.additional_income}
                    onChange={e => setForm({ ...form, additional_income: e.target.value })}
                    className="input-field"
                  />
                </div>
                {form.monthly_salary && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl text-sm"
                    style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}
                  >
                    <div className="font-semibold" style={{ color: '#10b981' }}>
                      Total Monthly Income: {formatKES((parseFloat(form.monthly_salary) || 0) + (parseFloat(form.additional_income) || 0))}
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>Annual: {formatKES(((parseFloat(form.monthly_salary) || 0) + (parseFloat(form.additional_income) || 0)) * 12)}</div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 1: Financial situation */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Current Savings (KES)
                  </label>
                  <input
                    id="savings-input"
                    type="number"
                    placeholder="Total savings across all accounts"
                    value={form.existing_savings}
                    onChange={e => setForm({ ...form, existing_savings: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Total Debts (KES) <span style={{ color: 'var(--text-muted)' }}>— optional</span>
                  </label>
                  <input
                    id="debts-input"
                    type="number"
                    placeholder="Loans, credit cards, etc."
                    value={form.existing_debts}
                    onChange={e => setForm({ ...form, existing_debts: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="p-4 rounded-xl text-sm space-y-2"
                  style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.12)' }}>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    💡 This helps us calculate your <strong>emergency fund target</strong> and <strong>financial health score</strong>.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 2: Goals */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                  Select all that apply — we'll help you plan for each goal.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {GOALS_OPTIONS.map(goal => (
                    <button
                      key={goal}
                      id={`goal-${goal.toLowerCase().replace(/\s/g, '-')}`}
                      onClick={() => toggleGoal(goal)}
                      className="flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium text-left transition-all"
                      style={
                        selectedGoals.includes(goal)
                          ? { background: 'var(--gradient-brand)', color: 'white', boxShadow: '0 4px 16px var(--purple-glow)' }
                          : { background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }
                      }
                    >
                      {selectedGoals.includes(goal) && <CheckCircle size={14} />}
                      {goal}
                    </button>
                  ))}
                </div>
                {selectedGoals.length > 0 && (
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="mt-4 text-xs text-center"
                    style={{ color: 'var(--purple-light)' }}
                  >
                    {selectedGoals.length} goal{selectedGoals.length > 1 ? 's' : ''} selected
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button onClick={handleBack} className="btn-secondary flex-1 justify-center">
                <ArrowLeft size={16} />
                Back
              </button>
            )}
            {step < steps.length - 1 ? (
              <button onClick={handleNext} className="btn-brand flex-1 justify-center">
                Continue
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                id="complete-onboarding-btn"
                onClick={handleSubmit}
                disabled={loading}
                className="btn-brand flex-1 justify-center"
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : <CheckCircle size={16} />}
                {loading ? 'Setting up...' : 'Launch PesaPilot'}
              </button>
            )}
          </div>
        </div>

        <p className="text-center mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          You can update all this information later in Settings
        </p>
      </div>
    </div>
  )
}
