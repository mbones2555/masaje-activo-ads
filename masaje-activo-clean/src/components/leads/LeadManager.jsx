import React, { useState } from 'react'
import { useStore } from '../../store'
import { Users, Phone, MessageCircle, CheckCircle, Clock, X, Filter, Plus, Search } from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  new: { label: 'Nuevo', color: 'badge-blue', next: 'contacted' },
  contacted: { label: 'Contactado', color: 'badge-yellow', next: 'scheduled' },
  scheduled: { label: 'Agendado', color: 'badge-purple', next: 'closed' },
  closed: { label: 'Cerrado', color: 'badge-green', next: null },
  lost: { label: 'Perdido', color: 'badge-red', next: null },
}

function LeadCard({ lead }) {
  const { updateLead } = useStore()
  const [expanded, setExpanded] = useState(false)
  const [notes, setNotes] = useState(lead.notes || '')
  const config = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new

  const advance = () => {
    if (config.next) {
      updateLead(lead.id, { status: config.next })
      toast.success(`Lead movido a: ${STATUS_CONFIG[config.next].label}`)
    }
  }

  const markLost = () => {
    updateLead(lead.id, { status: 'lost' })
    toast('Lead marcado como perdido', { icon: '❌' })
  }

  const saveNotes = () => {
    updateLead(lead.id, { notes })
    toast.success('Notas guardadas')
  }

  const openWhatsApp = () => {
    const msg = encodeURIComponent(`Hola ${lead.name}! 👋 Te contactamos desde Masaje Activo. Vimos que estás interesado/a en nuestros servicios de ${lead.service}. ¿Cuándo podríamos agendar tu cita?`)
    window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${msg}`, '_blank')
  }

  return (
    <div className={clsx('card transition-all', lead.status === 'new' && 'border-blue-500/30 bg-blue-500/5')}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0 border border-surface-border">
          <span className="text-white font-bold text-sm">{lead.name[0]}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-white text-sm">{lead.name}</p>
            <span className={clsx('badge', config.color)}>{config.label}</span>
            {lead.status === 'new' && <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
          </div>
          <p className="text-xs text-slate-400">{lead.service}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            <span>{lead.phone}</span>
            <span>·</span>
            <span>{lead.campaign}</span>
            <span>·</span>
            <span>{new Date(lead.date).toLocaleDateString('es-CO')}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={openWhatsApp} className="btn-ghost py-1.5 px-2.5 text-xs text-green-400 hover:bg-green-500/10">
            <MessageCircle size={13} />
          </button>
          <a href={`tel:${lead.phone}`} className="btn-ghost py-1.5 px-2.5 text-xs">
            <Phone size={13} />
          </a>
          <button onClick={() => setExpanded(e => !e)} className="btn-ghost py-1.5 px-2.5 text-xs">
            {expanded ? <X size={13} /> : <Filter size={13} />}
          </button>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-surface-border space-y-3 animate-fade-in">
          <div>
            <p className="text-xs text-slate-500 mb-1">Notas</p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="input resize-none h-16 text-xs"
              placeholder="Agrega notas sobre este lead..."
            />
            <button onClick={saveNotes} className="btn-ghost text-xs py-1 mt-1">Guardar</button>
          </div>

          <div className="flex gap-2">
            {config.next && (
              <button onClick={advance} className="btn-primary flex-1 justify-center text-xs py-2">
                <CheckCircle size={13} />
                Mover a {STATUS_CONFIG[config.next].label}
              </button>
            )}
            {lead.status !== 'lost' && lead.status !== 'closed' && (
              <button onClick={markLost} className="btn-ghost text-red-400 hover:bg-red-500/10 text-xs py-2 px-3">
                Perdido
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function LeadManager() {
  const { leads, addLead } = useStore()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newLead, setNewLead] = useState({ name: '', phone: '', service: '', campaign: 'Manual', source: 'Manual' })

  const filtered = leads.filter(l => {
    if (filter !== 'all' && l.status !== filter) return false
    if (search && !l.name.toLowerCase().includes(search.toLowerCase()) && !l.phone.includes(search)) return false
    return true
  })

  const counts = Object.keys(STATUS_CONFIG).reduce((acc, k) => {
    acc[k] = leads.filter(l => l.status === k).length
    return acc
  }, {})

  const handleAddLead = () => {
    if (!newLead.name || !newLead.phone) return toast.error('Nombre y teléfono requeridos')
    addLead({ ...newLead, status: 'new' })
    setNewLead({ name: '', phone: '', service: '', campaign: 'Manual', source: 'Manual' })
    setShowAdd(false)
    toast.success('Lead agregado')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Leads</h1>
          <p className="text-slate-500 text-sm mt-0.5">{leads.length} leads · {counts.new || 0} sin contactar</p>
        </div>
        <button onClick={() => setShowAdd(s => !s)} className="btn-primary">
          <Plus size={16} />
          Agregar Lead
        </button>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setFilter(filter === key ? 'all' : key)}
            className={clsx(
              'card text-center transition-all',
              filter === key ? 'border-brand-500/40 bg-brand-500/10' : 'hover:border-slate-600'
            )}
          >
            <p className="text-2xl font-black text-white">{counts[key] || 0}</p>
            <span className={clsx('badge mt-1', cfg.color)}>{cfg.label}</span>
          </button>
        ))}
      </div>

      {/* Conversion Rate */}
      <div className="card bg-surface-DEFAULT/50">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-white">Tasa de conversión del pipeline</p>
          <span className="text-brand-400 font-bold">{leads.length > 0 ? Math.round((counts.closed || 0) / leads.length * 100) : 0}%</span>
        </div>
        <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const w = leads.length > 0 ? ((counts[key] || 0) / leads.length) * 100 : 0
            if (w === 0) return null
            const colors = { new: 'bg-blue-500', contacted: 'bg-yellow-500', scheduled: 'bg-purple-500', closed: 'bg-brand-500', lost: 'bg-red-500' }
            return <div key={key} className={clsx('rounded-sm', colors[key])} style={{ width: `${w}%` }} title={`${cfg.label}: ${counts[key]}`} />
          })}
        </div>
      </div>

      {/* Add Lead Form */}
      {showAdd && (
        <div className="card border-brand-500/30 bg-brand-500/5 animate-slide-up">
          <p className="font-semibold text-white mb-3">Agregar Lead Manual</p>
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="Nombre completo" value={newLead.name} onChange={e => setNewLead(l => ({ ...l, name: e.target.value }))} />
            <input className="input" placeholder="+57300..." value={newLead.phone} onChange={e => setNewLead(l => ({ ...l, phone: e.target.value }))} />
            <input className="input" placeholder="Servicio de interés" value={newLead.service} onChange={e => setNewLead(l => ({ ...l, service: e.target.value }))} />
            <input className="input" placeholder="Fuente (WhatsApp, Referido...)" value={newLead.source} onChange={e => setNewLead(l => ({ ...l, source: e.target.value }))} />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleAddLead} className="btn-primary">Agregar</button>
            <button onClick={() => setShowAdd(false)} className="btn-ghost">Cancelar</button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input className="input pl-8" placeholder="Buscar por nombre o teléfono..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Lead List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="card text-center py-10">
            <Users size={28} className="text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400">No hay leads que coincidan</p>
          </div>
        ) : (
          filtered.map(lead => <LeadCard key={lead.id} lead={lead} />)
        )}
      </div>
    </div>
  )
}
