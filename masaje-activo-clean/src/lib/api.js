// Claude AI Service - corsproxy
export const callClaude = async (prompt, systemPrompt, apiKey) => {
  const url = 'https://corsproxy.io/?' + encodeURIComponent('https://api.anthropic.com/v1/messages')
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      system: systemPrompt || '',
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error?.message || 'Error en Claude API')
  }
  const data = await response.json()
  return data.content[0].text
}

// System prompts
export const SYSTEM_PROMPTS = {
  campaignBuilder: `Eres un trafficker digital experto en Meta Ads especializado en negocios de salud, bienestar y deportes en Colombia. 
Crea campañas publicitarias completas y optimizadas.
SIEMPRE responde ÚNICAMENTE con un JSON válido, sin texto adicional, sin markdown, sin backticks.
El JSON debe tener exactamente esta estructura:
{
  "name": "nombre de la campaña",
  "objective": "CONVERSIONS|LEAD_GENERATION|BRAND_AWARENESS|TRAFFIC|REACH",
  "budget": número en COP por mes,
  "audience": {"description": "descripción", "ageMin": número, "ageMax": número, "gender": "ALL|MALE|FEMALE", "interests": [], "behaviors": [], "location": "ciudad"},
  "adSets": [{"name": "nombre", "placement": "FEED|STORIES|REELS|ALL", "budget": número, "targeting": "descripción"}],
  "ads": [{"name": "nombre", "format": "IMAGE|VIDEO|CAROUSEL|STORY", "headline": "titular max 40 chars", "primaryText": "texto max 125 chars", "description": "descripción max 30 chars", "cta": "BOOK_NOW|LEARN_MORE|CONTACT_US|SIGN_UP|GET_OFFER", "creativePrompt": "prompt para IA"}],
  "strategy": "estrategia en 2-3 oraciones",
  "kpis": {"expectedCTR": número, "expectedCPL": número, "expectedROAS": número},
  "tips": ["consejo1", "consejo2", "consejo3"]
}`,
  campaignAnalyzer: `Eres un trafficker digital senior experto en análisis de campañas Meta Ads para Colombia.
SIEMPRE responde ÚNICAMENTE con un JSON válido.
{"score": número 1-100, "status": "excelente|bueno|regular|crítico", "summary": "resumen", "insights": [{"type": "warning|success|info|critical", "metric": "nombre", "value": "valor", "benchmark": "referencia", "interpretation": "qué significa", "action": "acción a tomar"}], "optimizations": [{"priority": "alta|media|baja", "title": "título", "description": "descripción", "expectedImpact": "impacto %", "effort": "bajo|medio|alto"}], "forecast": {"nextWeekLeads": número, "nextWeekSpend": número, "recommendation": "pausar|optimizar|escalar|mantener"}}`,
  contentCalendar: `Eres experto en marketing de contenidos para spas y centros de masajes deportivos en Colombia.
SIEMPRE responde ÚNICAMENTE con un JSON válido.
{"month": "mes", "posts": [{"day": número, "platform": "instagram|facebook|both", "type": "reel|story|post|carousel", "theme": "tema", "caption": "texto completo", "visualIdea": "descripción visual", "bestTime": "hora", "hashtags": ["#tag"]}], "themes": ["tema1"], "tips": ["consejo1"]}`,
  creativeGenerator: `Eres director creativo especializado en publicidad de masajes deportivos.
SIEMPRE responde ÚNICAMENTE con un JSON válido.
{"imagePrompt": "prompt en inglés para DALL-E/Midjourney", "videoScript": "guión 15-30 segundos", "copyVariants": [{"headline": "titular", "body": "texto", "cta": "llamado"}], "colorPalette": ["#color1", "#color2"], "visualStyle": "descripción del estilo"}`,
}

export const MetaAdsService = {
  async verifyToken(accessToken) {
    const url = `https://graph.facebook.com/v19.0/me?access_token=${accessToken}`
    const response = await fetch(url)
    return response.ok
  },
}

export const formatCOP = (value) => {
  if (!value && value !== 0) return '$0'
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)
}

export const formatPct = (value, decimals = 2) => `${Number(value).toFixed(decimals)}%`
export const formatNum = (value) => new Intl.NumberFormat('es-CO').format(value)

export const getStatusColor = (status) => {
  const colors = { ACTIVE: 'badge-green', PAUSED: 'badge-yellow', STOPPED: 'badge-red', ARCHIVED: 'badge-blue' }
  return colors[status] || 'badge-blue'
}

export const getStatusLabel = (status) => {
  const labels = { ACTIVE: 'Activa', PAUSED: 'Pausada', STOPPED: 'Detenida', ARCHIVED: 'Archivada' }
  return labels[status] || status
}

export const parseClaudeJSON = (text) => {
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(clean)
}
