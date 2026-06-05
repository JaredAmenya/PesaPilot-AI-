import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatKES(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number, decimals = 1): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toFixed(decimals)
}

export function getHealthScoreLabel(score: number): string {
  if (score >= 81) return 'Excellent'
  if (score >= 61) return 'Good'
  if (score >= 41) return 'Fair'
  return 'Poor'
}

export function getHealthScoreColor(score: number): string {
  if (score >= 81) return '#10b981'
  if (score >= 61) return '#3b82f6'
  if (score >= 41) return '#f59e0b'
  return '#ef4444'
}

export function getCategoryClass(category: string): string {
  const map: Record<string, string> = {
    Rent: 'cat-rent',
    Food: 'cat-food',
    Transport: 'cat-transport',
    Utilities: 'cat-utilities',
    Entertainment: 'cat-entertainment',
    Shopping: 'cat-shopping',
    Healthcare: 'cat-healthcare',
    Education: 'cat-education',
    Savings: 'cat-savings',
    Investments: 'cat-investments',
    Salary: 'cat-income',
    Freelancing: 'cat-income',
  }
  return map[category] || 'cat-savings'
}

export function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    Rent: '🏠',
    Food: '🍽️',
    Transport: '🚗',
    Utilities: '💡',
    Entertainment: '🎮',
    Shopping: '🛍️',
    Healthcare: '🏥',
    Education: '📚',
    Savings: '💰',
    Investments: '📈',
    Salary: '💼',
    Freelancing: '💻',
    'Side Hustle': '⚡',
    Business: '🏢',
    'M-Pesa': '📱',
    SACCO: '🏦',
    Chama: '👥',
    Miscellaneous: '📦',
  }
  return map[category] || '💳'
}

export function getInsightIcon(type: string): string {
  const map: Record<string, string> = {
    warning: '⚠️',
    tip: '💡',
    achievement: '🏆',
    alert: '🚨',
    general: '📊',
  }
  return map[type] || '📊'
}

export function daysUntil(date: string | Date): number {
  const target = new Date(date)
  const now = new Date()
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
}

export function monthsUntil(date: string | Date): number {
  return Math.ceil(daysUntil(date) / 30)
}
