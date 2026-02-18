import { useMemo } from 'react'
import {
  CalendarDays,
  Users2,
  Scale,
  BarChart3,
  ChevronRight,
  Info,
  LucideIcon
} from 'lucide-react'
import { Event, Team, Score, Judge } from '../../types'

interface DashboardOverviewProps {
  events: Event[]
  teams: Team[]
  scores: Score[]
  judges: Judge[]
}

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: number
  trend: string
  color: 'blue' | 'emerald' | 'purple' | 'amber'
}

interface ProgressItemProps {
  label: string
  current: number
  total: number
  color: string
}

export function DashboardOverview({
  events,
  teams,
  scores,
  judges,
}: DashboardOverviewProps) {

  const stats = useMemo(() => ({
    totalEvents: events.length,
    totalTeams: teams.length,
    totalJudges: judges.length,
    totalScores: scores.length,
  }), [events, teams, judges, scores])

  const internalJudges = judges.filter(j => j.type === 'Internal').length
  const externalJudges = judges.filter(j => j.type === 'External').length
  const round1Scores = scores.filter(s => s.round === 'Round 1').length
  const round2Scores = scores.filter(s => s.round === 'Round 2').length

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* RESPONSIVE HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Competition Overview
            </h1>
            <div className="flex items-center gap-2 text-slate-500">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-sm font-medium">Pitch Perfect 2026 • Live Updates</p>
            </div>
          </div>
          <button className="flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            View Analytics <ChevronRight className="size-4" />
          </button>
        </header>

        {/* TOP STATS - Fluid Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard icon={CalendarDays} label="Events" value={stats.totalEvents} trend="+1 this week" color="blue" />
          <StatCard icon={Users2} label="Teams" value={stats.totalTeams} trend="50 registered" color="emerald" />
          <StatCard icon={Scale} label="Judges" value={stats.totalJudges} trend="13 active" color="purple" />
          <StatCard icon={BarChart3} label="Scores" value={stats.totalScores} trend="98% completion" color="amber" />
        </section>

        {/* BREAKDOWN SECTION - Stack on Mobile, Side-by-Side on Desktop */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
          
          {/* Judges Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 rounded-2xl">
                  <Scale className="size-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Judges</h2>
              </div>
              <Info className="size-5 text-slate-300 cursor-help" />
            </div>

            <div className="grid gap-6">
              <ProgressItem 
                label="Internal Bench" 
                current={internalJudges} 
                total={stats.totalJudges} 
                color="bg-purple-600" 
              />
              <ProgressItem 
                label="External Panels" 
                current={externalJudges} 
                total={stats.totalJudges} 
                color="bg-indigo-400" 
              />
            </div>
          </div>

          {/* Scores Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 rounded-2xl">
                  <BarChart3 className="size-6 text-amber-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Scoring Progress</h2>
              </div>
              <Info className="size-5 text-slate-300 cursor-help" />
            </div>

            <div className="grid gap-6">
              <ProgressItem 
                label="Preliminary Round" 
                current={round1Scores} 
                total={50} // Assuming 50 is the goal
                color="bg-amber-500" 
              />
              <ProgressItem 
                label="Final Round" 
                current={round2Scores} 
                total={50} 
                color="bg-cyan-500" 
              />
            </div>
          </div>

        </section>
      </div>
    </div>
  )
}

/* ================= COMPONENT: STAT CARD ================= */

function StatCard({ icon: Icon, label, value, trend, color }: StatCardProps) {
  const colorConfig: Record<StatCardProps['color'], string> = {
    blue: "text-blue-600 bg-blue-50",
    emerald: "text-emerald-600 bg-emerald-50",
    purple: "text-purple-600 bg-purple-50",
    amber: "text-amber-600 bg-amber-50",
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:translate-y-[-4px] transition-all duration-300">
      <div className={`${colorConfig[color]} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
        <Icon className="size-6" />
      </div>
      <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-black text-slate-900">{value}</h3>
      </div>
      <p className="mt-2 text-xs font-medium text-slate-400">{trend}</p>
    </div>
  )
}

/* ================= COMPONENT: PROGRESS ITEM ================= */

function ProgressItem({ label, current, total, color }: ProgressItemProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0
  
  return (
    <div className="group">
      <div className="flex justify-between items-end mb-2">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-0.5">{label}</p>
          <p className="text-lg font-bold text-slate-800">{current} <span className="text-sm font-normal text-slate-400">/ {total}</span></p>
        </div>
        <div className="text-right">
          <span className="text-sm font-black text-slate-900">{percentage}%</span>
        </div>
      </div>
      <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
        <div 
          className={`${color} h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-110`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}