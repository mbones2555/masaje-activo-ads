import React, { useState, useCallback } from 'react'
import { useStore } from '../../store'
import { callClaude, SYSTEM_PROMPTS, parseClaudeJSON } from '../../lib/api'
import { useDropzone } from 'react-dropzone'
import {
  ImageIcon, Video, Wand2, Upload, Sparkles, Copy, Download,
  X, Loader2, Eye, Play, Plus, Palette
} from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const CREATIVE_TEMPLATES = [
  { label: 'Masaje deportivo + atleta', prompt: 'Professional sports massage therapy session, athletic person receiving deep tissue massage, modern spa environment, dramatic lighting, health and wellness photography' },
  { label: 'Recuperación muscular', prompt: 'Close-up of therapeutic massage on muscular back, sports recovery concept, professional hands, warm lighting, clean medical aesthetic' },
  { label: 'Relajación y bienestar', prompt: 'Tranquil spa atmosphere, person relaxing during massage, candles, green plants, zen environment, soft natural lighting' },
  { label: 'Antes/después atleta', prompt: 'Split image athlete tired vs energized after sports massage, Colombian urban sports setting, vibrant colors' },
]

function UploadZone({ onUpload }) {
  const onDrop = useCallback(files => {
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => onUpload({ src: e.target.result, name: file.name, type: file.type, size: file.size })
      reader.readAsDataURL(file)
    })
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/*': [] },
    multiple: true,
  })

  return (
    <div {...getRootProps()} className={clsx(
      'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
      isDragActive ? 'border-brand-500 bg-brand-500/10' : 'border-surface-border hover:border-brand-500/50 hover:bg-surface-hover'
    )}>
      <input {...getInputProps()} />
      <Upload size={28} className={clsx('mx-auto mb-3', isDragActive ? 'text-brand-400' : 'text-slate-600')} />
      <p className="text-sm font-medium text-slate-400">
        {isDragActive ? 'Suelta aquí' : 'Arrastra imágenes/videos o haz clic'}
      </p>
      <p className="text-xs text-slate-600 mt-1">PNG, JPG, MP4, MOV — hasta 50MB</p>
    </div>
  )
}

function CreativeCard({ creative, onDelete }) {
  const [copied, setCopied] = useState(false)

  const copyPrompt = () => {
    navigator.clipboard.writeText(creative.imagePrompt || creative.prompt || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="card group relative overflow-hidden">
      {/* Preview */}
      <div className="aspect-video bg-surface-DEFAULT rounded-lg overflow-hidden mb-3 flex items-center justify-center relative">
        {creative.src ? (
          creative.type?.includes('video') ? (
            <video src={creative.src} className="w-full h-full object-cover" controls />
          ) : (
            <img src={creative.src} alt={creative.name} className="w-full h-full object-cover" />
          )
        ) : (
          <div className="text-center">
            <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center mx-auto mb-2">
              {creative.type === 'video' ? <Video size={20} className="text-brand-400" /> : <ImageIcon size={20} className="text-brand-400" />}
            </div>
            <p className="text-xs text-slate-500">Prompt para IA generado</p>
            <p className="text-xs text-slate-600">Usa en Midjourney o DALL-E</p>
          </div>
        )}
        <button onClick={() => onDelete(creative.id)} className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full items-center justify-center hidden group-hover:flex hover:bg-red-500/80 transition-colors">
          <X size={12} />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-white leading-tight">{creative.name || 'Creativo'}</p>
          {creative.format && <span className="badge badge-purple flex-shrink-0">{creative.format}</span>}
        </div>

        {creative.headline && (
          <div className="bg-surface-DEFAULT rounded-lg p-2">
            <p className="text-xs text-slate-500 mb-0.5">Titular</p>
            <p className="text-sm text-white font-medium">"{creative.headline}"</p>
          </div>
        )}

        {creative.primaryText && (
          <p className="text-xs text-slate-400 line-clamp-2">{creative.primaryText}</p>
        )}

        {creative.imagePrompt && (
          <button onClick={copyPrompt} className={clsx(
            'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors border',
            copied ? 'bg-brand-500/20 border-brand-500/30 text-brand-300' : 'bg-surface-DEFAULT border-surface-border text-slate-400 hover:text-white hover:border-slate-600'
          )}>
            <Copy size={12} />
            {copied ? '¡Copiado!' : 'Copiar prompt para Midjourney/DALL-E'}
          </button>
        )}

        {creative.colorPalette && (
          <div className="flex gap-1">
            {creative.colorPalette.map((c, i) => (
              <div key={i} className="w-5 h-5 rounded-md border border-surface-border flex-shrink-0" style={{ backgroundColor: c }} title={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function CreativeStudio() {
  const { creatives, addCreative, claudeApiKey } = useStore()
  const [tab, setTab] = useState('upload') // upload | generate | library
  const [promptInput, setPromptInput] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [genResults, setGenResults] = useState(null)

  const handleUpload = (file) => {
    addCreative({ ...file, format: file.type?.includes('video') ? 'VIDEO' : 'IMAGE', source: 'upload' })
    toast.success('¡Archivo subido!')
  }

  const generateCreative = async () => {
    if (!promptInput.trim() && !selectedTemplate) return toast.error('Describe tu creativo')
    if (!claudeApiKey) return toast.error('Configura tu API key de Claude en Ajustes')

    setGenerating(true)
    try {
      const prompt = `Crea creativos publicitarios para un spa de masajes deportivos en Medellín, Colombia.
Descripción del servicio o anuncio: ${promptInput || selectedTemplate?.prompt || ''}
El negocio se llama "Masaje Activo" y ofrece masajes deportivos, descontracturantes y terapias de recuperación.
Los creativos deben atraer a personas activas, deportistas y personas que buscan bienestar.`

      const result = await callClaude(prompt, SYSTEM_PROMPTS.creativeGenerator, claudeApiKey)
      const data = parseClaudeJSON(result)
      setGenResults(data)

      // Save to library
      if (data.copyVariants) {
        data.copyVariants.forEach((variant, i) => {
          addCreative({
            name: `Variante ${i + 1} — ${variant.headline?.slice(0, 30)}`,
            headline: variant.headline,
            primaryText: variant.body,
            cta: variant.cta,
            imagePrompt: data.imagePrompt,
            colorPalette: data.colorPalette,
            visualStyle: data.visualStyle,
            format: 'IMAGE',
            source: 'ai',
          })
        })
      }
      toast.success('¡Creativos generados!')
    } catch (e) {
      toast.error('Error: ' + e.message)
    }
    setGenerating(false)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Estudio Creativo</h1>
          <p className="text-slate-500 text-sm mt-0.5">Genera o sube creativos para tus campañas</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-card border border-surface-border rounded-xl p-1 w-fit">
        {[
          { id: 'upload', label: 'Subir archivos', icon: Upload },
          { id: 'generate', label: 'Generar con IA', icon: Sparkles },
          { id: 'library', label: `Biblioteca (${creatives.length})`, icon: ImageIcon },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            tab === id ? 'bg-brand-500/20 text-brand-400 border border-brand-500/20' : 'text-slate-400 hover:text-white'
          )}>
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Upload Tab */}
      {tab === 'upload' && (
        <div className="space-y-4 animate-fade-in">
          <UploadZone onUpload={handleUpload} />
          <div className="card bg-surface-DEFAULT/50">
            <h3 className="font-semibold text-white mb-2 text-sm">Formatos recomendados para Meta Ads</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-400">
              {[
                { format: 'Feed Instagram', size: '1080×1080px', type: 'JPG/PNG' },
                { format: 'Story / Reels', size: '1080×1920px', type: 'MP4/JPG' },
                { format: 'Feed Facebook', size: '1200×628px', type: 'JPG/PNG' },
                { format: 'Carousel', size: '1080×1080px', type: 'JPG/PNG' },
              ].map((f, i) => (
                <div key={i} className="bg-surface-card rounded-lg p-3 border border-surface-border">
                  <p className="font-medium text-white">{f.format}</p>
                  <p>{f.size}</p>
                  <p className="text-slate-600">{f.type}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Generate Tab */}
      {tab === 'generate' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Describe tu creativo</label>
                <textarea
                  className="input resize-none h-24"
                  placeholder="Ej: Anuncio para deportistas que buscan recuperación muscular post-entrenamiento..."
                  value={promptInput}
                  onChange={e => { setPromptInput(e.target.value); setSelectedTemplate(null) }}
                />
              </div>

              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2 font-medium">PLANTILLAS RÁPIDAS</p>
                <div className="grid grid-cols-1 gap-2">
                  {CREATIVE_TEMPLATES.map((t, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedTemplate(t); setPromptInput('') }}
                      className={clsx(
                        'text-left px-3 py-2.5 rounded-lg border text-sm transition-all',
                        selectedTemplate?.label === t.label
                          ? 'border-brand-500/50 bg-brand-500/10 text-brand-300'
                          : 'border-surface-border bg-surface-DEFAULT text-slate-400 hover:text-white hover:border-slate-600'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Palette size={13} className="text-brand-400 flex-shrink-0" />
                        {t.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={generateCreative} disabled={generating} className="btn-primary w-full justify-center py-3">
                {generating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                {generating ? 'Generando creativos...' : 'Generar con IA'}
              </button>
            </div>

            {/* Results Preview */}
            <div>
              {genResults ? (
                <div className="space-y-3 animate-fade-in">
                  {/* Image Prompt */}
                  <div className="card">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Prompt para Midjourney / DALL-E</p>
                    <p className="text-xs text-slate-300 leading-relaxed bg-surface-DEFAULT p-3 rounded-lg font-mono">{genResults.imagePrompt}</p>
                    <button
                      onClick={() => { navigator.clipboard.writeText(genResults.imagePrompt); toast.success('Copiado') }}
                      className="btn-ghost mt-2 text-xs py-1.5"
                    >
                      <Copy size={12} /> Copiar prompt
                    </button>
                  </div>

                  {/* Video Script */}
                  {genResults.videoScript && (
                    <div className="card">
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Guión de Video (15-30s)</p>
                      <p className="text-sm text-slate-300 leading-relaxed">{genResults.videoScript}</p>
                    </div>
                  )}

                  {/* Copy Variants */}
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Variantes de Copy</p>
                    {genResults.copyVariants?.map((v, i) => (
                      <div key={i} className="card bg-surface-DEFAULT/50">
                        <p className="text-sm font-bold text-white">"{v.headline}"</p>
                        <p className="text-xs text-slate-400 mt-1">{v.body}</p>
                        <span className="badge badge-green mt-2">{v.cta}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-surface-border rounded-xl p-8 text-center">
                  <div>
                    <Wand2 size={32} className="text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">Los creativos generados aparecerán aquí</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Library Tab */}
      {tab === 'library' && (
        <div className="animate-fade-in">
          {creatives.length === 0 ? (
            <div className="card text-center py-12">
              <ImageIcon size={32} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Biblioteca vacía</p>
              <p className="text-slate-600 text-sm mt-1">Sube o genera creativos para verlos aquí</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {creatives.map(c => (
                <CreativeCard key={c.id} creative={c} onDelete={() => {}} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
