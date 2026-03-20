interface TokenCache {
  accessToken: string
  expiresAt: number
}

let cache: TokenCache | null = null

export async function getAccessToken(): Promise<string> {
  if (cache && Date.now() < cache.expiresAt) {
    return cache.accessToken
  }

  const res = await fetch('/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: import.meta.env.VITE_AUTH0_CLIENT_ID,
      client_secret: import.meta.env.VITE_AUTH0_CLIENT_SECRET,
      audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      grant_type: 'client_credentials',
    }),
  })

  if (!res.ok) throw new Error(`Auth failed: HTTP ${res.status}`)

  const { access_token, expires_in } = await res.json()

  cache = {
    accessToken: access_token,
    // Refresh 30 seconds before actual expiry
    expiresAt: Date.now() + (expires_in - 30) * 1000,
  }

  return cache.accessToken
}
