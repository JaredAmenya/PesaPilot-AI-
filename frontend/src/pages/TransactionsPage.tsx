import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Filter, Trash2, Upload, ArrowUpRight, ArrowDownRight, X } from 'lucide-react'
import { transactionApi, importApi } from '../lib/api'
import { formatKES, getCategoryClass, getCategoryEmoji } from '../lib/utils'
import { format } from 'date-fns'

const CATEGORIES = [
  'Rent', 'Food', 'Transport', 'Utilities', 'Entertainment',
  'Shopping', 'Healthcare', 'Education', 'Savings', 'Investments',
  'Salary', 'Freelancing', 'Side Hustle', 'Business', 'Miscellaneous',
]

function AddTransactionModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    amount: '',
    description: '',
    category: 'Food',
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await transactionApi.create({
        ...form,
        amount: parseFloat(form.amount),
        date: new Date(form.date).toISOString(),
      })
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['monthly'] })
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: '#0f0f2a', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Add Transaction</h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div className="flex rounded-xl p-1" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            {['expense', 'income'].map(t => (
              <button key={t} type="button"
                onClick={() => setForm({ ...form, type: t })}
                className="flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all"
                style={form.type === t
                  ? { background: t === 'expense' ? 'var(--gradient-danger)' : 'var(--gradient-emerald)', color: 'white' }
                  : { color: 'var(--text-secondary)' }
                }>
                {t === 'expense' ? '↓ Expense' : '↑ Income'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Amount (KES) *</label>
              <input id="tx-amount" type="number" placeholder="0" value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                className="input-field" required min="1" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Date *</label>
              <input id="tx-date" type="date" value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="input-field" required />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description *</label>
            <input id="tx-description" type="text" placeholder="What was this for?"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="input-field" required />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Category *</label>
            <select id="tx-category" value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="input-field">
              {CATEGORIES.map(c => <option key={c} value={c}>{getCategoryEmoji(c)} {c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Notes (optional)</label>
            <input id="tx-notes" type="text" placeholder="Any additional notes..."
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              className="input-field" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button id="save-transaction-btn" type="submit" disabled={loading} className="btn-brand flex-1 justify-center"
              style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={16} />}
              {loading ? 'Saving...' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function TransactionsPage() {
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', search, typeFilter, page],
    queryFn: () => transactionApi.list({
      search: search || undefined,
      type: typeFilter || undefined,
      page,
      page_size: 15,
    }).then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => transactionApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['monthly'] })
    },
  })

  const handleMpesaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await importApi.mpesa(file)
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['monthly'] })
    } catch (err) {
      console.error(err)
    }
  }

  const transactions = data?.transactions ?? []
  const totalIncome = data?.total_income ?? 0
  const totalExpenses = data?.total_expenses ?? 0

  return (
    <div className="page-container">
      {/* Header Row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Summary Chips */}
        <div className="flex gap-3 flex-1">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
            <ArrowUpRight size={15} />
            {formatKES(totalIncome)}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            <ArrowDownRight size={15} />
            {formatKES(totalExpenses)}
          </div>
        </div>

        {/* Import M-Pesa */}
        <label id="mpesa-import-btn" className="btn-secondary cursor-pointer">
          <Upload size={15} /> Import M-Pesa
          <input type="file" accept=".csv,.xlsx" onChange={handleMpesaUpload} className="hidden" />
        </label>

        <button id="add-transaction-btn" onClick={() => setShowModal(true)} className="btn-brand">
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            id="transaction-search"
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="input-field pl-9"
          />
        </div>
        <select
          id="type-filter"
          value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
          className="input-field"
          style={{ width: 'auto', minWidth: '120px' }}
        >
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      {/* Transaction List */}
      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 rounded-xl shimmer" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-semibold">No transactions found</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {search ? 'Try a different search term' : 'Add your first transaction to get started'}
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {transactions.map((tx: any, i: number) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${getCategoryClass(tx.category)}`}>
                  {getCategoryEmoji(tx.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{tx.description}</div>
                  <div className="text-xs mt-0.5 flex gap-2" style={{ color: 'var(--text-muted)' }}>
                    <span>{tx.category}</span>
                    <span>·</span>
                    <span>{format(new Date(tx.date), 'dd MMM yyyy')}</span>
                    {tx.source !== 'manual' && (
                      <><span>·</span><span className="uppercase font-semibold" style={{ color: 'var(--purple-light)' }}>{tx.source}</span></>
                    )}
                  </div>
                </div>
                <div className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatKES(tx.amount)}
                </div>
                <button
                  onClick={() => deleteMutation.mutate(tx.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all"
                  style={{ color: '#ef4444' }}
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && data.total_count > 15 && (
          <div className="flex justify-center gap-2 p-4" style={{ borderTop: '1px solid var(--border)' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="btn-secondary text-xs py-1.5 px-3" style={{ opacity: page === 1 ? 0.5 : 1 }}>← Prev</button>
            <span className="flex items-center text-xs px-3" style={{ color: 'var(--text-muted)' }}>
              Page {page} of {Math.ceil(data.total_count / 15)}
            </span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(data.total_count / 15)}
              className="btn-secondary text-xs py-1.5 px-3" style={{ opacity: page >= Math.ceil(data.total_count / 15) ? 0.5 : 1 }}>Next →</button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && <AddTransactionModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  )
}
