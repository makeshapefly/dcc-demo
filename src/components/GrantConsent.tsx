import { useRef, useState } from 'react'
import { getAccessToken } from '../services/auth'
import './GrantConsent.css'

interface BillUploadResponse {
  postcode: string
  mpan: string
}

export function GrantConsent() {
  const [file, setFile] = useState<File | null>(null)
  const [mpan, setMpan] = useState('')
  const [postcode, setPostcode] = useState('')
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BillUploadResponse | null>(null)
  const [consentGranted, setConsentGranted] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File) {
    setFile(f)
    setResult(null)
    setError(null)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setError(null)
    setResult(null)
    setConsentGranted(null)

    const submittedMpan = mpan.trim()
    const submittedPostcode = postcode.trim().replace(/\s+/g, '').toUpperCase()

    try {
      const token = await getAccessToken()
      const body = new FormData()
      body.append('file', file)
      body.append('mpan', submittedMpan)
      body.append('postcode', postcode.trim())

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/bill-upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as BillUploadResponse
      console.log(JSON.stringify(data))

      const normalize = (s: string | undefined | null) =>
        (s ?? '').trim().replace(/\s+/g, '').toUpperCase()

      const normReturnedMpan = normalize(data.mpan)
      const normReturnedPostcode = normalize(data.postcode)
      const normSubmittedMpan = normalize(submittedMpan)
      const normSubmittedPostcode = normalize(submittedPostcode)

      console.log('bill-upload comparison', {
        returnedMpan: normReturnedMpan,
        submittedMpan: normSubmittedMpan,
        mpanMatch: normReturnedMpan === normSubmittedMpan,
        returnedPostcode: normReturnedPostcode,
        submittedPostcode: normSubmittedPostcode,
        postcodeMatch: normReturnedPostcode === normSubmittedPostcode,
      })

      const granted =
        !!normReturnedMpan &&
        !!normReturnedPostcode &&
        normReturnedMpan === normSubmittedMpan &&
        normReturnedPostcode === normSubmittedPostcode

      setConsentGranted(granted)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grant-consent">
      <h2>Step 2 - Grant Consent</h2>
      <p className="gc-subtitle">The Smart Energy Code (SEC) requires the householder to grant consent to third parties to access their meter.
        An approved method is to ask the customer to upload an energy bill so that MPAN and postcode 
        can be extracted thereby proving ownership. This component demonstrates this concept.
      </p>
      <p className="gc-subtitle">Upload your energy bill to extract your meter details and grant consent.</p>

      <form className="gc-form" onSubmit={handleSubmit}>
        <div className="gc-fields">
          <div className="gc-field">
            <label htmlFor="gc-mpan">MPAN</label>
            <input
              id="gc-mpan"
              type="text"
              value={mpan}
              onChange={(e) => setMpan(e.target.value)}
              placeholder="e.g. 1234567890123"
              maxLength={21}
              required
            />
          </div>
          <div className="gc-field">
            <label htmlFor="gc-postcode">Postcode</label>
            <input
              id="gc-postcode"
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="e.g. SW1A 1AA"
              maxLength={8}
              required
            />
          </div>
        </div>

        <div
          className={`gc-dropzone${dragging ? ' dragging' : ''}${file ? ' has-file' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            className="gc-file-input"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {file ? (
            <>
              <span className="gc-dropzone-icon">📄</span>
              <span className="gc-dropzone-filename">{file.name}</span>
              <span className="gc-dropzone-hint">Click to change file</span>
            </>
          ) : (
            <>
              <span className="gc-dropzone-icon">📂</span>
              <span className="gc-dropzone-label">Drop your bill here</span>
              <span className="gc-dropzone-hint">or click to browse — PDF, JPG, PNG</span>
            </>
          )}
        </div>

        <button className="gc-submit" type="submit" disabled={!file || !mpan.trim() || !postcode.trim() || loading}>
          {loading ? 'Uploading…' : 'Upload Bill'}
        </button>
      </form>

      {error && (
        <div className="gc-error">Failed to upload: {error}</div>
      )}

      {result && (
        <>
          {consentGranted === false && (
            <div className="gc-consent-denied">
              Consent was not granted — the details on your bill do not match the MPAN and postcode you provided.
            </div>
          )}
          {consentGranted === true && (
            <div className="gc-consent-granted">
              Consent granted.
            </div>
          )}
          <div className="gc-result">
            <h3>Meter Details from Bill</h3>
            <dl className="gc-details">
              <div className="gc-detail-row">
                <dt>Postcode</dt>
                <dd>{result.postcode}</dd>
              </div>
              <div className="gc-detail-row">
                <dt>MPAN</dt>
                <dd className="gc-mpan">{result.mpan}</dd>
              </div>
            </dl>
          </div>
        </>
      )}
    </div>
  )
}
