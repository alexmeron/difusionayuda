
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

function parseHTMLTarjeta(htmlStr, tipoDefault) {
  const lista = [];
  const cardRegex = /<article[^>]*class="[^"]*tarjeta[^"]*"[sS]*?</article>/gi;
  let match;
  let i = 0;
  while ((match = cardRegex.exec(htmlStr)) !== null) {
    const cardHtml = match[0];
    const esNecesito = cardHtml.includes('necesito');
    const tipo = esNecesito ? 'necesito' : (tipoDefault || 'ofrezco');

    const catMatch = cardHtml.match(/<h2[^>]*>([sS]*?)</h2>/i);
    const catRaw = catMatch ? catMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    const catEmoji = catRaw.match(/^\S+/)?.[0] ?? '';
    const categoria = catRaw.replace(/^\S+\s*/, '').trim();

    const lugMatch = cardHtml.match(/class="tarjeta-lugar"[^>]*>([sS]*?)</p>/i);
    const lugTxt = lugMatch ? lugMatch[1].replace(/<[^>]+>/g, '').replace('📍','').trim() : '';
    const partes = lugTxt.split('·').map(s => s.trim());

    const descMatch = cardHtml.match(/class="tarjeta-desc"[^>]*>([sS]*?)</p>/i);
    const descripcion = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : '';

    const conMatch = cardHtml.match(/class="tarjeta-nombre"[^>]*>([sS]*?)</p>/i);
    const contacto = conMatch ? conMatch[1].replace(/<[^>]+>/g, '').replace('Contacto:','').trim() : '';

    const fecMatch = cardHtml.match(/class="tarjeta-fecha"[^>]*>([sS]*?)</p>/i);
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

export async function onRequest(context) {
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

    let totalNecesita = 71, totalOfrece = 2515;
    const necNumMatch = htmlNec.match(/solicitud|peticion[\s\S]*?<b>(\d+)</b>/i);
    if (necNumMatch) totalNecesita = parseInt(necNumMatch[1]);

    const offNumMatch = htmlOff.match(/oferta|ayuda[\s\S]*?<b>(\d+)</b>/i);
    if (offNumMatch) totalOfrece = parseInt(offNumMatch[1]);

    let resueltos = RESUELTOS_DEFAULT;
    if (context.env && context.env.RESUELTOS_KV) {
      const kv = await context.env.RESUELTOS_KV.get('resueltos_list', 'json');
      if (kv) resueltos = kv;
    }

    return new Response(JSON.stringify({
      anuncios,
      totalNecesita,
      totalOfrece,
      resueltos,
      ultimaActualizacion: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
