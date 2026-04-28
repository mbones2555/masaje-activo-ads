import React, { useState } from 'react'
import { useStore } from '../../store'
import { formatCOP, formatPct, formatNum } from '../../lib/api'
import {
  TrendingUp, TrendingDown, DollarSign, Users, Eye, MousePointer,
  ArrowUpRight, ArrowDownRight, Zap, AlertTriangle, CheckCircle
} from 'lucide-react'
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'
import clsx from 'clsx'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-card border border-surface-border rounded-lg p-3 text-xs">
      <p className="text-slate-400 mb-1 font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.name.includes('Gasto') ? formatCOP(p.value) : p.value}
        </p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { campaigns, insights, leads, setActiveTab } = useStore()

  const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE')
  const totalLeads = leads.length
  const newLeads = leads.filter(l => l.status === 'new').length

  const statCards = [
    {
      label: 'Gasto Total (mes)',
      value: formatCOP(insights.totalSpent),
      change: '+12.4%',
      up: true,
      icon: DollarSign,
      color: 'text-brand-400',
      bg: 'bg-brand-500/10',
    },
    {
      label: 'Leads Generados',
      value: insights.totalLeads,
      change: '+8.1%',
      up: true,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Impresiones',
      value: formatNum(insights.totalImpressions),
      change: '+5.7%',
      up: true,
      icon: Eye,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'CTR Promedio',
      value: formatPct(insights.avgCTR),
      change: '-0.3%',
      up: false,
      icon: MousePointer,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Resumen de rendimiento — Mayo 2025</p>
        </div>
        <button
          onClick={() => setActiveTab('campaigns')}
          className="btn-primary glow"
        >
          <Zap size={16} />
          Nueva campaña con IA
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <div key={i} className="stat-card animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">{s.label}</p>
              <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', s.bg)}>
                <s.icon size={15} className={s.color} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
            <div className="flex items-center gap-1">
              {s.up
                ? <ArrowUpRight size={13} className="text-brand-400" />
                : <ArrowDownRight size={13} className="text-red-400" />}
              <span className={clsx('text-xs font-medium', s.up ? 'text-brand-400' : 'text-red-400')}>
                {s.change}
              </span>
              <span className="text-slate-600 text-xs">vs mes anterior</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Trend Chart */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Gasto vs Leads por semana</h3>
            <span className="badge badge-blue">Últimas 6 semanas</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={insights.weeklyData}>
              <defs>
                <linearGradient id="gSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
              <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="spend" orientation="left" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <YAxis yAxisId="leads" orientation="right" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area yAxisId="spend" type="monotone" dataKey="spent" name="Gasto" stroke="#22c55e" strokeWidth={2} fill="url(#gSpend)" />
              <Area yAxisId="leads" type="monotone" dataKey="leads" name="Leads" stroke="#3b82f6" strokeWidth={2} fill="url(#gLeads)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Audience Breakdown */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Audiencias</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={insights.audienceBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}`} />
              <YAxis type="category" dataKey="segment" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="leads" name="Leads" fill="#22c55e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Campaigns + Leads Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active Campaigns */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Campañas Activas</h3>
            <button onClick={() => setActiveTab('campaigns')} className="text-brand-400 text-xs hover:underline">Ver todas →</button>
          </div>
          <div className="space-y-3">
            {activeCampaigns.slice(0, 3).map(c => (
              <div key={c.id} className="flex items-center gap-3 p-3 bg-surface-DEFAULT rounded-lg hover:bg-surface-hover transition-colors">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-400 text-xs font-bold">{c.adSets}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{c.name}</p>
                  <p className="text-xs text-slate-500">{c.leads} leads · {formatCOP(c.spent)} gastado</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-brand-400">{c.roas}x</p>
                  <p className="text-xs text-slate-500">ROAS</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Leads + Alerts */}
        <div className="space-y-4">
          {/* Alerts */}
          <div className="card">
            <h3 className="font-semibold text-white mb-3">Alertas de Optimización</h3>
            <div className="space-y-2">
              <div className="flex gap-3 p-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertTriangle size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-200">Retargeting: frecuencia 3.98 → fatiga de audiencia. Considera renovar creativos.</p>
              </div>
              <div className="flex gap-3 p-2.5 bg-brand-500/10 border border-brand-500/20 rounded-lg">
                <CheckCircle size={14} className="text-brand-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-green-200">Campaña Deportivo tiene CTR 2.58% → sobre promedio. Considera escalar presupuesto.</p>
              </div>
              <div className="flex gap-3 p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <TrendingUp size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-200">{newLeads} leads nuevos sin contactar. Contacta en las próximas 2h para mayor conversión.</p>
              </div>
            </div>
          </div>

          {/* Key KPIs */}
          <div className="card">
            <h3 className="font-semibold text-white mb-3">KPIs Clave</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'CPL Prom', value: formatCOP(insights.avgCPL), color: 'text-white' },
                { label: 'ROAS Prom', value: `${insights.avgROAS}x`, color: 'text-brand-400' },
                { label: 'Clicks', value: formatNum(insights.totalClicks), color: 'text-blue-400' },
              ].map((k, i) => (
                <div key={i} className="bg-surface-DEFAULT rounded-lg p-3 text-center">
                  <p className={clsx('font-bold text-sm', k.color)}>{k.value}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{k.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
