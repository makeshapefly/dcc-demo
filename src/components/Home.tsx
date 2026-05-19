import { useState } from 'react'
import './Home.css'

interface AccordionItem {
  id: string
  title: string
  content: React.ReactNode
}

const accordionItems: AccordionItem[] = [
  {
    id: 'about',
    title: 'About This Application',
    content: (
      <div>
        <p>This application demonstrates the DCC (Data Communications Company) smart meter data access flow, including postcode lookup, consent granting, and electricity consumption data retrieval.</p>
        <p>This application logs in the Organisation using a client credentials OAuth2 flow.</p>
      </div>
    ),
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    content: (
      <ol>
        <li><strong>Postcode Lookup</strong> — Look up meters associated with a postcode via the DCC Connect endpoint.</li>
        <li><strong>Grant Consent</strong> — Upload an energy bill to verify ownership and grant third-party access to meter data.</li>
        <li><strong>Electricity Consumption</strong> — View half-hourly, daily, monthly, or yearly consumption data for a given MPAN.</li>
      </ol>
    ),
  },
  {
    id: 'postcode-llokup',
    title: 'Postcode Lookup',
    content: (
      <ol>
        <li><strong>Postcode Lookup</strong> — A typical step 1 would be to lookup data associated with
          a postcode, specifically MPAN information. This is not available until DCC Connect is established.</li>
      </ol>
    ),
  },
  {
    id: 'consent',
    title: 'Grant Consent',
    content: (
      <div>
        <p>The Smart Energy Code (SEC) requires a householder to grant consent before a third party can access their meter data. This demo uses bill upload as the proof-of-ownership mechanism — the MPAN and postcode extracted from the bill must match those provided by the user.</p>
        <p>Two things happen once consent is granted. (1) The MPAN is added to a schedule to retrieve data every 24 hours.
          (2) The organisation granted consent can retrieve this data.
        </p>
      </div>
    ),
  },
  {
    id: 'electricity-consumption',
    title: 'Electricity Consumption',
    content: (
      <p>For issues or questions about this demo, contact your DCC account manager or refer to the SEC documentation.</p>
    ),
  },
]

function AccordionPanel({ item }: { item: AccordionItem }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`accordion-panel${open ? ' open' : ''}`}>
      <button
        className="accordion-header"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="accordion-title">{item.title}</span>
        <span className="accordion-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="accordion-body">
          {item.content}
        </div>
      )}
    </div>
  )
}

export function Home() {
  return (
    <div className="home">
      <h1 className="home-title">Welcome Test Org 1</h1>
      <div className="accordion">
        {accordionItems.map(item => (
          <AccordionPanel key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
