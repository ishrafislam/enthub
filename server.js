// Production server for Render: serves the built SPA and proxies /api to the
// SportSRC API with the key attached server-side. Mirrors the Vite dev proxy in
// vite.config.ts, so the client keeps calling /api/?type=... in both environments.
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist')
const API_KEY = process.env.SPORTSRC_API_KEY ?? ''
const UPSTREAM = 'https://api.sportsrc.org/v2/'

const app = express()
app.disable('x-powered-by')

app.get('/api/', async (req, res) => {
  if (!API_KEY) {
    res.status(500).json({ success: false, message: 'SPORTSRC_API_KEY is not configured.' })
    return
  }

  const query = new URLSearchParams(req.query).toString()

  try {
    const upstream = await fetch(`${UPSTREAM}?${query}`, {
      headers: { 'X-API-KEY': API_KEY },
    })
    res.status(upstream.status).type('application/json').send(await upstream.text())
  } catch {
    res.status(502).json({ success: false, message: 'Could not reach the sports service.' })
  }
})

app.use(express.static(dist, { maxAge: '1h', index: false }))

// SPA fallback, so deep links like /sports/match/:id survive a hard reload.
app.get(/.*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')))

const port = Number(process.env.PORT) || 3000
app.listen(port, '0.0.0.0', () => console.log(`EntHub listening on ${port}`))
