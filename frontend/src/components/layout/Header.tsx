import { useLocation } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Your financial overview' },
  '/transactions': { title: 'Transactions', subtitle: 'Track your money flow' },
  '/budget': { title: 'Smart Budget', subtitle: '50/30/20 budget planner' },
  '/goals': { title: 'Goal Planner', subtitle: 'Track your financial goals' },
  '/advisor': { title: 'AI Advisor', subtitle: 'Your 24/7 financial advisor' },
  '/insights': { title: 'Spending Insights', subtitle: 'AI-powered spending analysis' },
  '/projections': { title: 'Future Projections', subtitle: '6-month to 5-year forecasts' },
  '/emergency-fund': { title: 'Emergency Fund', subtitle: 'Build your safety net' },
  '/settings': { title: 'Settings', subtitle: 'Manage your account' },
}

export default function Header() {
  const location = useLocation()
  const { user } = useAuthStore()
  const page = pageTitles[location.pathname] || { title: 'PesaPilot AI', subtitle: '' }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <header
      className="flex items-center justify-between px-8 py-4 flex-shrink-0"
      style={{
        borderBottom: '1px solid var(--border)',
        background: 'rgba(10,10,26,0.8)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div>
        <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>
          {page.title}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {location.pathname === '/dashboard'
            ? `${greeting}, ${user?.full_name?.split(' ')[0]} 👋`
            : page.subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
          }}
        >
          <Search size={15} />
          <span className="hidden md:inline">Quick search...</span>
          <kbd
            className="hidden md:inline text-xs px-1.5 py-0.5 rounded"
            style={{ background: 'var(--border)', fontSize: '10px' }}
          >
            ⌘K
          </kbd>
        </div>

        {/* Notifications */}
        <button
          className="relative p-2.5 rounded-xl transition-all hover:opacity-80"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <Bell size={17} style={{ color: 'var(--text-secondary)' }} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: 'var(--purple)' }}
          />
        </button>
      </div>
    </header>
  )
}
