import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { profileApi } from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import { User, DollarSign, Bell, Shield, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function SettingsPage() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.get().then(r => r.data),
    retry: false,
  })

  const [form, setForm] = useState({
    monthly_salary: profile?.monthly_salary?.toString() ?? '',
    additional_income: profile?.additional_income?.toString() ?? '',
    existing_savings: profile?.existing_savings?.toString() ?? '',
    existing_debts: profile?.existing_debts?.toString() ?? '',
  })

  const updateProfile = useMutation({
    mutationFn: () => profileApi.update({
      monthly_salary: parseFloat(form.monthly_salary) || 0,
      additional_income: parseFloat(form.additional_income) || 0,
      existing_savings: parseFloat(form.existing_savings) || 0,
      existing_debts: parseFloat(form.existing_debts) || 0,
      currency: 'KES',
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <div className="page-container max-w-2xl">
      {/* Profile Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 mb-4"
      >
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <User size={16} style={{ color: 'var(--purple-light)' }} /> Profile
        </h2>
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
            style={{ background: 'var(--gradient-brand)' }}
          >
            {user?.full_name?.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-lg">{user?.full_name}</div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email}</div>
            <div className="text-xs mt-1 px-2 py-0.5 rounded-full inline-block"
              style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
              ✓ Active Account
            </div>
          </div>
        </div>
      </motion.div>

      {/* Financial Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card p-6 mb-4"
      >
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <DollarSign size={16} style={{ color: 'var(--purple-light)' }} /> Financial Profile
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: 'Monthly Salary (KES)', key: 'monthly_salary' },
            { label: 'Additional Income (KES)', key: 'additional_income' },
            { label: 'Current Savings (KES)', key: 'existing_savings' },
            { label: 'Total Debts (KES)', key: 'existing_debts' },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
              <input
                id={`setting-${key}`}
                type="number"
                value={form[key as keyof typeof form]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                className="input-field"
                placeholder="0"
              />
            </div>
          ))}
        </div>
        <button
          id="save-profile-btn"
          onClick={() => updateProfile.mutate()}
          disabled={updateProfile.isPending}
          className="btn-brand w-full justify-center"
        >
          {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
        </button>
        {updateProfile.isSuccess && (
          <p className="text-center text-xs mt-2" style={{ color: '#10b981' }}>✓ Profile updated successfully</p>
        )}
      </motion.div>

      {/* App info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="glass-card p-6 mb-4"
      >
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Shield size={16} style={{ color: 'var(--purple-light)' }} /> About PesaPilot AI
        </h2>
        <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <div className="flex justify-between">
            <span>Version</span><span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>Currency</span><span className="font-medium">KES (Kenyan Shilling)</span>
          </div>
          <div className="flex justify-between">
            <span>AI Engine</span><span className="font-medium">OpenAI GPT-4o</span>
          </div>
          <div className="flex justify-between">
            <span>Data Storage</span><span className="font-medium">Local PostgreSQL</span>
          </div>
        </div>
      </motion.div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      >
        <button
          id="logout-btn"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-80"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </motion.div>
    </div>
  )
}
