import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import { projectionsApi } from '../lib/api'
import { formatKES } from '../lib/utils'
import { TrendingUp } from 'lucide-react'

type Period = '6m' | '1y' | '5y'

const PERIOD_CONFIG: Record<Period, { key: string, label: string, color: string }> = {
  '6m': { key: 'six_months', label: '6 Months', color: '#10b981' },
  '1y': { key: 'one_year', label: '1 Year', color: '#3b82f6' },
  '5y': { key: 'five_years', label: '5 Years', color: '#7c3aed' },
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
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

export default function ProjectionsPage() {
  const [period, setPeriod] = useState<Period>('1y')

  const { data, isLoading } = useQuery({
    queryKey: ['projections'],
    queryFn: () => projectionsApi.get().then(r => r.data),
  })

  const config = PERIOD_CONFIG[period]
  const chartData = data?.[config.key] ?? []
  const summary = data?.summary ?? {}

  const summaryCards = [
    { label: 'Current Savings', value: formatKES(summary.current_savings ?? 0), emoji: '💰' },
    { label: 'Monthly Savings', value: formatKES(summary.monthly_savings ?? 0), emoji: '📈' },
    { label: 'Savings Rate', value: `${(summary.savings_rate ?? 0).toFixed(1)}%`, emoji: '🎯' },
    { label: 'Projected (6mo)', value: formatKES(summary.projected_6m ?? 0), emoji: '🔮', accent: '#10b981' },
    { label: 'Projected (1yr)', value: formatKES(summary.projected_1y ?? 0), emoji: '📊', accent: '#3b82f6' },
    { label: 'Projected (5yr)', value: formatKES(summary.projected_5y ?? 0), emoji: '🚀', accent: '#7c3aed' },
  ]

  return (
    <div className="page-container">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="stat-card text-center py-4"
            style={card.accent ? { borderColor: `${card.accent}30` } : {}}
          >
            <div className="text-2xl mb-2">{card.emoji}</div>
            <div className="text-lg font-bold" style={{ color: card.accent, fontFamily: 'Space Grotesk' }}>
              {isLoading ? '...' : card.value}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="glass-card p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold">Savings Growth Projection</h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Assumes current savings rate with 8% annual return (conservative estimate)
            </p>
          </div>
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            {(Object.keys(PERIOD_CONFIG) as Period[]).map(p => (
              <button
                key={p}
                id={`projection-${p}`}
                onClick={() => setPeriod(p)}
                className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={period === p
                  ? { background: PERIOD_CONFIG[p].color, color: 'white' }
                  : { color: 'var(--text-secondary)' }
                }
              >
                {PERIOD_CONFIG[p].label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="h-64 shimmer rounded-xl" />
        ) : chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <TrendingUp size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text-muted)' }}>Complete onboarding to see projections</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={config.color} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="contribGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey={period === '5y' ? 'label' : 'month'}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                axisLine={false} tickLine={false}
                tickFormatter={v => `${(v/1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="balance" name="Total Balance"
                stroke={config.color} fill="url(#balanceGrad)" strokeWidth={2.5} />
              <Area type="monotone" dataKey="contributions" name="Contributions"
                stroke="#f59e0b" fill="url(#contribGrad)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Growth Stats */}
      {summary && (
        <div className="grid grid-cols-3 gap-4">
          {([['6m', '#10b981', 'growth_6m'], ['1y', '#3b82f6', 'growth_1y'], ['5y', '#7c3aed', 'growth_5y']] as const).map(([period, color, key]) => (
            <motion.div
              key={period}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="glass-card p-4 text-center"
              style={{ borderColor: `${color}30` }}
            >
              <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Growth in {period}</div>
              <div className="text-2xl font-bold" style={{ color, fontFamily: 'Space Grotesk' }}>
                +{summary[key] ?? 0}%
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Target: {formatKES(summary[`projected_${period.replace('m', '_6m').replace('y', '_1y').replace('5_1y', '5y')}` as any] ?? 0)}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
