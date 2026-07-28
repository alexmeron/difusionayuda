require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://qjtvpifbrvdyhzgpobyl.supabase.co', 'sb_publishable_C2bn9yZQwa0KFhCl-faRfg_ZuguwVr7');
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const supabaseAdmin = SUPABASE_SERVICE_KEY ? createClient('https://qjtvpifbrvdyhzgpobyl.supabase.co', SUPABASE_SERVICE_KEY) : null;

// Auth Middleware Helper
async function checkAdminAuth(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.replace('Bearer ', '').trim();
  const { data, error } = await supabase.auth.getUser(token);
  return data && data.user ? true : false;
}

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

async function getAsignaciones() {
  if (supabase) {
    const client = supabaseAdmin || supabase;
    const { data } = await client.from('asignaciones').select('*');
    return data || [];
  }
  return [];
}

async function getResueltos() {
  try {
    const { data, error } = await supabase.from('resueltos').select('*');
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error(e);
    return [];
  }
}

// ── Manejo de Reportes de Usuarios ────────────────────────────────────────────
async function getReportes() {
  try {
    const { data, error } = await supabase.from('reportes').select('*');
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error(e);
    return [];
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


const REBECA_AD = {
  id: 'necesito-rebeca-ruiz',
  tipo: 'necesito',
  categoria: 'Perros',
  catEmoji: '🐕',
  provincia: 'Madrid',
  localidad: 'Pelayos',
  descripcion: 'Tengo 2 perros. Una mastín de 50kg con las patas quemadas que no puede caminar y necesita curas. La otra es un galgo y esta bien. Y unos cuantos gatos que estan bien. La finca donde estaban se ha quemado y necesito que me los cuiden hasta que vea donde puedo tenerlos por un tiempo.',
  contacto: 'Rebeca Ruiz Guerrero',
  telefono: '633818486',
  whatsapp: 'https://wa.me/34633818486',
  fecha: 'hace 1 día',
  fechaSeg: 86400
};

async function scrapeAll() {
  const BASE = 'https://incendio.sepv.es/'

  const [necesita, ofrece] = await Promise.all([
    scrapePage(BASE + '?tipo=necesito'),
    scrapePage(BASE + '?tipo=ofrezco'),
  ])

  const anuncios = [...necesita.lista, ...ofrece.lista, REBECA_AD]
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
      return res.json({ ...cache.data, resueltos: await getResueltos(), asignaciones: await getAsignaciones(), fromCache: true })
    }

    const data = await scrapeAll()
    cache = { data, ts: now }
    res.json({ ...data, resueltos: await getResueltos(), asignaciones: await getAsignaciones(), fromCache: false })
  } catch (err) {
    console.error('[API]', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/resueltos', async (_, res) => {
  res.json(await getResueltos())
})

// ── API ADMIN ─────────────────────────────────────────────────────────────────


app.get('/api/admin/reportes', async (req, res) => {
  if (!(await checkAdminAuth(req))) return res.status(401).json({ ok: false, error: 'No autorizado' });
  res.json(await getReportes());
})


app.post('/api/reportar-resuelto', async (req, res) => {
  const data = req.body;
  if (!data || !data.id) return res.status(400).json({ ok: false });
  const { id, contacto, localidad, provincia, categoria, descripcion, telefono, whatsapp } = data;
  await supabase.from('reportes').upsert({ id, contacto, localidad, provincia, categoria, descripcion, telefono, whatsapp });
  res.json({ ok: true, msg: 'Reporte registrado para verificación del admin' });
});

app.post('/api/admin/toggle-resuelto', async (req, res) => {
  if (!(await checkAdminAuth(req))) return res.status(401).json({ ok: false, error: 'No autorizado' });
  
  const { id, contacto, localidad, desc } = req.body;
  const { data: existe } = await supabase.from('resueltos').select('id').eq('id', id).single();
  let resuelto = false;
  
  if (existe) {
    await supabase.from('resueltos').delete().eq('id', id);
  } else {
    await supabase.from('resueltos').insert({ id, contacto, localidad, desc });
    await supabase.from('reportes').delete().eq('id', id);
    resuelto = true;
  }
  
  return res.json({ ok: true, resuelto, lista: await getResueltos() });
})

app.post('/api/admin/descartar-reporte', async (req, res) => {
  if (!(await checkAdminAuth(req))) return res.status(401).json({ ok: false, error: 'No autorizado' });
  
  const { id } = req.body;
  await supabase.from('reportes').delete().eq('id', id);
  res.json({ ok: true });
})

// ── RUTAS Y ESTÁTICOS ─────────────────────────────────────────────────────────

app.post('/api/admin/asignar', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ ok: false, error: 'No autorizado' });
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ ok: false, error: 'No autorizado' });
  
  const { id } = req.body;
  const nombreAdmin = user.user_metadata?.nombre || 'Administrador';
  
  if (supabaseAdmin) await supabaseAdmin.from('asignaciones').upsert({ id, asignado_a: nombreAdmin });
  else await supabase.from('asignaciones').upsert({ id, asignado_a: nombreAdmin });
  res.json({ ok: true, asignado_a: nombreAdmin });
});

app.post('/api/admin/invitar', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ ok: false, error: 'No autorizado' });
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user || user.user_metadata?.rol !== 'superadmin') return res.status(401).json({ ok: false, error: 'No autorizado' });
  
  const { email, nombre } = req.body;
  const { data, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: { nombre, rol: 'admin' }
  });
  
  if (inviteError) return res.status(500).json({ ok: false, error: inviteError.message });
  res.json({ ok: true });
});

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
