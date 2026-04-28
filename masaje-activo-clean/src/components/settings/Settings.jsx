import React, { useState } from 'react'
import { useStore } from '../../store'
import { MetaAdsService } from '../../lib/api'
import { Settings, Key, Link, CheckCircle, AlertCircle, Loader2, Eye, EyeOff, Save } from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { claudeApiKey, metaAccessToken, metaAdAccountId, businessName, metaConnected, setSettings, setMetaConnected } = useStore()

  const [form, setForm] = useState({
    claudeApiKey: claudeApiKey || '',
    metaAccessToken: metaAccessToken || '',
    metaAdAccountId: metaAdAccountId || '',
    businessName: businessName || 'Masaje Activo',
  })
  const [showKey, setShowKey] = useState({})
  const [testingMeta, setTestingMeta] = useState(false)

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = () => {
    setSettings(form)
    toast.success('Configuración guardada')
  }

  const testMeta = async () => {
    if (!form.metaAccessToken || !form.metaAdAccountId) return toast.error('Token y ID de cuenta requeridos')
    setTestingMeta(true)
    try {
      const ok = await MetaAdsService.verifyToken(form.metaAccessToken)
      if (ok) {
        setSettings({ ...form, metaConnected: true })
        setMetaConnected(true)
        toast.success('¡Meta Ads conectado correctamente!')
      } else {
        toast.error('Token inválido')
      }
    } catch {
      toast.error('Error verificando token')
    }
    setTestingMeta(false)
  }

  const sections = [
    {
      title: 'Información del Negocio',
      icon: Settings,
      fields: [
        {
          key: 'businessName',
          label: 'Nombre del negocio',
          type: 'text',
          placeholder: 'Masaje Activo',
          hint: 'Se usará en campañas y comunicaciones',
        },
      ],
    },
    {
      title: 'API de Claude (Anthropic)',
      icon: Key,
      fields: [
        {
          key: 'claudeApiKey',
          label: 'Claude API Key',
          type: 'password',
          placeholder: 'sk-ant-api...',
          hint: 'Obtén tu API key en console.anthropic.com',
          link: { href: 'https://console.anthropic.com', label: 'Abrir Anthropic Console →' },
        },
      ],
    },
    {
      title: 'Meta Ads (Facebook/Instagram)',
      icon: Link,
      fields: [
        {
          key: 'metaAccessToken',
          label: 'Access Token de Meta',
          type: 'password',
          placeholder: 'EAABs...',
          hint: 'Genera tu token en developers.facebook.com/tools/explorer',
          link: { href: 'https://developers.facebook.com/tools/explorer', label: 'Abrir Graph API Explorer →' },
        },
        {
          key: 'metaAdAccountId',
          label: 'ID de Cuenta Publicitaria',
          type: 'text',
          placeholder: 'act_123456789',
          hint: 'Encuéntralo en Meta Ads Manager → Configuración de la cuenta',
        },
      ],
      action: (
        <div className="flex items-center gap-3">
          <div className={clsx('flex items-center gap-2 text-sm', metaConnected ? 'text-brand-400' : 'text-slate-500')}>
            {metaConnected ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {metaConnected ? 'Conectado' : 'No conectado'}
          </div>
          <button onClick={testMeta} disabled={testingMeta} className="btn-primary text-xs py-1.5">
            {testingMeta ? <Loader2 size={13} className="animate-spin" /> : <Link size={13} />}
            Probar conexión
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Configuración</h1>
        <p className="text-slate-500 text-sm mt-0.5">Conecta tus cuentas y configura la app</p>
      </div>

      {sections.map((section, si) => (
        <div key={si} className="card space-y-4">
          <div className="flex items-center gap-2">
            <section.icon size={16} className="text-brand-400" />
            <h2 className="font-semibold text-white">{section.title}</h2>
          </div>

          {section.fields.map((field, fi) => (
            <div key={fi}>
              <label className="text-sm font-medium text-slate-300 block mb-1.5">{field.label}</label>
              <div className="relative">
                <input
                  type={field.type === 'password' && !showKey[field.key] ? 'password' : 'text'}
                  className="input pr-10"
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={e => update(field.key, e.target.value)}
                />
                {field.type === 'password' && (
                  <button
                    type="button"
                    onClick={() => setShowKey(s => ({ ...s, [field.key]: !s[field.key] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showKey[field.key] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                )}
              </div>
              {field.hint && <p className="text-xs text-slate-500 mt-1">{field.hint}</p>}
              {field.link && (
                <a href={field.link.href} target="_blank" rel="noreferrer" className="text-xs text-brand-400 hover:underline mt-1 block">
                  {field.link.label}
                </a>
              )}
            </div>
          ))}

          {section.action && (
            <div className="pt-2 border-t border-surface-border">
              {section.action}
            </div>
          )}
        </div>
      ))}

      {/* How to get Meta token */}
      <div className="card bg-blue-500/5 border-blue-500/20">
        <h3 className="font-semibold text-white mb-3 text-sm">📋 Cómo conectar Meta Ads</h3>
        <ol className="space-y-2 text-xs text-slate-400">
          <li><span className="text-brand-400 font-bold">1.</span> Ve a <a href="https://developers.facebook.com/apps" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">developers.facebook.com</a> y crea o selecciona tu app</li>
          <li><span className="text-brand-400 font-bold">2.</span> Ve a <strong className="text-white">Graph API Explorer</strong> y genera un User Token con permisos: <code className="bg-surface-DEFAULT px-1 rounded text-xs">ads_management, ads_read, business_management</code></li>
          <li><span className="text-brand-400 font-bold">3.</span> Para token de larga duración ve a: <code className="bg-surface-DEFAULT px-1 rounded text-xs">OAuth Dialog → Exchange Token</code></li>
          <li><span className="text-brand-400 font-bold">4.</span> El ID de tu cuenta publicitaria lo encuentras en <a href="https://adsmanager.facebook.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Ads Manager</a> → Configuración → ID de cuenta</li>
        </ol>
      </div>

      <button onClick={save} className="btn-primary glow">
        <Save size={16} />
        Guardar Configuración
      </button>
    </div>
  )
}
