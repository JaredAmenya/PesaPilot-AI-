import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Shield, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'
import { profileApi } from '../lib/api'
import { formatKES } from '../lib/utils'

export default function EmergencyFundPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['emergency-fund'],
    queryFn: () => profileApi.emergencyFund().then(r => r.data),
    retry: false,
  })

  const fund = data ?? {
    target_amount: 0, current_amount: 0, remaining_amount: 0,
    completion_percentage: 0, monthly_expenses: 0, months_covered: 0,
  }

  const status = fund.completion_percentage >= 100 ? 'achieved'
    : fund.completion_percentage >= 50 ? 'good'
    : fund.completion_percentage >= 25 ? 'building'
    : 'critical'

  const statusConfig = {
    achieved: { color: '#10b981', label: 'Fully Funded! 🎉', icon: CheckCircle },
    good: { color: '#3b82f6', label: 'Good Progress', icon: TrendingUp },
    building: { color: '#f59e0b', label: 'Building Up', icon: Shield },
    critical: { color: '#ef4444', label: 'Needs Attention', icon: AlertTriangle },
  }

  const cfg = statusConfig[status]
  const circumference = 2 * Math.PI * 70
  const strokeDashoffset = circumference - (fund.completion_percentage / 100) * circumference

  const MILESTONES = [
    { pct: 25, label: '1.5 months covered', met: fund.completion_percentage >= 25 },
    { pct: 50, label: '3 months covered', met: fund.completion_percentage >= 50 },
    { pct: 75, label: '4.5 months covered', met: fund.completion_percentage >= 75 },
    { pct: 100, label: '6 months covered ✅', met: fund.completion_percentage >= 100 },
  ]

  return (
    <div className="page-container">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Big gauge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 flex flex-col items-center"
        >
          <div className="relative w-48 h-48 mb-6">
            <svg className="w-48 h-48 -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
              <circle
                cx="80" cy="80" r="70"
                fill="none"
                stroke={cfg.color}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={isLoading ? circumference : strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 1.5s ease', filter: `drop-shadow(0 0 10px ${cfg.color}60)` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Shield size={28} style={{ color: cfg.color }} className="mb-1" />
              <span className="text-3xl font-bold" style={{ color: cfg.color, fontFamily: 'Space Grotesk' }}>
                {isLoading ? '...' : `${fund.completion_percentage.toFixed(0)}%`}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>funded</span>
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="text-lg font-bold mb-1" style={{ color: cfg.color }}>{cfg.label}</div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {fund.months_covered.toFixed(1)} of 6 months covered
            </div>
          </div>

          {/* Key numbers */}
          <div className="w-full grid grid-cols-2 gap-3">
            {[
              { label: 'Target (6× monthly expenses)', value: formatKES(fund.target_amount), color: 'var(--text-primary)' },
              { label: 'Current savings', value: formatKES(fund.current_amount), color: '#10b981' },
              { label: 'Remaining', value: formatKES(fund.remaining_amount), color: '#ef4444' },
              { label: 'Monthly expenses', value: formatKES(fund.monthly_expenses), color: '#f59e0b' },
            ].map(item => (
              <div key={item.label} className="p-3 rounded-xl text-center"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="text-lg font-bold" style={{ color: item.color, fontFamily: 'Space Grotesk' }}>
                  {isLoading ? '...' : item.value}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: Info + milestones */}
        <div className="space-y-4">
          {/* What is an emergency fund? */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Shield size={16} style={{ color: 'var(--purple-light)' }} />
              What is an Emergency Fund?
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              An emergency fund is money set aside specifically for unexpected expenses —
              job loss, medical emergencies, urgent repairs, etc.
            </p>
            <div className="mt-3 p-3 rounded-xl text-sm"
              style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.12)' }}>
              <strong style={{ color: 'var(--purple-light)' }}>Rule of thumb:</strong>
              <span style={{ color: 'var(--text-secondary)' }}> Save 6× your monthly expenses. Your target is{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{formatKES(fund.target_amount)}</strong>
              </span>
            </div>
          </motion.div>

          {/* Milestones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <h3 className="font-semibold mb-4">Milestones</h3>
            <div className="space-y-3">
              {MILESTONES.map((m, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: m.met ? 'rgba(16,185,129,0.15)' : 'var(--bg-card)',
                      border: m.met ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border)',
                    }}
                  >
                    {m.met
                      ? <CheckCircle size={14} style={{ color: '#10b981' }} />
                      : <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{m.pct}%</span>
                    }
                  </div>
                  <div className="flex-1">
                    <div className="text-sm" style={{ color: m.met ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {m.label}
                    </div>
                  </div>
                  {m.met && (
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                      Done
                    </span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <h3 className="font-semibold mb-3">💡 Building Tips</h3>
            <ul className="space-y-2">
              {[
                'Automate transfers on payday — "pay yourself first"',
                'Keep your emergency fund in a separate savings account',
                'Start with 1 month target, then build to 6 months',
                'Don\'t invest emergency funds — keep them liquid',
                'Replenish immediately after using it',
              ].map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--purple-light)', flexShrink: 0 }}>→</span>
                  {tip}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
