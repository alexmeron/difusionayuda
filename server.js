const express = require('express')
const path    = require('path')
const fs      = require('fs')
const cheerio = require('cheerio')

const app  = express()
const PORT = 3030
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'R8J5WXL5 25%'

function isPassValid(p) {
  if (!p) {
    console.error('[AUTH] Failed: password is empty');
    return false;
  }
  let dec = p;
  try { dec = decodeURIComponent(p); } catch(e){}
  
  const valid = p === ADMIN_PASSWORD || dec === ADMIN_PASSWORD || p === 'R8J5WXL5 25%' || p === 'R8J5WXL5%2025%';
  if (!valid) {
    console.error('[AUTH] Failed: invalid password provided ->', p);
  }
  return valid;
}

const RESUELTOS_FILE = path.join(__dirname, 'resueltos.json')
const REPORTES_FILE  = path.join(__dirname, 'reportes.json')

app.use(express.json())

// ── Manejo de Resueltos Persistentes ──────────────────────────────────────────
function cargarResueltos() {
  try {
    if (fs.existsSync(RESUELTOS_FILE)) {
      return JSON.parse(fs.readFileSync(RESUELTOS_FILE, 'utf8'))
    }
  } catch (e) {
    console.error('[Resueltos] Error al leer resueltos.json:', e.message)
  }
  return []
}

function guardarResueltos(lista) {
  try {
    fs.writeFileSync(RESUELTOS_FILE, JSON.stringify(lista, null, 2), 'utf8')
  } catch (e) {
    console.error('[Resueltos] Error al guardar resueltos.json:', e.message)
  }
}

// ── Manejo de Reportes de Usuarios ────────────────────────────────────────────
function cargarReportes() {
  try {
    if (fs.existsSync(REPORTES_FILE)) {
      return JSON.parse(fs.readFileSync(REPORTES_FILE, 'utf8'))
    }
  } catch (e) {
    console.error('[Reportes] Error al leer reportes.json:', e.message)
  }
  return []
}

function guardarReportes(lista) {
  try {
    fs.writeFileSync(REPORTES_FILE, JSON.stringify(lista, null, 2), 'utf8')
  } catch (e) {
    console.error('[Reportes] Error al guardar reportes.json:', e.message)
  }
}

// ── Cache en Memoria ──────────────────────────────────────────────────────────
const CACHE_TTL = 60_000
let cache = null   // { data, ts }

// ── Scraper ───────────────────────────────────────────────────────────────────
function parseFechaSeg(texto) {
  const m = texto.match(/(\d+)\s*(seg|min|h\b|hora|d[íi]a)/i)
  if (!m) return 0
  const v = parseInt(m[1]), u = m[2].toLowerCase()
  if (u.startsWith('seg'))  return v
  if (u.startsWith('min'))  return v * 60
  if (u.startsWith('h'))    return v * 3600
  if (u.startsWith('d'))    return v * 86400
  return 0
}

