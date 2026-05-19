import { useState } from 'react'

export type Page = 'home' | 'postcode-lookup' | 'grant-consent' | 'electricity-consumption' | 'gas-consumption' | 'meter-readings' | 'settings'

interface NavItem {
  label: string
  icon: string
  page: Page
}

const navItems: NavItem[] = [
  { label: 'Home',                    icon: '🏠', page: 'home' },
  { label: 'Postcode Lookup',         icon: '📍', page: 'postcode-lookup' },
  { label: 'Grant Consent',           icon: '✅', page: 'grant-consent' },
  { label: 'Electricity Consumption', icon: '⚡', page: 'electricity-consumption' },
  { label: 'Gas Consumption',         icon: '🔥', page: 'gas-consumption' },
]

interface NavBarProps {
  activePage: Page
  onNavigate: (page: Page) => void
}

export function NavBar({ activePage, onNavigate }: NavBarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  function navigate(page: Page) {
    onNavigate(page)
    setMobileOpen(false)
  }

  return (
    <>
      <button
        className="nav-hamburger"
        onClick={() => setMobileOpen(o => !o)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? '✕' : '☰'}
      </button>

      {mobileOpen && (
        <div className="nav-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      <nav className={`sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="sidebar-brand-icon">⚡</span>
            <span className="sidebar-brand-text">Smart Meter</span>
          </div>
          <button
            className="sidebar-collapse-btn"
            onClick={() => setCollapsed(o => !o)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        <ul className="sidebar-nav">
          {navItems.map((item) => (
            <li key={item.page}>
              <button
                className={`sidebar-nav-item${activePage === item.page ? ' active' : ''}`}
                onClick={() => navigate(item.page)}
                title={collapsed ? item.label : undefined}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
