import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const MOCK_CAMPAIGNS = [
  {
    id: '1',
    name: 'Masaje Deportivo - Recuperación Post-Competencia',
    objective: 'CONVERSIONS',
    status: 'ACTIVE',
    budget: 150000,
    spent: 87430,
    impressions: 124500,
    clicks: 3210,
    conversions: 47,
    leads: 47,
    reach: 89400,
    frequency: 1.39,
    ctr: 2.58,
    cpc: 27250,
    cpl: 1860000,
    roas: 3.4,
    platform: 'META',
    adSets: 3,
    ads: 9,
    startDate: '2025-04-01',
    prompt: 'Campaña para atraer deportistas que necesitan recuperación muscular después de competencias',
    audience: 'Hombres y mujeres 25-45, interesados en deporte, fitness, triatlón, ciclismo',
    createdAt: '2025-04-01',
  },
  {
    id: '2',
    name: 'Promo Mayo - Pack 4 Masajes',
    objective: 'LEAD_GENERATION',
    status: 'ACTIVE',
    budget: 80000,
    spent: 31200,
    impressions: 58900,
    clicks: 1890,
    conversions: 28,
    leads: 28,
    reach: 44200,
    frequency: 1.33,
    ctr: 3.21,
    cpc: 16508,
    cpl: 1114285,
    roas: 2.8,
    platform: 'META',
    adSets: 2,
    ads: 6,
    startDate: '2025-05-01',
    prompt: 'Promoción especial de mayo, pack de 4 masajes con 20% de descuento',
    audience: 'Mujeres 30-50, interesadas en bienestar y spa',
    createdAt: '2025-05-01',
  },
  {
    id: '3',
    name: 'Retargeting - Visitas Web',
    objective: 'CONVERSIONS',
    status: 'PAUSED',
    budget: 50000,
    spent: 50000,
    impressions: 22300,
    clicks: 890,
    conversions: 12,
    leads: 12,
    reach: 5600,
    frequency: 3.98,
    ctr: 3.99,
    cpc: 56179,
    cpl: 4166666,
    roas: 1.8,
    platform: 'META',
    adSets: 1,
    ads: 3,
    startDate: '2025-03-15',
    prompt: 'Retargeting para personas que visitaron la web y no convirtieron',
    audience: 'Visitantes web últimos 30 días',
    createdAt: '2025-03-15',
  },
]

const MOCK_INSIGHTS = {
  totalSpent: 168630,
  totalLeads: 87,
  totalImpressions: 205700,
  totalClicks: 5990,
  avgCTR: 2.91,
  avgCPL: 1938850,
  avgROAS: 2.8,
  topCampaign: 'Masaje Deportivo - Recuperación Post-Competencia',
  weeklyData: [
    { week: 'S1 Abr', spent: 21000, leads: 12, impressions: 28000 },
    { week: 'S2 Abr', spent: 34000, leads: 19, impressions: 45000 },
    { week: 'S3 Abr', spent: 28000, leads: 16, impressions: 38000 },
    { week: 'S4 Abr', spent: 38000, leads: 22, impressions: 52000 },
    { week: 'S1 May', spent: 25000, leads: 11, impressions: 31000 },
    { week: 'S2 May', spent: 22630, leads: 7, impressions: 11700 },
  ],
  audienceBreakdown: [
    { segment: 'Deportistas 25-35', spend: 62000, leads: 34, cpl: 1823529 },
    { segment: 'Bienestar 35-50', spend: 48000, leads: 28, cpl: 1714285 },
    { segment: 'Retargeting', spend: 32000, leads: 15, cpl: 2133333 },
    { segment: 'Lookalike', spend: 26630, leads: 10, cpl: 2663000 },
  ],
}

export const useStore = create(
  persist(
    (set, get) => ({
      // Auth & Config
      metaConnected: false,
      metaAccessToken: '',
      metaAdAccountId: '',
      claudeApiKey: '',
      businessName: 'Masaje Activo',
      currency: 'COP',

      // Campaigns
      campaigns: MOCK_CAMPAIGNS,
      selectedCampaign: null,

      // Analytics
      insights: MOCK_INSIGHTS,

      // Creatives
      creatives: [],

      // Leads
      leads: [
        { id: '1', name: 'Carlos Ruiz', phone: '+573001234567', service: 'Masaje Deportivo 60min', source: 'Meta Ads', campaign: 'Recuperación Post-Competencia', status: 'contacted', date: '2025-05-10', notes: '' },
        { id: '2', name: 'María González', phone: '+573109876543', service: 'Pack 4 Masajes', source: 'Meta Ads', campaign: 'Promo Mayo', status: 'scheduled', date: '2025-05-11', notes: 'Cita confirmada para viernes' },
        { id: '3', name: 'Andrés Mejía', phone: '+573204567890', service: 'Masaje Descontracturante', source: 'Meta Ads', campaign: 'Recuperación Post-Competencia', status: 'new', date: '2025-05-12', notes: '' },
        { id: '4', name: 'Laura Pérez', phone: '+573312345678', service: 'Masaje Deportivo 90min', source: 'Meta Ads', campaign: 'Promo Mayo', status: 'closed', date: '2025-05-09', notes: 'Cliente recurrente' },
      ],

      // UI
      activeTab: 'dashboard',
      isGenerating: false,
      notifications: [],

      // Actions
      setActiveTab: (tab) => set({ activeTab: tab }),
      setMetaConnected: (val) => set({ metaConnected: val }),
      setSettings: (settings) => set(settings),
      setIsGenerating: (val) => set({ isGenerating: val }),

      addCampaign: (campaign) => set((s) => ({
        campaigns: [...s.campaigns, { ...campaign, id: Date.now().toString(), createdAt: new Date().toISOString() }]
      })),

      updateCampaign: (id, updates) => set((s) => ({
        campaigns: s.campaigns.map(c => c.id === id ? { ...c, ...updates } : c)
      })),

      deleteCampaign: (id) => set((s) => ({
        campaigns: s.campaigns.filter(c => c.id !== id)
      })),

      selectCampaign: (campaign) => set({ selectedCampaign: campaign }),

      addCreative: (creative) => set((s) => ({
        creatives: [...s.creatives, { ...creative, id: Date.now().toString(), createdAt: new Date().toISOString() }]
      })),

      updateLead: (id, updates) => set((s) => ({
        leads: s.leads.map(l => l.id === id ? { ...l, ...updates } : l)
      })),

      addLead: (lead) => set((s) => ({
        leads: [...s.leads, { ...lead, id: Date.now().toString(), date: new Date().toISOString() }]
      })),

      addNotification: (notification) => set((s) => ({
        notifications: [{ ...notification, id: Date.now(), read: false }, ...s.notifications]
      })),
    }),
    {
      name: 'masaje-activo-store',
      partialize: (s) => ({
        metaConnected: s.metaConnected,
        metaAccessToken: s.metaAccessToken,
        metaAdAccountId: s.metaAdAccountId,
        claudeApiKey: s.claudeApiKey,
        businessName: s.businessName,
        campaigns: s.campaigns,
        creatives: s.creatives,
        leads: s.leads,
      }),
    }
  )
)
