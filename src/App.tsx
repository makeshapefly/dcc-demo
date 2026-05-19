import { useState } from 'react'
import { NavBar, type Page } from './components/NavBar'
import { Home } from './components/Home'
import { ConsumptionChart } from './components/ConsumptionChart'
import { GrantConsent } from './components/GrantConsent'
import { PostcodeLookup } from './components/PostcodeLookup'
import './components/ConsumptionChart.css'
import './components/NavBar.css'
import './App.css'

function App() {
  const [activePage, setActivePage] = useState<Page>('home')

  return (
    <div className="app-layout">
      <NavBar activePage={activePage} onNavigate={setActivePage} />
      <main className="app-main">
        {activePage === 'home' && <Home />}
        {activePage === 'electricity-consumption' && <ConsumptionChart />}
        {activePage === 'grant-consent' && <GrantConsent />}
        {activePage === 'postcode-lookup' && <PostcodeLookup />}
      </main>
    </div>
  )
}

export default App
