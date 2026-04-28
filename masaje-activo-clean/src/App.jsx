import React from 'react'
import { Toaster } from 'react-hot-toast'
import { useStore } from './store'
import Sidebar from './components/dashboard/Sidebar'
import Overview from './components/dashboard/Overview'
import CampaignManager from './components/campaigns/CampaignManager'
import Analytics from './components/analytics/Analytics'
import CreativeStudio from './components/creative/CreativeStudio'
import LeadManager from './components/leads/LeadManager'
import ContentCalendar from './components/analytics/Calendar'
import SettingsPage from './components/settings/Settings'

const VIEWS = {
  dashboard: Overview,
  campaigns: CampaignManager,
  analytics: Analytics,
  creative: CreativeStudio,
  leads: LeadManager,
  calendar: ContentCalendar,
  settings: SettingsPage,
}

export default function App() {
  const { activeTab } = useStore()
  const View = VIEWS[activeTab] || Overview

  return (
    <div className="flex h-screen bg-surface bg-grid overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#161b27',
            color: '#e2e8f0',
            border: '1px solid #1e2535',
            fontSize: '13px',
            fontFamily: 'Syne, sans-serif',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#161b27' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#161b27' } },
        }}
      />
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-6xl mx-auto">
          <View />
        </div>
      </main>
    </div>
  )
}
