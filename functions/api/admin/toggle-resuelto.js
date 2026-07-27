
const ADMIN_PASSWORD = 'R8J5WXL5 25%';
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

export async function onRequestPost(context) {
  try {
    const { password, id, contacto, localidad, desc } = await context.request.json();
    let passDecoded = password;
    try { passDecoded = decodeURIComponent(password); } catch(e){}

    if (password !== ADMIN_PASSWORD && passDecoded !== ADMIN_PASSWORD && password !== 'R8J5WXL5%2025%') {
      return new Response(JSON.stringify({ ok: false, error: 'No autorizado' }), { status: 401 });
    }

    let resueltos = RESUELTOS_DEFAULT;
    if (context.env && context.env.RESUELTOS_KV) {
      const kv = await context.env.RESUELTOS_KV.get('resueltos_list', 'json');
      if (kv) resueltos = kv;
    }

    const idx = resueltos.findIndex(r => r.id === id);
    let esRes = false;
    if (idx >= 0) {
      resueltos.splice(idx, 1);
      esRes = false;
    } else {
      resueltos.push({ id, contacto, localidad, desc });
      esRes = true;
    }

    if (context.env && context.env.RESUELTOS_KV) {
      await context.env.RESUELTOS_KV.put('resueltos_list', JSON.stringify(resueltos));
      // Remove from reportes if present
      let reportes = (await context.env.RESUELTOS_KV.get('reportes_list', 'json')) || [];
      reportes = reportes.filter(r => r.id !== id);
      await context.env.RESUELTOS_KV.put('reportes_list', JSON.stringify(reportes));
    }

    return new Response(JSON.stringify({ ok: true, resuelto: esRes, lista: resueltos }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch(e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 400 });
  }
}
