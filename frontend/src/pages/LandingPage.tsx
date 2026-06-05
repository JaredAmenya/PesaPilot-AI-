import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Zap, TrendingUp, Shield, Target, Bot, PieChart,
  ArrowRight, Star, CheckCircle
} from 'lucide-react'

const FEATURES = [
  { icon: Bot, title: 'AI Financial Advisor', desc: '24/7 personalized advice powered by GPT-4o', color: '#7c3aed' },
  { icon: TrendingUp, title: 'Smart Projections', desc: '6-month to 5-year financial forecasts', color: '#10b981' },
  { icon: PieChart, title: '50/30/20 Budgeting', desc: 'Automatic budget allocation with visual rings', color: '#3b82f6' },
  { icon: Target, title: 'Goal Tracker', desc: 'Plan and track financial goals with timelines', color: '#f59e0b' },
  { icon: Shield, title: 'Emergency Fund', desc: 'Build your 6-month safety net', color: '#ec4899' },
  { icon: Zap, title: 'M-Pesa Import', desc: 'Import M-Pesa & Airtel Money statements', color: '#14b8a6' },
]

const TESTIMONIALS = [
  { name: 'James Mwangi', role: 'Software Engineer, Nairobi', quote: 'PesaPilot helped me realize I was spending 40% of my income on eating out. Within 3 months I saved enough for a land deposit.' },
  { name: 'Amina Hassan', role: 'Freelance Designer', quote: 'The AI advisor is like having a personal CFO. It tracks my irregular income and still helps me hit my savings targets every month.' },
  { name: 'Kevin Ochieng', role: 'Small Business Owner', quote: 'I love the SACCO and Chama tracking. Finally an app that understands how Kenyans actually save money.' },
]

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Fixed background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl"
          style={{ background: 'var(--purple)' }} />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full opacity-8 blur-3xl"
          style={{ background: 'var(--indigo)' }} />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
        style={{ background: 'rgba(10,10,26,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--gradient-brand)' }}>
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold" style={{ fontFamily: 'Space Grotesk' }}>PesaPilot AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-secondary text-sm py-2 px-4">Sign In</Link>
          <Link to="/register" className="btn-brand text-sm py-2 px-4">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-20 px-8 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-8"
            style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', color: 'var(--purple-light)' }}>
            <Zap size={14} />
            Powered by OpenAI GPT-4o
            <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--purple)', color: 'white' }}>New</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6" style={{ fontFamily: 'Space Grotesk', letterSpacing: '-0.03em' }}>
            Your AI-Powered
            <br />
            <span className="gradient-text">Financial Advisor</span>
          </h1>

          <p className="text-xl mb-10 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            PesaPilot AI analyzes your income, tracks expenses, and provides intelligent
            financial advice tailored for the Kenyan market. Like having a personal CFO — 24/7.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-brand text-base px-8 py-4" style={{ borderRadius: '16px' }}>
              Start For Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-4" style={{ borderRadius: '16px' }}>
              Sign In
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 mt-10 text-sm" style={{ color: 'var(--text-muted)' }}>
            {['No credit card required', 'M-Pesa import support', 'AI-powered insights'].map(item => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle size={13} style={{ color: '#10b981' }} />
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk' }}>
              Everything you need to achieve{' '}
              <span className="gradient-text">financial freedom</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Built for Kenyan professionals, freelancers, and entrepreneurs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-6"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${feature.color}18` }}>
                  <feature.icon size={20} style={{ color: feature.color }} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk' }}>
              Loved by Kenyans
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#f59e0b" style={{ color: '#f59e0b' }} />)}
                </div>
                <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>"{t.quote}"</p>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center rounded-3xl p-12"
          style={{ background: 'var(--gradient-brand)', boxShadow: 'var(--shadow-glow-purple)' }}
        >
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk' }}>
            Start your financial journey today
          </h2>
          <p className="mb-8 text-white/80">
            Join thousands of Kenyans who are building wealth intelligently
          </p>
          <Link to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white rounded-xl text-base font-bold transition-all hover:scale-105"
            style={{ color: 'var(--purple)' }}>
            Get Started Free <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-8 text-center text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
        <p>© 2025 PesaPilot AI · Built with ❤️ for Kenya</p>
      </footer>
    </div>
  )
}
