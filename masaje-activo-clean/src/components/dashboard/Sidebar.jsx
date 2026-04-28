import React from 'react'
import { useStore } from '../../store'
import {
  LayoutDashboard, Megaphone, BarChart3, ImageIcon,
  Users, Settings, Zap, Bell, ChevronRight, Activity
} from 'lucide-react'
import clsx from 'clsx'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'campaigns', label: 'Campañas', icon: Megaphone },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'creative', label: 'Creativos', icon: ImageIcon },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'calendar', label: 'Calendario', icon: Activity },
  { id: 'settings', label: 'Configuración', icon: Settings },
]

export default function Sidebar() {
  const { activeTab, setActiveTab, metaConnected, campaigns, leads } = useStore()

  const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE').length
  const newLeads = leads.filter(l => l.status === 'new').length

  return (
    <aside className="w-64 bg-surface-card border-r border-surface-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-surface-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-500 rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-black" />
          </div>
          <div>
            <p className="font-bold text-sm text-white leading-tight">Masaje Activo</p>
            <p className="text-xs text-slate-500 font-mono">Ad Manager</p>
          </div>
        </div>
      </div>

      {/* Meta Status */}
      <div className="px-4 py-3 border-b border-surface-border">
        <div className={clsx(
          'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium',
          metaConnected ? 'bg-brand-500/10 text-brand-400' : 'bg-yellow-500/10 text-yellow-400'
        )}>
          <span className={clsx('w-2 h-2 rounded-full', metaConnected ? 'bg-brand-500 animate-pulse' : 'bg-yellow-500')} />
          {metaConnected ? 'Meta Ads conectado' : 'Meta no conectado'}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id
          const badge = id === 'campaigns' ? activeCampaigns : id === 'leads' ? newLeads : null

          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-surface-hover'
              )}
            >
              <Icon size={16} className={isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'} />
              <span className="flex-1 text-left">{label}</span>
              {badge !== null && badge > 0 && (
                <span className={clsx('w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold', isActive ? 'bg-brand-500 text-black' : 'bg-surface-border text-slate-400')}>
                  {badge}
                </span>
              )}
              {isActive && <ChevronRight size={14} className="text-brand-500" />}
            </button>
          )
        })}
      </nav>

      {/* Quick Stats */}
      <div className="p-4 border-t border-surface-border">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-surface-DEFAULT rounded-lg p-2 text-center">
            <p className="text-brand-400 font-bold text-lg">{activeCampaigns}</p>
            <p className="text-slate-500 text-xs">Activas</p>
          </div>
          <div className="bg-surface-DEFAULT rounded-lg p-2 text-center">
            <p className="text-yellow-400 font-bold text-lg">{newLeads}</p>
            <p className="text-slate-500 text-xs">Nuevos leads</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
