import React, { useState } from 'react'
import { useStore } from '../../store'
import { callClaude, SYSTEM_PROMPTS, parseClaudeJSON, formatCOP, formatPct, getStatusColor, getStatusLabel } from '../../lib/api'
import {
  Megaphone, Sparkles, Play, Pause, Trash2, Eye, Plus, ChevronDown,
  ChevronUp, Loader2, AlertCircle, CheckCircle, Target, Users, DollarSign,
  BarChart2, Copy, Send, X
} from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'

// AI Campaign Builder Modal
function AICampaignBuilder({ onClose, onCreated }) {
  const { claudeApiKey, addCampaign, businessName } = useStore()
  const [prompt, setPrompt] = useState('')
  const [budget, setBudget] = useState('150000')
  const [step, setStep] = useState('input') // input | generating | review | publishing
  const [generatedCampaign, setGeneratedCampaign] = useState(null)
  const [error, setError] = useState('')

  const EXAMPLE_PROMPTS = [
    'Campaña para atraer deportistas que quieran recuperarse de lesiones musculares antes del maratón de Medellín',
    'Promoción del día de la madre: pack de relajación y bienestar para mamás activas',
    'Campaña de retargeting para personas que visitaron la web pero no reservaron cita',
    'Conseguir clientes nuevos en El Poblado para masajes descontracturantes',
  ]

  const generateCampaign = async () => {
    if (!prompt.trim()) return toast.error('Escribe un prompt para tu campaña')
    if (!claudeApiKey) return toast.error('Configura tu API key de Claude en Ajustes')

    setStep('generating')
    setError('')

    try {
      const fullPrompt = `Crea una campaña de Meta Ads para "${businessName}" (spa de masajes deportivos en Medellín, Colombia).
Objetivo del cliente: ${prompt}
Presupuesto mensual disponible: ${formatCOP(Number(budget))}
Moneda: COP (Pesos Colombianos)
Ubicación: Medellín, Colombia
Servicios ofrecidos: masajes deportivos, masajes descontracturantes, masajes de relajación, terapias de recuperación muscular.`

      const result = await callClaude(fullPrompt, SYSTEM_PROMPTS.campaignBuilder, claudeApiKey)
      const campaign = parseClaudeJSON(result)
      setGeneratedCampaign({ ...campaign, budget: Number(budget), status: 'PAUSED', platform: 'META', prompt })
      setStep('review')
    } catch (e) {
      setError(e.message || 'Error generando campaña')
      setStep('input')
    }
  }

  const publishCampaign = () => {
    addCampaign({
      ...generatedCampaign,
      status: 'PAUSED',
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      leads: 0,
      reach: 0,
      frequency: 0,
      ctr: 0,
      cpc: 0,
      cpl: 0,
      roas: 0,
      adSets: generatedCampaign.adSets?.length || 0,
      ads: generatedCampaign.ads?.length || 0,
      startDate: new Date().toISOString().split('T')[0],
    })
    toast.success('¡Campaña creada! Revísala y actívala cuando estés listo.')
    onCreated?.()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-500/15 rounded-lg flex items-center justify-center">
              <Sparkles size={18} className="text-brand-400" />
            </div>
            <div>
              <h2 className="font-bold text-white">IA Campaign Builder</h2>
              <p className="text-xs text-slate-500">Describe tu objetivo y la IA monta todo</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost p-2"><X size={16} /></button>
        </div>

        {/* Step: Input */}
        {step === 'input' && (
          <div className="p-6 space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">¿Cuál es el objetivo de tu campaña?</label>
              <textarea
                className="input resize-none h-28"
                placeholder="Ej: Quiero conseguir clientes nuevos que busquen recuperación muscular después del entrenamiento..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">Presupuesto mensual (COP)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                <input
                  type="number"
                  className="input pl-7"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  placeholder="150000"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">= {formatCOP(Number(budget))}/mes · {formatCOP(Number(budget) / 30)}/día</p>
            </div>

            {/* Example prompts */}
            <div>
              <p className="text-xs text-slate-500 mb-2 font-medium">EJEMPLOS RÁPIDOS</p>
              <div className="space-y-2">
                {EXAMPLE_PROMPTS.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(ex)}
                    className="w-full text-left text-xs text-slate-400 hover:text-white bg-surface-DEFAULT hover:bg-surface-hover border border-surface-border rounded-lg px-3 py-2 transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-300">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <button onClick={generateCampaign} className="btn-primary w-full justify-center py-3">
              <Sparkles size={16} />
              Generar Campaña con IA
            </button>
          </div>
        )}

        {/* Step: Generating */}
        {step === 'generating' && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-brand-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Loader2 size={28} className="text-brand-400 animate-spin" />
            </div>
            <h3 className="font-bold text-white text-lg mb-2">Generando tu campaña...</h3>
            <p className="text-slate-500 text-sm">La IA está creando la estrategia, audiencias, copys y estructura completa</p>
            <div className="mt-6 space-y-1.5 text-xs text-slate-600">
              <p>✓ Analizando objetivo de campaña</p>
              <p>✓ Definiendo audiencias y segmentación</p>
              <p className="text-brand-500 animate-pulse">→ Creando conjuntos de anuncios y creativos...</p>
            </div>
          </div>
        )}

        {/* Step: Review */}
        {step === 'review' && generatedCampaign && (
          <div className="p-6 space-y-5">
            <div className="flex gap-2 p-3 bg-brand-500/10 border border-brand-500/20 rounded-lg text-sm text-brand-300">
              <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
              Campaña generada. Revisa los detalles antes de publicar.
            </div>

            {/* Campaign Name */}
            <div className="card bg-surface-DEFAULT">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Campaña</p>
                  <p className="font-bold text-white">{generatedCampaign.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{generatedCampaign.objective} · {formatCOP(generatedCampaign.budget)}/mes</p>
                </div>
                <span className="badge badge-yellow">Borrador</span>
              </div>
              {generatedCampaign.strategy && (
                <p className="text-sm text-slate-400 mt-3 pt-3 border-t border-surface-border">{generatedCampaign.strategy}</p>
              )}
            </div>

            {/* Audience */}
            {generatedCampaign.audience && (
              <div>
                <p className="text-sm font-semibold text-white mb-2">👥 Audiencia</p>
                <div className="bg-surface-DEFAULT rounded-lg p-3 text-sm text-slate-300">
                  <p>{generatedCampaign.audience.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="badge badge-blue">{generatedCampaign.audience.ageMin}-{generatedCampaign.audience.ageMax} años</span>
                    <span className="badge badge-purple">{generatedCampaign.audience.location}</span>
                    {generatedCampaign.audience.interests?.slice(0, 3).map((int, i) => (
                      <span key={i} className="badge badge-green">{int}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Ads Preview */}
            {generatedCampaign.ads && (
              <div>
                <p className="text-sm font-semibold text-white mb-2">📢 Anuncios ({generatedCampaign.ads.length})</p>
                <div className="space-y-2">
                  {generatedCampaign.ads.map((ad, i) => (
                    <div key={i} className="bg-surface-DEFAULT rounded-lg p-3">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-xs font-semibold text-white">{ad.name}</p>
                        <span className="badge badge-purple">{ad.format}</span>
                      </div>
                      <p className="text-sm text-white font-medium">"{ad.headline}"</p>
                      <p className="text-xs text-slate-400 mt-1">{ad.primaryText}</p>
                      <p className="text-xs text-brand-400 mt-1">CTA: {ad.cta}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* KPIs */}
            {generatedCampaign.kpis && (
              <div>
                <p className="text-sm font-semibold text-white mb-2">📊 KPIs Esperados</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'CTR Est.', value: formatPct(generatedCampaign.kpis.expectedCTR) },
                    { label: 'CPL Est.', value: formatCOP(generatedCampaign.kpis.expectedCPL) },
                    { label: 'ROAS Est.', value: `${generatedCampaign.kpis.expectedROAS}x` },
                  ].map((k, i) => (
                    <div key={i} className="bg-brand-500/10 border border-brand-500/20 rounded-lg p-2 text-center">
                      <p className="text-brand-400 font-bold text-sm">{k.value}</p>
                      <p className="text-slate-500 text-xs">{k.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            {generatedCampaign.tips && (
              <div>
                <p className="text-sm font-semibold text-white mb-2">💡 Tips del Trafficker IA</p>
                <ul className="space-y-1">
                  {generatedCampaign.tips.map((tip, i) => (
                    <li key={i} className="text-xs text-slate-400 flex gap-2"><span className="text-brand-400">→</span>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep('input')} className="btn-ghost flex-1 justify-center">
                Regenerar
              </button>
              <button onClick={publishCampaign} className="btn-primary flex-1 justify-center">
                <Send size={14} />
                Guardar Campaña
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Campaign Row
function CampaignRow({ campaign }) {
  const { updateCampaign, deleteCampaign, claudeApiKey } = useStore()
  const [expanded, setExpanded] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)

  const toggleStatus = () => {
    const newStatus = campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    updateCampaign(campaign.id, { status: newStatus })
    toast.success(`Campaña ${newStatus === 'ACTIVE' ? 'activada' : 'pausada'}`)
  }

  const analyzeCampaign = async () => {
    if (!claudeApiKey) return toast.error('Configura tu API key en Ajustes')
    setAnalyzing(true)
    try {
      const prompt = `Analiza esta campaña de Meta Ads:
Nombre: ${campaign.name}
Objetivo: ${campaign.objective}
Presupuesto: ${formatCOP(campaign.budget)}/mes
Gastado: ${formatCOP(campaign.spent)}
Impresiones: ${campaign.impressions}
Clicks: ${campaign.clicks}
CTR: ${campaign.ctr}%
CPC: ${formatCOP(campaign.cpc)}
Leads: ${campaign.leads}
CPL: ${formatCOP(campaign.cpl)}
ROAS: ${campaign.roas}
Alcance: ${campaign.reach}
Frecuencia: ${campaign.frequency}
Audiencia: ${campaign.audience}
Moneda: COP (Pesos Colombianos)
País: Colombia`
      const result = await callClaude(prompt, SYSTEM_PROMPTS.campaignAnalyzer, claudeApiKey)
      setAnalysis(parseClaudeJSON(result))
      setExpanded(true)
    } catch (e) {
      toast.error('Error analizando: ' + e.message)
    }
    setAnalyzing(false)
  }

  return (
    <div className="campaign-card border border-surface-border rounded-xl overflow-hidden bg-surface-card hover:border-brand-500/30 transition-all">
      {/* Main Row */}
      <div className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={clsx('badge', getStatusColor(campaign.status))}>{getStatusLabel(campaign.status)}</span>
              <p className="font-semibold text-white text-sm truncate">{campaign.name}</p>
            </div>
            <p className="text-xs text-slate-500">{campaign.objective} · {campaign.adSets} ad sets · {campaign.ads} anuncios</p>
          </div>

          {/* Metrics */}
          <div className="hidden md:flex items-center gap-6 text-right">
            <div>
              <p className="text-sm font-bold text-white">{campaign.leads}</p>
              <p className="text-xs text-slate-500">Leads</p>
            </div>
            <div>
              <p className="text-sm font-bold text-white">{formatCOP(campaign.spent)}</p>
              <p className="text-xs text-slate-500">Gastado</p>
            </div>
            <div>
              <p className="text-sm font-bold text-brand-400">{campaign.roas}x</p>
              <p className="text-xs text-slate-500">ROAS</p>
            </div>
            <div>
              <p className="text-sm font-bold text-white">{formatPct(campaign.ctr)}</p>
              <p className="text-xs text-slate-500">CTR</p>
            </div>
          </div>

          {/* Actions */}
          <div className="campaign-actions flex items-center gap-2">
            <button
              onClick={analyzeCampaign}
              disabled={analyzing}
              className="btn-ghost py-1.5 px-3 text-xs"
              title="Analizar con IA"
            >
              {analyzing ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              Analizar
            </button>
            <button onClick={toggleStatus} className="btn-ghost py-1.5 px-2">
              {campaign.status === 'ACTIVE' ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button onClick={() => setExpanded(e => !e)} className="btn-ghost py-1.5 px-2">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>{formatCOP(campaign.spent)} gastado</span>
            <span>{formatCOP(campaign.budget)} presupuesto</span>
          </div>
          <div className="h-1.5 bg-surface-DEFAULT rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all"
              style={{ width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Expanded: AI Analysis */}
      {expanded && analysis && (
        <div className="border-t border-surface-border p-4 bg-surface-DEFAULT/50 animate-fade-in">
          {/* Score */}
          <div className="flex items-center gap-3 mb-4">
            <div className={clsx(
              'w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black border-2',
              analysis.score >= 70 ? 'border-brand-500 text-brand-400 bg-brand-500/10' :
              analysis.score >= 50 ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10' :
              'border-red-500 text-red-400 bg-red-500/10'
            )}>
              {analysis.score}
            </div>
            <div>
              <p className="font-bold text-white capitalize">{analysis.status}</p>
              <p className="text-sm text-slate-400">{analysis.summary}</p>
            </div>
            <div className="ml-auto">
              <span className={clsx('badge',
                analysis.forecast?.recommendation === 'escalar' ? 'badge-green' :
                analysis.forecast?.recommendation === 'pausar' ? 'badge-red' :
                'badge-yellow'
              )}>
                {analysis.forecast?.recommendation?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
            {analysis.insights?.map((ins, i) => (
              <div key={i} className={clsx('p-3 rounded-lg border text-xs',
                ins.type === 'success' ? 'bg-brand-500/10 border-brand-500/20' :
                ins.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20' :
                ins.type === 'critical' ? 'bg-red-500/10 border-red-500/20' :
                'bg-blue-500/10 border-blue-500/20'
              )}>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-white">{ins.metric}</span>
                  <span className="font-mono text-slate-300">{ins.value}</span>
                </div>
                <p className="text-slate-400 mb-1">{ins.interpretation}</p>
                <p className={clsx('font-medium',
                  ins.type === 'success' ? 'text-brand-400' :
                  ins.type === 'warning' ? 'text-yellow-400' :
                  ins.type === 'critical' ? 'text-red-400' :
                  'text-blue-400'
                )}>→ {ins.action}</p>
              </div>
            ))}
          </div>

          {/* Optimizations */}
          <div>
            <p className="text-sm font-semibold text-white mb-2">🎯 Optimizaciones recomendadas</p>
            <div className="space-y-2">
              {analysis.optimizations?.map((opt, i) => (
                <div key={i} className="flex gap-3 p-2.5 bg-surface-card rounded-lg border border-surface-border">
                  <span className={clsx('badge flex-shrink-0 self-start mt-0.5',
                    opt.priority === 'alta' ? 'badge-red' :
                    opt.priority === 'media' ? 'badge-yellow' : 'badge-blue'
                  )}>{opt.priority}</span>
                  <div>
                    <p className="text-sm font-medium text-white">{opt.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{opt.description}</p>
                    <p className="text-xs text-brand-400 mt-1">Impacto esperado: {opt.expectedImpact}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CampaignManager() {
  const { campaigns } = useStore()
  const [showBuilder, setShowBuilder] = useState(false)
  const [filter, setFilter] = useState('ALL')

  const filtered = campaigns.filter(c => filter === 'ALL' || c.status === filter)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Campañas</h1>
          <p className="text-slate-500 text-sm mt-0.5">{campaigns.length} campañas · {campaigns.filter(c => c.status === 'ACTIVE').length} activas</p>
        </div>
        <button onClick={() => setShowBuilder(true)} className="btn-primary glow">
          <Sparkles size={16} />
          Crear con IA
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['ALL', 'ACTIVE', 'PAUSED', 'STOPPED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              filter === f ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'text-slate-500 hover:text-white hover:bg-surface-hover'
            )}
          >
            {f === 'ALL' ? 'Todas' : getStatusLabel(f)} {f !== 'ALL' && `(${campaigns.filter(c => c.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Campaign List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="card text-center py-12">
            <Megaphone size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No hay campañas</p>
            <p className="text-slate-600 text-sm mt-1">Crea tu primera campaña con IA</p>
          </div>
        ) : (
          filtered.map(c => <CampaignRow key={c.id} campaign={c} />)
        )}
      </div>

      {showBuilder && <AICampaignBuilder onClose={() => setShowBuilder(false)} />}
    </div>
  )
}
