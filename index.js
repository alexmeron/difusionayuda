
function isPassValid(p) {
  if (!p) return false;
  let dec = p;
  try { dec = decodeURIComponent(p); } catch(e){}
  return p === ADMIN_PASSWORD || dec === ADMIN_PASSWORD || p === 'R8J5WXL5 25%' || p === 'R8J5WXL5%2025%';
}
/* ════════════════════════════════════════════════════
   Cloudflare Worker Entry Point for difusionayuda
   ════════════════════════════════════════════════════ */


const COORDENADAS = {
  'madrid':                  [40.4168, -3.7038],
  'alcorcon':                [40.3458, -3.8247],
  'alcorcón':                [40.3458, -3.8247],
  'mostoles':                [40.3228, -3.8647],
  'móstoles':                [40.3228, -3.8647],
  'leganes':                 [40.3281, -3.7636],
  'leganés':                 [40.3281, -3.7636],
  'fuenlabrada':             [40.2842, -3.7942],
  'getafe':                  [40.3083, -3.7328],
  'parla':                   [40.2372, -3.7744],
  'valdemoro':               [40.1908, -3.6764],
  'pinto':                   [40.2411, -3.6989],
  'aldea del fresno':        [40.3236, -4.2028],
  'villanueva del pardillo': [40.4905, -3.9632],
  'villanueva de la canada': [40.4469, -4.0042],
  'villanueva de la cañada': [40.4469, -4.0042],
  'brunete':                 [40.4042, -3.9986],
  'navalcarnero':            [40.2872, -4.0152],
  'sevilla la nueva':        [40.3475, -4.0256],
  'villaviciosa de odon':    [40.3581, -3.9008],
  'villaviciosa de odón':    [40.3581, -3.9008],
  'boadilla del monte':      [40.4069, -3.8825],
  'boadilla':                [40.4069, -3.8825],
  'majadahonda':             [40.4736, -3.8719],
  'las rozas':               [40.4925, -3.8739],
  'las rozas de madrid':     [40.4925, -3.8739],
  'pozuelo de alarcon':      [40.4358, -3.8139],
  'pozuelo de alarcón':     [40.4358, -3.8139],
  'pozuelo':                 [40.4358, -3.8139],
  'robledo de chavela':      [40.5019, -4.2386],
  'robledo':                 [40.5019, -4.2386],
  'navas del rey':           [40.3861, -4.2525],
  'chapineria':              [40.3811, -4.2097],
  'chapinería':             [40.3811, -4.2097],
  'navalagamella':           [40.4667, -4.1239],
  'villa del prado':         [40.2694, -4.3056],
  'pelayos de la presa':     [40.3603, -4.3314],
  'pelayos':                 [40.3603, -4.3314],
  'san martin de valdeiglesias': [40.3622, -4.3986],
  'san martín de valdeiglesias': [40.3622, -4.3986],
  'cadalso de los vidrios':  [40.3006, -4.4428],
  'cadalso':                 [40.3006, -4.4428],
  'cenicientos':             [40.2583, -4.4639],
  'rozas de puerto real':    [40.3092, -4.4897],
  'el escorial':             [40.5828, -4.1278],
  'escorial':                [40.5828, -4.1278],
  'san lorenzo de el escorial': [40.5906, -4.1481],
  'valdemorillo':            [40.4789, -4.0664],
  'colmenarejo':             [40.5583, -4.0139],
  'galapagar':               [40.5786, -4.0044],
  'torrelodones':            [40.5764, -3.8306],
  'collado villalba':        [40.6406, -4.0086],
  'villalba':                [40.6406, -4.0086],
  'alpedrete':               [40.5833, -4.0167],
  'moralzarzal':             [40.6789, -3.9681],
  'guadarrama':              [40.6728, -4.0886],
  'cercedilla':              [40.7389, -4.0544],
  'becerril de la sierra':   [40.7072, -4.0181],
  'sotillo de la adrada':    [40.2833, -4.5833],
  'sotillo':                 [40.2833, -4.5833],
  'la adrada':               [40.2989, -4.6367],
  'piedralaves':             [40.3167, -4.7000],
  'casillas':                [40.3200, -4.5700],
  'santa maria del tietar':  [40.3000, -4.5500],
  'fresnedilla':             [40.3167, -4.6167],
  'higuera de las duenas':   [40.2417, -4.6000],
  'el tiemblo':              [40.4136, -4.5003],
  'cebreros':                [40.4558, -4.4639],
  'lanzahita':               [40.2117, -4.9333],
  'arenas de san pedro':     [40.2089, -5.0867],
  'avila':                   [40.6567, -4.6814],
  'ávila':                   [40.6567, -4.6814],
  'almorox':                 [40.2333, -4.3833],
  'escalona':                [40.1667, -4.4000],
  'maqueda':                 [40.0667, -4.3667],
  'torrijos':                [39.9833, -4.2833],
  'mentrida':                [40.2378, -4.1956],
  'méntrida':                [40.2378, -4.1956],
  'santa cruz del retamar':  [40.1206, -4.2389],
  'las ventas de retamosa':  [40.1558, -4.1136],
  'valmojado':               [40.2044, -4.0911],
  'casarrubios del monte':   [40.1872, -4.0375],
  'chozas de canales':       [40.0983, -4.0436],
  'talavera de la reina':    [39.9628, -4.8308],
  'talavera':                [39.9628, -4.8308],
  'toledo':                  [39.8628, -4.0273]
};

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

    const conMatch = cardHtml.match(/class="tarjeta-nombre"[^>]*>([\s\S]*?)<\/(?:span|p|div)>/i);
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


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

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

        return jsonResponse({
          anuncios,
          totalNecesita,
          totalOfrece,
          resueltos: (env.KV ? (await env.KV.get('resueltos', { type: 'json' })) || RESUELTOS_DEFAULT : RESUELTOS_DEFAULT),
          ultimaActualizacion: new Date().toISOString()});
      } catch (err) {
        return jsonResponse({ error: err.message }, 500);
      }
    }

    
    
    async function getResueltos() {
      if (!env.KV) return RESUELTOS_DEFAULT;
      try { return (await env.KV.get('resueltos', { type: 'json' })) || RESUELTOS_DEFAULT; }
      catch (e) { return RESUELTOS_DEFAULT; }
    }
    async function getReportes() {
      if (!env.KV) return [];
      try { return (await env.KV.get('reportes', { type: 'json' })) || []; }
      catch (e) { return []; }
    }
    async function saveResueltos(data) {
      if (env.KV) await env.KV.put('resueltos', JSON.stringify(data));
    }
    async function saveReportes(data) {
      if (env.KV) await env.KV.put('reportes', JSON.stringify(data));
    }

    if (url.pathname === '/api/reportar-resuelto'
 && request.method === 'POST') {
      try {
        const body = await request.json();
        const { id, contacto, localidad, provincia, categoria, descripcion, telefono, whatsapp } = body;
        if (!id) return jsonResponse({ ok: false, error: 'Falta ID' }, 400);
        
        let reportesList = await getReportes();
        const existe = reportesList.find(r => r.id === id);
        if (!existe) {
          reportesList.push({
            id, contacto, localidad, provincia, categoria, descripcion, telefono, whatsapp,
            fechaReporte: new Date().toISOString()
          });
          await saveReportes(reportesList);
        }
        return jsonResponse({ ok: true, msg: 'Reporte registrado para verificación del admin' });
      } catch (err) {
        return jsonResponse({ ok: false, error: err.message }, 500);
      }
    }

    if (url.pathname === '/api/admin/reportes' && request.method === 'GET') {
      const p = url.searchParams.get('password');
      if (!isPassValid(p)) return jsonResponse({ ok: false, error: 'No autorizado' }, 401);
      return jsonResponse(await getReportes());
    }

    if (url.pathname === '/api/admin/descartar-reporte' && request.method === 'POST') {
      try {
        const { password, id } = await request.json();
        if (!isPassValid(password)) return jsonResponse({ ok: false, error: 'No autorizado' }, 401);
        
        let repList = await getReportes();
        repList = repList.filter(r => r.id !== id);
        await saveReportes(repList);
        return jsonResponse({ ok: true, reportes: repList });
      } catch (err) {
        return jsonResponse({ ok: false, error: err.message }, 500);
      }
    }

    if (url.pathname === '/api/admin/toggle-resuelto' && request.method === 'POST') {
      try {
        const { password, id, contacto, localidad, desc } = await request.json();
        if (!isPassValid(password)) return jsonResponse({ ok: false, error: 'No autorizado' }, 401);
        
        let resList = await getResueltos();
        let repList = await getReportes();
        const existeIdx = resList.findIndex(item => item.id === id);
        let resuelto = false;
        
        if (existeIdx >= 0) {
          resList.splice(existeIdx, 1);
        } else {
          resList.push({ id, contacto, localidad, desc });
          repList = repList.filter(r => r.id !== id);
          await saveReportes(repList);
          resuelto = true;
        }
        
        await saveResueltos(resList);
        return jsonResponse({ ok: true, resuelto, lista: resList });
      } catch (err) {
        return jsonResponse({ ok: false, error: err.message }, 500);
      }
    }

    if (url.pathname === '/api/resueltos') {
      return jsonResponse(await getResueltos());
    }

    if (url.pathname === '/api/admin/login' && request.method === 'POST') {
      try {
        const { password } = await request.json();
        let passDecoded = password;
        try { passDecoded = decodeURIComponent(password); } catch(e){}
        if (password === ADMIN_PASSWORD || passDecoded === ADMIN_PASSWORD || password === 'R8J5WXL5%2025%') {
          return jsonResponse({ ok: true, token: 'admin-token' });
        }
      } catch(e){}
      return jsonResponse({ ok: false, error: 'Contraseña incorrecta' }, 401);
    }

    // Servir estáticos desde el binding ASSETS
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not found', { status: 404 });
  }
};