async function scrapePage(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; IncendioMonitor/1.0)',
      Accept: 'text/html,application/xhtml+xml',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} → ${url}`)

  const $ = cheerio.load(await res.text())
  const lista = []

  $('article.tarjeta').each((i, el) => {
    const $el = $(el)
    const tipo = $el.hasClass('necesito') ? 'necesito' : 'ofrezco'

    const catTxt   = $el.find('h2').text().trim()
    const catEmoji = catTxt.match(/^\S+/)?.[0] ?? ''
    const categoria = catTxt.replace(/^\S+\s*/, '').trim()

    const lugTxt = $el.find('.tarjeta-lugar').text().replace('📍','').trim()
    const partes = lugTxt.split('·').map(s => s.trim())

    const descripcion = $el.find('.tarjeta-desc').text().trim()
    const contacto    = $el.find('.tarjeta-nombre').text().replace('Contacto:','').trim()
    const fechaRaw    = $el.find('.tarjeta-fecha').text().trim()
    const telHref     = $el.find('.btn-llamar').attr('href') || ''
    const whatsapp    = $el.find('.btn-wasap').attr('href') || ''

    lista.push({
      id: `${tipo}-${i}-${telHref.slice(-6) || 'anon'}`,
      tipo, categoria, catEmoji,
      provincia: partes[0] || '',
      localidad: partes[1] || '',
      descripcion, contacto,
      telefono: telHref.replace('tel:','').trim(),
      whatsapp,
      fecha: fechaRaw,
      fechaSeg: parseFechaSeg(fechaRaw),
    })
  })

  let totalNecesita = 0, totalOfrece = 0
  $('.contador').each((_, el) => {
    const txt = $(el).text()
    const num = parseInt($(el).find('b').text()) || 0
    if (/peticion|solicitud|activa/i.test(txt)) totalNecesita = num
    else if (/oferta|ayuda/i.test(txt))          totalOfrece  = num
  })

  return { lista, totalNecesita, totalOfrece }
}

async function scrapeAll() {
  const BASE = 'https://incendio.sepv.es/'

  const [necesita, ofrece] = await Promise.all([
    scrapePage(BASE + '?tipo=necesito'),
    scrapePage(BASE + '?tipo=ofrezco'),
  ])

  const anuncios = [...necesita.lista, ...ofrece.lista]
    .sort((a, b) => a.fechaSeg - b.fechaSeg)

  return {
    anuncios,
    totalNecesita: necesita.totalNecesita || necesita.lista.length,
    totalOfrece:   ofrece.totalOfrece    || ofrece.lista.length,
    ultimaActualizacion: new Date().toISOString(),
  }
}

// ── API ANUNCIOS Y RESUELTOS ──────────────────────────────────────────────────
app.get('/api/anuncios', async (req, res) => {
  try {
    const { refresh } = req.query
    const now = Date.now()

    if (refresh !== '1' && cache && now - cache.ts < CACHE_TTL) {
      return res.json({ ...cache.data, resueltos: cargarResueltos(), fromCache: true })
    }

    const data = await scrapeAll()
    cache = { data, ts: now }
    res.json({ ...data, resueltos: cargarResueltos(), fromCache: false })
  } catch (err) {
    console.error('[API]', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/resueltos', (_, res) => {
  res.json(cargarResueltos())
})

// ── API ADMIN ─────────────────────────────────────────────────────────────────
app.post('/api/admin/login', (req, res) => {
  let { password } = req.body
  let passDecoded = password
  try { passDecoded = decodeURIComponent(password) } catch(e){}

  if (isPassValid(password)) {
    return res.json({ ok: true, token: 'admin-authenticated-token' })
  }
  res.status(401).json({ ok: false, error: 'Contraseña incorrecta' })
})

app.get('/api/admin/reportes', (req, res) => {
  const { password } = req.query
  let passDecoded = password
  try { passDecoded = decodeURIComponent(password) } catch(e){}

  if (!isPassValid(password)) {
    return res.status(401).json({ ok: false, error: 'No autorizado' })
  }

  res.json(cargarReportes())
})


app.post('/api/reportar-resuelto', (req, res) => {
  const data = req.body;
  if (!data || !data.id) return res.status(400).json({ ok: false });
  
  let reportes = cargarReportes();
  const existe = reportes.some(r => r.id === data.id);
  if (!existe) {
    reportes.push({ ...data, fechaReporte: new Date().toISOString() });
    guardarReportes(reportes);
  }
  res.json({ ok: true });
});

app.post('/api/admin/toggle-resuelto', (req, res) => {
  const { password, id, contacto, localidad, desc } = req.body
  let passDecoded = password
  try { passDecoded = decodeURIComponent(password) } catch(e){}

  if (!isPassValid(password)) {
    return res.status(401).json({ ok: false, error: 'No autorizado' })
  }

  let lista = cargarResueltos()
  const existeIdx = lista.findIndex(item => {
    if (item.id === id) return true;
    if (item.contacto === contacto && item.localidad === localidad && item.desc === desc) return true;
    return false;
  })

  if (existeIdx >= 0) {
    lista.splice(existeIdx, 1)
    guardarResueltos(lista)
    return res.json({ ok: true, resuelto: false, lista })
  } else {
    lista.push({ id, contacto, localidad, desc })
    guardarResueltos(lista)

    // Al resolver, si estaba reportado, eliminarlo de reportes
    let reportes = cargarReportes().filter(r => r.id !== id)
    guardarReportes(reportes)

    return res.json({ ok: true, resuelto: true, lista })
  }
})

app.post('/api/admin/descartar-reporte', (req, res) => {
  const { password, id } = req.body
  let passDecoded = password
  try { passDecoded = decodeURIComponent(password) } catch(e){}

  if (!isPassValid(password)) {
    return res.status(401).json({ ok: false, error: 'No autorizado' })
  }

  let reportes = cargarReportes().filter(r => r.id !== id)
  guardarReportes(reportes)
  res.json({ ok: true, reportes })
})

// ── RUTAS Y ESTÁTICOS ─────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')))

app.get('/admin', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'))
})

app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`\n🔥 Incendio Monitor (FIX LOCAL APLICADO) → http://localhost:${PORT}`)
  console.log(`🔐 Panel Admin     → http://localhost:${PORT}/admin (Pass: ${ADMIN_PASSWORD})\n`)
})
