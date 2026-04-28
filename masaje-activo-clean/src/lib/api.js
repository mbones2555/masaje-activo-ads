export const callClaude = async (prompt, systemPrompt, apiKey) => {
  const url = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://api.anthropic.com/v1/messages')
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

export const SYSTEM_PROMPTS = {
  campaignBuilder: `Eres un trafficker digital experto en Meta Ads especializado en negocios de salud, bienestar y deportes en Colombia. Crea campañas publicitarias completas y optimizadas. SIEMPRE responde ÚNICAMENTE con un JSON válido, sin texto adicional, sin markdown, sin backticks. El JSON debe tener exactamente esta estructura: {"name": "nombre","objective": "CONVERSIONS","budget": 150000,"audience": {"description": "desc","ageMin": 25,"ageMax": 45,"gender": "ALL","interests": [],"behaviors": [],"location": "Medellín"},"adSets": [{"name": "nombre","placement": "FEED","budget": 50000,"targeting": "desc"}],"ads": [{"name": "nombre","format": "IMAGE","headline": "titular","primaryText": "texto","description": "desc","cta": "BOOK_NOW","creativePrompt": "prompt"}],"strategy": "estrategia","kpis": {"expectedCTR": 2.5,"expectedCPL": 80000,"expectedROAS": 3},"tips": ["tip1","tip2"]}`,
  campaignAnalyzer: `Eres trafficker senior experto en Meta Ads Colombia. SIEMPRE responde ÚNICAMENTE con JSON válido: {"score": 75,"status": "bueno","summary": "resumen","insights": [{"type": "success","metric": "CTR","value": "2.5%","benchmark": "1.5%","interpretation": "sobre promedio","action": "mantener"}],"optimizations": [{"priority": "alta","title": "titulo","description": "desc","expectedImpact": "20%","effort": "bajo"}],"forecast": {"nextWeekLeads": 15,"nextWeekSpend": 50000,"recommendation": "escalar"}}`,
  contentCalendar: `Eres experto en marketing para spas y masajes deportivos en Colombia. SIEMPRE responde ÚNICAMENTE con JSON válido: {"month": "mes","posts": [{"day": 1,"platform": "instagram","type": "reel","theme": "tema","caption": "texto","visualIdea": "idea","bestTime": "18:00","hashtags": ["#masaje"]}],"themes": ["tema1"],"tips": ["tip1"]}`,
  creativeGenerator: `Eres director creativo para publicidad de masajes deportivos. SIEMPRE responde ÚNICAMENTE con JSON válido: {"imagePrompt": "prompt en inglés","videoScript": "guión","copyVariants": [{"headline": "titular","body": "texto","cta": "acción"}],"colorPalette": ["#22c55e","#0f1117"],"visualStyle": "estilo"}`,
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
