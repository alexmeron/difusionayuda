/* ════════════════════════════════════════════════════
   Cloudflare Worker Entry Point for difusionayuda
   ════════════════════════════════════════════════════ */

const RESUELTOS_DEFAULT = [
  { contacto: 'éter',    localidad: 'chapinería',          desc: 'gata con 4 crías' },
  { contacto: 'elia',    localidad: 'robledo de chavela',  desc: 'ginebra' },
  { contacto: 'rafa',    localidad: 'navas del rey',       desc: 'pinos 179' },
  { contacto: 'sonia',   localidad: 'navalagamella' },
  { localidad: 'fresnedilla',                              desc: 'rampa para meter tres caballos' },
  { contacto: 'maría',   localidad: 'villa del prado',     desc: 'cuatro perros' },
  { contacto: 'aranzazu', localidad: 'pelayos' },
  { contacto: 'centro h', localidad: 'escorial',           desc: '110 caballos' },
  { contacto: 'rosa',    localidad: 'robledo',             desc: 'quedado dos gatos en una casa' },
  { contacto: 'vanessa', localidad: 'robledo',             desc: 'tres perros' },
  { contacto: 'arancha',                                   desc: 'ovejas quemadas' },
  { contacto: 'araceli', localidad: 'sotillo',             desc: '8 perros' },
  { contacto: 'marta',   localidad: 'chapinería',          desc: 'gallina' },
  { contacto: 'camila',  localidad: 'cadalso' }
];

const ADMIN_PASSWORD = 'R8J5WXL5 25%';

function parseFechaSeg(texto) {
  const m = texto.match(/(\d+)\s*(seg|min|h\b|hora|d[íi]a)/i);
  if (!m) return 0;
  const v = parseInt(m[1]), u = m[2].toLowerCase();
  if (u.startsWith('seg'))  return v;
  if (u.startsWith('min'))  return v * 60;
  if (u.startsWith('h'))    return v * 3600;
  if (u.startsWith('d'))    return v * 86400;
  return 0;
}

function parseHTMLTarjeta(htmlStr, tipoDefault) {
  const lista = [];
  const cardRegex = /<article[^>]*class="[^"]*tarjeta[^"]*"[\s\S]*?<\/article>/gi;
  let match;
  let i = 0;
  while ((match = cardRegex.exec(htmlStr)) !== null) {
    const cardHtml = match[0];
    const esNecesito = cardHtml.includes('necesito');
    const tipo = esNecesito ? 'necesito' : (tipoDefault || 'ofrezco');

    const catMatch = cardHtml.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
    const catRaw = catMatch ? catMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    const catEmoji = catRaw.match(/^\S+/)?.[0] ?? '';
    const categoria = catRaw.replace(/^\S+\s*/, '').trim();

    const lugMatch = cardHtml.match(/class="tarjeta-lugar"[^>]*>([\s\S]*?)<\/p>/i);
    const lugTxt = lugMatch ? lugMatch[1].replace(/<[^>]+>/g, '').replace('📍','').trim() : '';
    const partes = lugTxt.split('·').map(s => s.trim());

    const descMatch = cardHtml.match(/class="tarjeta-desc"[^>]*>([\s\S]*?)<\/p>/i);
    const descripcion = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : '';

    const conMatch = cardHtml.match(/class="tarjeta-nombre"[^>]*>([\s\S]*?)<\/p>/i);
    const contacto = conMatch ? conMatch[1].replace(/<[^>]+>/g, '').replace('Contacto:','').trim() : '';

    const fecMatch = cardHtml.match(/class="tarjeta-fecha"[^>]*>([\s\S]*?)<\/p>/i);
    let fechaRaw = fecMatch ? fecMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    fechaRaw = fechaRaw.split('\n')[0].trim();

    const telMatch = cardHtml.match(/href="tel:([^"]+)"/i);
    const telefono = telMatch ? telMatch[1].trim() : '';

    const waMatch = cardHtml.match(/href="(https:\/\/api\.whatsapp\.com[^"]+)"/i) || cardHtml.match(/href="(https:\/\/wa\.me[^"]+)"/i);
    const whatsapp = waMatch ? waMatch[1].trim() : '';

    lista.push({
      id: `${tipo}-${i}-${telefono.slice(-6) || 'anon'}`,
      tipo, categoria, catEmoji,
      provincia: partes[0] || '',
      localidad: partes[1] || '',
      descripcion, contacto, telefono, whatsapp,
      fecha: fechaRaw,
      fechaSeg: parseFechaSeg(fechaRaw)
    });
    i++;
  }
  return lista;
}

function extraerNumeroContador(htmlStr, keyword) {
  const idx = htmlStr.toLowerCase().indexOf(keyword);
  if (idx === -1) return 0;
  const sub = htmlStr.slice(idx, idx + 300);
  const bStart = sub.indexOf('<b>');
  const bEnd = sub.indexOf('</b>');
  if (bStart !== -1 && bEnd !== -1 && bEnd > bStart) {
    const val = parseInt(sub.slice(bStart + 3, bEnd).trim());
    if (!isNaN(val)) return val;
  }
  return 0;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API Routes
    if (url.pathname === '/api/anuncios') {
      try {
        const BASE = 'https://incendio.sepv.es/';
        const [resNec, resOff] = await Promise.all([
          fetch(BASE + '?tipo=necesito', { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }),
          fetch(BASE + '?tipo=ofrezco', { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } })
        ]);

        const htmlNec = await resNec.text();
        const htmlOff = await resOff.text();

        const listaNec = parseHTMLTarjeta(htmlNec, 'necesito');
        const listaOff = parseHTMLTarjeta(htmlOff, 'ofrezco');
        const anuncios = [...listaNec, ...listaOff].sort((a, b) => a.fechaSeg - b.fechaSeg);

        let totalNecesita = extraerNumeroContador(htmlNec, 'peticion') || 71;
        let totalOfrece = extraerNumeroContador(htmlOff, 'oferta') || 2515;

        return new Response(JSON.stringify({
          anuncios,
          totalNecesita,
          totalOfrece,
          resueltos: RESUELTOS_DEFAULT,
          ultimaActualizacion: new Date().toISOString()
        }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    if (url.pathname === '/api/resueltos') {
      return new Response(JSON.stringify(RESUELTOS_DEFAULT), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/admin/login' && request.method === 'POST') {
      try {
        const { password } = await request.json();
        let passDecoded = password;
        try { passDecoded = decodeURIComponent(password); } catch(e){}
        if (password === ADMIN_PASSWORD || passDecoded === ADMIN_PASSWORD || password === 'R8J5WXL5%2025%') {
          return new Response(JSON.stringify({ ok: true, token: 'admin-token' }), { headers: { 'Content-Type': 'application/json' } });
        }
      } catch(e){}
      return new Response(JSON.stringify({ ok: false, error: 'Contraseña incorrecta' }), { status: 401 });
    }

    // Servir estáticos desde el binding ASSETS
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not found', { status: 404 });
  }
};
