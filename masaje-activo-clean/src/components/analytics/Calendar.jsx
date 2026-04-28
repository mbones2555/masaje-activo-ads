import React, { useState } from 'react'
import { useStore } from '../../store'
import { callClaude, SYSTEM_PROMPTS, parseClaudeJSON } from '../../lib/api'
import { Calendar, Sparkles, Loader2, Instagram, Facebook, Clock } from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const TYPE_COLORS = {
  reel: 'badge-purple',
  story: 'badge-yellow',
  post: 'badge-blue',
  carousel: 'badge-green',
}

export default function ContentCalendar() {
  const { claudeApiKey } = useStore()
  const [generating, setGenerating] = useState(false)
  const [calendar, setCalendar] = useState(null)
  const [month, setMonth] = useState('Mayo 2025')
  const [focus, setFocus] = useState('')

  const generate = async () => {
    if (!claudeApiKey) return toast.error('Configura tu API key en Ajustes')
    setGenerating(true)
    try {
      const prompt = `Crea un calendario de contenido para ${month} para "Masaje Activo", un spa de masajes deportivos en Medellín, Colombia.
Enfoque especial: ${focus || 'variado entre deportes, bienestar, promociones y educación sobre masajes'}
Crea al menos 12 posts distribuidos a lo largo del mes. Incluye una mezcla de reels, stories, posts y carousels.
Todos los captions deben estar en español colombiano informal y cercano.`

      const result = await callClaude(prompt, SYSTEM_PROMPTS.contentCalendar, claudeApiKey)
      setCalendar(parseClaudeJSON(result))
      toast.success('¡Calendario generado!')
    } catch (e) {
      toast.error('Error: ' + e.message)
    }
    setGenerating(false)
  }

  const copyCaption = (caption) => {
    navigator.clipboard.writeText(caption)
    toast.success('Caption copiado')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendario de Contenido</h1>
          <p className="text-slate-500 text-sm mt-0.5">Planifica tu contenido orgánico con IA</p>
        </div>
      </div>

      {/* Generator */}
      <div className="card">
        <h3 className="font-semibold text-white mb-4">Generar Calendario con IA</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="input" placeholder="Mes (ej: Junio 2025)" value={month} onChange={e => setMonth(e.target.value)} />
          <input className="input md:col-span-2" placeholder="Enfoque especial (ej: maratón de la ciudad, mes del deporte...)" value={focus} onChange={e => setFocus(e.target.value)} />
        </div>
        <button onClick={generate} disabled={generating} className="btn-primary mt-3">
          {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {generating ? 'Generando...' : 'Generar Calendario'}
        </button>
      </div>

      {calendar && (
        <div className="space-y-4 animate-fade-in">
          {/* Themes */}
          {calendar.themes && (
            <div className="flex gap-2 flex-wrap">
              {calendar.themes.map((t, i) => <span key={i} className="badge badge-purple">{t}</span>)}
            </div>
          )}

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {calendar.posts?.map((post, i) => (
              <div key={i} className="card hover:border-slate-600 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-brand-500/10 rounded-lg flex items-center justify-center">
                      <span className="text-brand-400 text-xs font-bold">{post.day}</span>
                    </div>
                    <span className={clsx('badge', TYPE_COLORS[post.type] || 'badge-blue')}>{post.type}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {(post.platform === 'both' || post.platform === 'instagram') && <Instagram size={13} className="text-pink-400" />}
                    {(post.platform === 'both' || post.platform === 'facebook') && <Facebook size={13} className="text-blue-400" />}
                    {post.bestTime && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 ml-1">
                        <Clock size={11} />
                        {post.bestTime}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm font-semibold text-white mb-1">{post.theme}</p>
                <p className="text-xs text-slate-400 line-clamp-3 mb-2">{post.caption}</p>

                {post.visualIdea && (
                  <div className="bg-surface-DEFAULT rounded-lg p-2 mb-2">
                    <p className="text-xs text-slate-500 mb-0.5">Visual</p>
                    <p className="text-xs text-slate-300">{post.visualIdea}</p>
                  </div>
                )}

                {post.hashtags && (
                  <p className="text-xs text-brand-400/70 mb-2 truncate">{post.hashtags.slice(0, 5).join(' ')}</p>
                )}

                <button
                  onClick={() => copyCaption(post.caption + '\n\n' + (post.hashtags || []).join(' '))}
                  className="btn-ghost text-xs py-1.5 w-full justify-center"
                >
                  Copiar caption + hashtags
                </button>
              </div>
            ))}
          </div>

          {/* Tips */}
          {calendar.tips && (
            <div className="card bg-surface-DEFAULT/50">
              <p className="text-sm font-semibold text-white mb-2">💡 Tips de contenido</p>
              <ul className="space-y-1">
                {calendar.tips.map((tip, i) => (
                  <li key={i} className="text-xs text-slate-400 flex gap-2"><span className="text-brand-400">→</span>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!calendar && !generating && (
        <div className="card text-center py-16 border-dashed">
          <Calendar size={36} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Sin calendario generado</p>
          <p className="text-slate-600 text-sm mt-1">Haz clic en "Generar Calendario" para comenzar</p>
        </div>
      )}
    </div>
  )
}
