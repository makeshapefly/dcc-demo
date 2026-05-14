import { useState } from 'react'
import './PostcodeLookup.css'

export function PostcodeLookup() {
  const [postcode, setPostcode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // TODO: replace with actual endpoint
      throw new Error('API endpoint not yet configured')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lookup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="postcode-lookup">
      <h2>Step 1 - Postcode Lookup</h2>
      <p className="pl-subtitle">The DCC provides an endpoint for looking up MPANs associated
        with a postcode. This is only available through DCC Connect and so is not yet implemented.</p>
      <p className="pl-subtitle">Enter a postcode to look up meter information.</p>

      <form className="pl-form" onSubmit={handleSubmit}>
        <div className="pl-field">
          <label htmlFor="pl-postcode">Postcode</label>
          <div className="pl-input-row">
            <input
              id="pl-postcode"
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="e.g. SW1A 1AA"
              maxLength={8}
              required
              autoComplete="postal-code"
            />
            <button type="submit" className="pl-submit" disabled={!postcode.trim() || loading}>
              {loading ? 'Looking up…' : 'Look up'}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="pl-error">{error}</div>
      )}
    </div>
  )
}
