export type Page = 'postcode-lookup' | 'grant-consent' | 'electricity-consumption' | 'gas-consumption' | 'meter-readings' | 'settings'

interface NavItem {
  label: string
  icon: string
  page: Page
}

const navItems: NavItem[] = [
  { label: 'Postcode Lookup',         icon: '📍', page: 'postcode-lookup' },
  { label: 'Grant Consent',           icon: '✅', page: 'grant-consent' },
  { label: 'Electricity Consumption', icon: '⚡', page: 'electricity-consumption' },
  { label: 'Gas Consumption',         icon: '🔥', page: 'gas-consumption' },
  { label: 'Meter Readings',          icon: '📊', page: 'meter-readings' },
  { label: 'Settings',                icon: '⚙',  page: 'settings' },
]

interface NavBarProps {
  activePage: Page
  onNavigate: (page: Page) => void
}

export function NavBar({ activePage, onNavigate }: NavBarProps) {
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-icon">⚡</span>
        <span className="sidebar-brand-text">Smart Meter</span>
      </div>
      <ul className="sidebar-nav">
        {navItems.map((item) => (
          <li key={item.page}>
            <button
              className={`sidebar-nav-item${activePage === item.page ? ' active' : ''}`}
              onClick={() => onNavigate(item.page)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
