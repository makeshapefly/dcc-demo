import { useEffect, useState } from 'react'
import { getAccessToken } from '../services/auth'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type Period = 'day' | 'week' | 'month' | 'year'

interface Reading {
  period: string
  consumption: string
}

interface ApiResponse {
  mpan: string
  targetId: string
  deviceType: string
  meterType: string
  readings: Reading[]
}

interface ChartDataPoint {
  label: string
  consumption: number
}

const PERIODS: { value: Period; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
]


function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function toApiTimestamp(date: Date): string {
  const pad = (n: number, len = 2) => String(n).padStart(len, '0')
  const y = date.getUTCFullYear()
  const mo = pad(date.getUTCMonth() + 1)
  const d = pad(date.getUTCDate())
  const h = pad(date.getUTCHours())
  const mi = pad(date.getUTCMinutes())
  const s = pad(date.getUTCSeconds())
  return `${y}-${mo}-${d} ${h}:${mi}:${s}.000000+00`
}

function buildUrl(period: Period, mpan: string, selectedDate: string): string {
  const base = import.meta.env.VITE_API_BASE_URL ?? ''
  const targetId = import.meta.env.VITE_TARGET_ID ?? ''

  let from: Date
  let to: Date

  if (period === 'day') {
    from = new Date(`${selectedDate}T01:00:00.000Z`)
    to   = new Date(`${selectedDate}T01:00:00.000Z`)
    to.setUTCDate(to.getUTCDate() + 1)
  } else if (period === 'week') {
    from = new Date(`${selectedDate}T00:00:00.000Z`)
    from.setUTCDate(from.getUTCDate() + 1)
    to = new Date(from)
    to.setUTCDate(to.getUTCDate() + 6)
  } else {
    to = new Date()
    from = new Date(to)
    if (period === 'month') from.setMonth(to.getMonth() - 1)
    else from.setFullYear(to.getFullYear() - 1)
  }

  const params = new URLSearchParams({
    startTime: toApiTimestamp(from),
    endTime: toApiTimestamp(to),
    targetId,
    mpan,
    interval: period,
  })

  return `${base}/electricity-consumption?${params}`
}

function parseApiTime(time: string | undefined | null): Date {
  if (!time) return new Date(NaN)
  // API returns "YYYY-MM-DD HH:MM:SS.ffffff+HH" — not valid ISO 8601.
  // Normalise to "YYYY-MM-DDTHH:MM:SS.ffffff+HH:00" so all engines parse it correctly.
  return new Date(
    time.replace(' ', 'T').replace(/([+-]\d{2})$/, '$1:00')
  )
}

function formatLabel(time: string | undefined | null, period: Period): string {
  const date = parseApiTime(time)
  if (isNaN(date.getTime())) return ''
  if (period === 'day') return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (period === 'week') return date.toLocaleDateString([], { weekday: 'short', day: 'numeric', timeZone: 'UTC' })
  if (period === 'month') return date.toLocaleDateString([], { day: 'numeric', month: 'short', timeZone: 'UTC' })
  return date.toLocaleDateString([], { month: 'short', year: '2-digit', timeZone: 'UTC' })
}

function formatWeekRange(startDateStr: string): string {
  const from = new Date(`${startDateStr}T00:00:00.000Z`)
  const to = new Date(from)
  to.setUTCDate(to.getUTCDate() + 6)
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', timeZone: 'UTC' }
  return `${from.toLocaleDateString([], opts)} – ${to.toLocaleDateString([], { ...opts, year: 'numeric' })}`
}

function formatDisplayDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00.000Z`).toLocaleDateString([], {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  })
}

export function ConsumptionChart() {
  const [period, setPeriod] = useState<Period>('day')
  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()))
  const [mpan, setMpan] = useState(import.meta.env.VITE_MPAN ?? '')
  const [mpanInput, setMpanInput] = useState(import.meta.env.VITE_MPAN ?? '')
  const [data, setData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!mpan) return
    setLoading(true)
    setError(null)

    getAccessToken()
      .then(token => fetch(buildUrl(period, mpan, selectedDate), {
        headers: { Authorization: `Bearer ${token}` },
      }))
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<ApiResponse>
      })
      .then(({ readings }) => {
setData(
          readings.map(r => ({
            label: formatLabel(r.period, period),
            consumption: parseFloat(r.consumption),
          }))
        )
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [period, mpan, selectedDate])

  function handleMpanSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setMpan(mpanInput.trim())
  }

  function handlePeriodChange(p: Period) {
    if (p === 'week') {
      const d = new Date()
      d.setUTCDate(d.getUTCDate() - 7)
      setSelectedDate(toDateString(d))
    } else if (p === 'day') {
      setSelectedDate(toDateString(new Date()))
    }
    setPeriod(p)
  }

  function stepDate(direction: -1 | 1) {
    const d = new Date(`${selectedDate}T00:00:00.000Z`)
    const days = period === 'week' ? 7 : 1
    d.setUTCDate(d.getUTCDate() + direction * days)
    setSelectedDate(toDateString(d))
  }

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h2>Electricity Consumption</h2>
        <div className="chart-controls">
          <form className="mpan-form" onSubmit={handleMpanSubmit}>
            <label htmlFor="mpan">MPAN</label>
            <input
              id="mpan"
              type="text"
              value={mpanInput}
              onChange={e => setMpanInput(e.target.value)}
              placeholder="Enter MPAN"
              maxLength={21}
            />
            <button type="submit">Apply</button>
          </form>
          <div className="period-selector">
            {PERIODS.map(p => (
              <button
                key={p.value}
                className={period === p.value ? 'active' : ''}
                onClick={() => handlePeriodChange(p.value)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {period === 'week' && (
        <div className="date-nav">
          <button onClick={() => stepDate(-1)} aria-label="Previous week">‹</button>
          <span className="date-label">{formatWeekRange(selectedDate)}</span>
          <button onClick={() => stepDate(1)} aria-label="Next week">›</button>
        </div>
      )}

      {period === 'day' && (
        <div className="date-nav">
          <button onClick={() => stepDate(-1)} aria-label="Previous day">‹</button>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
          />
          <span className="date-label">{formatDisplayDate(selectedDate)}</span>
          <button onClick={() => stepDate(1)} aria-label="Next day">›</button>
        </div>
      )}

      {loading && <div className="chart-state">Loading...</div>}
      {error && <div className="chart-state error">Failed to load data: {error}</div>}

      {!loading && !error && (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              angle={-45}
              textAnchor="end"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              label={{ value: 'kWh', angle: -90, position: 'insideLeft', offset: 10 }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) => [`${Number(value).toFixed(3)} kWh`, 'Consumption']}
            />
            <Bar dataKey="consumption" fill="#4f8ef7" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
