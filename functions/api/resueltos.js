
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

export async function onRequest(context) {
  let resueltos = RESUELTOS_DEFAULT;
  if (context.env && context.env.RESUELTOS_KV) {
    const kv = await context.env.RESUELTOS_KV.get('resueltos_list', 'json');
    if (kv) resueltos = kv;
  }
  return new Response(JSON.stringify(resueltos), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
