import React, { useState } from 'react'
import { useStore } from '../../store'
import { formatCOP, formatPct, formatNum } from '../../lib/api'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { TrendingUp, TrendingDown, Target, Zap, BarChart2 } from 'lucide-react'
import clsx from 'clsx'

const COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444']

const Tooltip_ = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-card border border-surface-border rounded-lg p-3 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{
          typeof p.value === 'number' && p.value > 10000 ? formatCOP(p.value) : p.value
        }</span></p>
      ))}
    </div>
  )
}

export default function Analytics() {
  const { campaigns, insights } = useStore()
  const [period, setPeriod] = useState('30d')

  // Build campaign performance table
  const campPerf = campaigns.map(c => ({
    name: c.name.length > 30 ? c.name.slice(0, 30) + '...' : c.name,
    leads: c.leads,
    spent: c.spent,
    ctr: c.ctr,
    cpl: c.cpl,
    roas: c.roas,
    status: c.status,
  }))

  const pieData = campaigns.map((c, i) => ({
    name: c.name.split(' ').slice(0, 3).join(' '),
    value: c.leads,
    color: COLORS[i % COLORS.length],
  }))

  const funnel = [
    { stage: 'Impresiones', value: insights.totalImpressions, pct: 100 },
    { stage: 'Clicks', value: insights.totalClicks, pct: ((insights.totalClicks / insights.totalImpressions) * 100).toFixed(2) },
    { stage: 'Leads', value: insights.totalLeads, pct: ((insights.totalLeads / insights.totalImpressions) * 100).toFixed(3) },
    { stage: 'Contactados', value: Math.floor(insights.totalLeads * 0.72), pct: ((Math.floor(insights.totalLeads * 0.72) / insights.totalImpressions) * 100).toFixed(3) },
    { stage: 'Citas', value: Math.floor(insights.totalLeads * 0.45), pct: ((Math.floor(insights.totalLeads * 0.45) / insights.totalImpressions) * 100).toFixed(3) },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-slate-500 text-sm mt-0.5">Análisis detallado como trafficker profesional</p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              period === p ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'text-slate-500 hover:text-white'
            )}>{p}</button>
          ))}
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'ROAS Promedio', value: `${insights.avgROAS}x`, sub: 'Objetivo: 3x+', color: insights.avgROAS >= 3 ? 'text-brand-400' : 'text-yellow-400', icon: TrendingUp },
          { label: 'CPL Promedio', value: formatCOP(insights.avgCPL), sub: 'Costo por lead', color: 'text-blue-400', icon: Target },
          { label: 'CTR Promedio', value: formatPct(insights.avgCTR), sub: 'Benchmark: 1.5%+', color: insights.avgCTR >= 1.5 ? 'text-brand-400' : 'text-yellow-400', icon: Zap },
          { label: 'Total Invertido', value: formatCOP(insights.totalSpent), sub: 'Este período', color: 'text-white', icon: BarChart2 },
        ].map((k, i) => (
          <div key={i} className="stat-card">
            <div className="flex justify-between items-start">
              <p className="text-xs text-slate-500 uppercase tracking-wide">{k.label}</p>
              <k.icon size={14} className="text-slate-600" />
            </div>
            <p className={clsx('text-2xl font-black mt-1', k.color)}>{k.value}</p>
            <p className="text-xs text-slate-500">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Performance */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Evolución de Leads y Gasto</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={insights.weeklyData}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
              <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="l" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="r" orientation="right" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<Tooltip_ />} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              <Area yAxisId="l" type="monotone" dataKey="leads" name="Leads" stroke="#22c55e" strokeWidth={2} fill="url(#g1)" />
              <Area yAxisId="r" type="monotone" dataKey="spent" name="Gasto" stroke="#3b82f6" strokeWidth={2} fill="url(#g2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Leads by Campaign - Pie */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Distribución de Leads</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<Tooltip_ />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-slate-400 flex-1 truncate">{d.name}</span>
                  <span className="text-xs font-bold text-white">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Funnel */}
      <div className="card">
        <h3 className="font-semibold text-white mb-4">Embudo de Conversión</h3>
        <div className="space-y-2">
          {funnel.map((f, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-xs text-slate-400 w-28 text-right">{f.stage}</span>
              <div className="flex-1 bg-surface-DEFAULT rounded-full h-7 overflow-hidden relative">
                <div
                  className="h-full rounded-full flex items-center justify-end pr-3 transition-all"
                  style={{
                    width: `${Math.max((f.value / funnel[0].value) * 100, 2)}%`,
                    background: `linear-gradient(90deg, #166534, #22c55e)`,
                    opacity: 1 - i * 0.12
                  }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-white">
                  {formatNum(f.value)}
                </span>
              </div>
              <span className="text-xs text-slate-500 w-16 font-mono">{f.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign Performance Table */}
      <div className="card">
        <h3 className="font-semibold text-white mb-4">Rendimiento por Campaña</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                {['Campaña', 'Leads', 'Gastado', 'CTR', 'CPL', 'ROAS'].map(h => (
                  <th key={h} className="text-left text-xs text-slate-500 uppercase tracking-wide pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {campPerf.map((c, i) => (
                <tr key={i} className="hover:bg-surface-hover transition-colors">
                  <td className="py-3 pr-4 text-white text-xs font-medium">{c.name}</td>
                  <td className="py-3 pr-4 font-bold text-brand-400">{c.leads}</td>
                  <td className="py-3 pr-4 text-slate-300 font-mono text-xs">{formatCOP(c.spent)}</td>
                  <td className={clsx('py-3 pr-4 font-bold text-xs', c.ctr >= 2 ? 'text-brand-400' : c.ctr >= 1 ? 'text-yellow-400' : 'text-red-400')}>
                    {formatPct(c.ctr)}
                  </td>
                  <td className="py-3 pr-4 text-slate-300 font-mono text-xs">{formatCOP(c.cpl)}</td>
                  <td className={clsx('py-3 font-black', c.roas >= 3 ? 'text-brand-400' : c.roas >= 2 ? 'text-yellow-400' : 'text-red-400')}>
                    {c.roas}x
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
