import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, ArrowLeftRight, PieChart, Target,
  Bot, Lightbulb, TrendingUp, Shield, Settings, LogOut,
  Zap
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/budget', icon: PieChart, label: 'Budget' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/advisor', icon: Bot, label: 'AI Advisor' },
  { to: '/insights', icon: Lightbulb, label: 'Insights' },
  { to: '/projections', icon: TrendingUp, label: 'Projections' },
  { to: '/emergency-fund', icon: Shield, label: 'Emergency Fund' },
]

export default function Sidebar() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <aside
      className="w-64 flex flex-col h-full flex-shrink-0"
      style={{
        background: 'rgba(255,255,255,0.02)',
        borderRight: '1px solid var(--border)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Logo */}
      <div className="px-6 py-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center pulse-glow"
            style={{ background: 'var(--gradient-brand)' }}
          >
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-base tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>
              PesaPilot
            </div>
            <div className="text-xs font-medium" style={{ color: 'var(--purple-light)' }}>
              AI Finance
            </div>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scroll-area">
        {navItems.map(({ to, icon: Icon, label }, i) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <NavLink
              to={to}
              id={`nav-${label.toLowerCase().replace(' ', '-')}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-white'
                    : 'hover:text-white'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? {
                      background: 'var(--gradient-brand)',
                      boxShadow: '0 4px 20px var(--purple-glow)',
                      color: 'white',
                    }
                  : {
                      color: 'var(--text-secondary)',
                    }
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} className={isActive ? 'text-white' : ''} />
                  {label}
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* User Section */}
      <div className="px-3 pb-4 space-y-1" style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Settings size={17} />
          Settings
        </NavLink>

        <div className="flex items-center gap-3 px-3 py-3 rounded-xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'var(--gradient-brand)' }}
          >
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{user?.full_name}</div>
            <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
              {user?.email}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg transition-all hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
