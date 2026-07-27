/* ════════════════════════════════════════════════════
   Incendio Animales Monitor — app.js (con Mapa de Matching & Distancias)
   ════════════════════════════════════════════════════ */

// ── CASOS RESUELTOS ───────────────────────────────────────────────────────────
const RESUELTOS = [
  // Gatos · Madrid · Chapinería – "gata con 4 crías" · Contacto: Éter
  { contacto: 'éter',    localidad: 'chapinería',          desc: 'gata con 4 crías' },
  // Gatos · Madrid · Robledo de Chavela – "calle Ginebra, 265" · Contacto: Elia
  { contacto: 'elia',    localidad: 'robledo de chavela',  desc: 'ginebra' },
  // Perros · Madrid · Navas del Rey – "Avda de los pinos 179" · Contacto: Rafa
  { contacto: 'rafa',    localidad: 'navas del rey',       desc: 'pinos 179' },
  // Gatos · Madrid · Navalagamella – "14 gatos" · Contacto: Sonia
  { contacto: 'sonia',   localidad: 'navalagamella' },
  // Caballos · Madrid · Fresnedilla – "Rampa para meter tres caballos" · Contacto: No lo se
  { localidad: 'fresnedilla',                              desc: 'rampa para meter tres caballos' },
  // Perros · Madrid · Villa del Prado – "acogida para cuatro perros" · Contacto: María
  { contacto: 'maría',   localidad: 'villa del prado',     desc: 'cuatro perros' },
  // Transporte · Madrid · Pelayos de la presa · Contacto: Aranzazu
  { contacto: 'aranzazu', localidad: 'pelayos' },
  // Caballos · Madrid · El Escorial – "110 CABALLOS DEL CENTRO HIPICO" · Contacto: Centro hípico
  { contacto: 'centro h', localidad: 'escorial',           desc: '110 caballos' },
  // Gatos · Madrid · Robledo de Chavela – "dos gatos en una casa" · Contacto: Rosa
  { contacto: 'rosa',    localidad: 'robledo',             desc: 'quedado dos gatos en una casa' },
  // Perros · Madrid · Robledo de chavela – "urb la suiza española" · Contacto: Vanessa
  { contacto: 'vanessa', localidad: 'robledo',             desc: 'tres perros' },
  // Ganado · Madrid · Valdemorillo – "ovejas quemadas" · Contacto: Arancha
  { contacto: 'arancha',                                   desc: 'ovejas quemadas' },
  // Perros · Ávila · Sotillo de la Adrada – "8 perros de unos 30 kilos" · Contacto: Araceli
  { contacto: 'araceli', localidad: 'sotillo',             desc: '8 perros' },
  // Gatos · Madrid · Chapinería – "1 pata, 1 gallina y 1 gata" · Contacto: Marta
  { contacto: 'marta',   localidad: 'chapinería',          desc: 'gallina' },
  // Caballos · Madrid · Cadalso – "burrita en Cadalso" · Contacto: Camila
  { contacto: 'camila',  localidad: 'cadalso' },
]

function norm(str) {
  return (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
}

function esResuelto(anuncio) {
  const d = norm(anuncio.descripcion)
  const l = norm(anuncio.localidad + ' ' + anuncio.provincia)
  const c = norm(anuncio.contacto)

  const combo = [...RESUELTOS, ...listaResueltosDinamica]

  return combo.some(r => {
    if (r.id && r.id === anuncio.id) return true;
    if (!r.contacto && !r.localidad && !r.desc) return false;
    if (r.contacto  && !c.includes(norm(r.contacto)))  return false
    if (r.localidad && !l.includes(norm(r.localidad))) return false
    if (r.desc      && !d.includes(norm(r.desc)))      return false
    return true
  })
}

// ── COORDENADAS DE MUNICIPIOS Y GEOLOCALIZACIÓN ──────────────────────────────
const MUNICIPIO_COORDS = {
  // Madrid Capital, Distritos y Área Metropolitana
  'madrid':                  [40.4168, -3.7038],
  'aluche':                  [40.3847, -3.7606],
  'carabanchel':             [40.3750, -3.7430],
  'vallecas':                [40.3833, -3.6500],
  'villaverde':              [40.3450, -3.7000],
  'hortaleza':               [40.4700, -3.6500],
  'tetuan':                  [40.4600, -3.7000],
  'chamberi':                [40.4350, -3.7000],
  'moncloa':                 [40.4400, -3.7300],
  'latin':                   [40.3900, -3.7500],
  'fuencarral':              [40.4900, -3.7000],

  'alcorcon':                [40.3458, -3.8249],
  'alcorcón':                [40.3458, -3.8249],
  'mostoles':                [40.3228, -3.8647],
  'móstoles':                [40.3228, -3.8647],
  'leganes':                 [40.3281, -3.7636],
  'leganés':                 [40.3281, -3.7636],
  'fuenlabrada':             [40.2842, -3.7942],
  'getafe':                  [40.3083, -3.7328],
  'parla':                   [40.2372, -3.7744],
  'valdemoro':               [40.1908, -3.6764],
  'pinto':                   [40.2411, -3.6989],
  'rivas':                   [40.3526, -3.5358],
  'rivas vaciamadrid':       [40.3526, -3.5358],
  'san sebastian de los reyes': [40.5471, -3.6262],
  'alcobendas':              [40.5475, -3.6420],
  'coslada':                 [40.4258, -3.5647],
  'san fernando de henares': [40.4250, -3.5350],
  'torrejon de ardoz':       [40.4597, -3.4800],
  'alcala de henares':       [40.4819, -3.3642],

  // Sierra Oeste de Madrid & Alberche / Guadarrama
  'aldea del fresno':        [40.3236, -4.2028],
  'aldea':                   [40.3236, -4.2028],
  'villanueva del pardillo': [40.4905, -3.9632],
  'pardillo':                [40.4905, -3.9632],
  'villanueva de la canada': [40.4469, -4.0042],
  'villanueva de la cañada': [40.4469, -4.0042],
  'brunete':                 [40.4042, -3.9986],
  'navalcarnero':            [40.2872, -4.0152],
  'sevilla la nueva':        [40.3475, -4.0256],
  'villaviciosa de odon':    [40.3581, -3.9008],
  'villaviciosa de odón':    [40.3581, -3.9008],
  'villaviciosa':            [40.3581, -3.9008],
  'boadilla del monte':      [40.4069, -3.8825],
  'boadilla':                [40.4069, -3.8825],
  'majadahonda':             [40.4736, -3.8719],
  'las rozas':               [40.4925, -3.8739],
  'las rozas de madrid':     [40.4925, -3.8739],
  'rozas':                   [40.4925, -3.8739],
  'pozuelo de alarcon':      [40.4358, -3.8139],
  'pozuelo de alarcón':     [40.4358, -3.8139],
  'pozuelo':                 [40.4358, -3.8139],
  'robledo de chavela':      [40.5019, -4.2403],
  'robledo':                 [40.5019, -4.2403],
  'navas del rey':           [40.3861, -4.2536],
  'navas':                   [40.3861, -4.2536],
  'chapineria':              [40.3800, -4.2086],
  'chapinería':             [40.3800, -4.2086],
  'navalagamella':           [40.4689, -4.1239],
  'villa del prado':         [40.2764, -4.3061],
  'pelayos de la presa':     [40.3606, -4.3314],
  'pelayos':                 [40.3606, -4.3314],
  'san martin de valdeiglesias': [40.3622, -4.3986],
  'san martín de valdeiglesias': [40.3622, -4.3986],
  'san martin':              [40.3622, -4.3986],
  'cadalso de los vidrios':  [40.3014, -4.4419],
  'cadalso':                 [40.3014, -4.4419],
  'cenicientos':             [40.2583, -4.4639],
  'rozas de puerto real':    [40.3092, -4.4897],
  'el escorial':             [40.5822, -4.1278],
  'escorial':                [40.5822, -4.1278],
  'san lorenzo de el escorial': [40.5906, -4.1481],
  'san lorenzo':             [40.5906, -4.1481],
  'valdemorillo':            [40.4694, -4.0667],
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
  'el boalo':                [40.7186, -3.9211],
  'boalo':                   [40.7186, -3.9211],
  'soto del real':           [40.7522, -3.7844],
  'buitrago':                [40.9933, -3.6339],
  'lozoyuela':               [40.9272, -3.6192],

  // Ávila / Tiétar
  'sotillo de la adrada':    [40.2825, -4.5847],
  'sotillo':                 [40.2825, -4.5847],
  'la adrada':               [40.2989, -4.6367],
  'adrada':                  [40.2989, -4.6367],
  'piedralaves':             [40.3139, -4.6975],
  'casillas':                [40.3200, -4.5700],
  'santa maria del tietar':  [40.3000, -4.5500],
  'fresnedilla':             [40.3167, -4.6167],
  'higuera de las duenas':   [40.2417, -4.6000],
  'el tiemblo':              [40.4136, -4.5003],
  'tiemblo':                 [40.4136, -4.5003],
  'cebreros':                [40.4558, -4.4639],
  'navas del marques':       [40.6022, -4.3314],
  'lanzahita':               [40.2117, -4.9333],
  'arenas de san pedro':     [40.2089, -5.0864],
  'arenas':                  [40.2089, -5.0864],
  'avila':                   [40.6567, -4.6814],
  'ávila':                   [40.6567, -4.6814],

  // Toledo Norte / Comarca de Torrijos / Talavera
  'almorox':                 [40.2369, -4.4578],
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
}

const PROVINCIA_COORDS = {
  'madrid': [40.4168, -3.7038],
  'avila': [40.6567, -4.6814],
  'toledo': [39.8628, -4.0273],
  'castellon': [39.9864, -0.0513],
  'alava': [42.8467, -2.6716],
  'vizcaya': [43.2630, -2.9350],
  'barcelona': [41.3851, 2.1734],
  'malaga': [36.7213, -4.4214],
  'cantabria': [43.1828, -3.9878]
}

function obtenerCoordenadas(localidad, provincia, descripcion) {
  const loc  = norm(localidad)
  const prov = norm(provincia)
  const desc = norm(descripcion)

  // 1. Coincidencia exacta o parcial en nombre del municipio
  if (loc) {
    for (const k in MUNICIPIO_COORDS) {
      if (loc.includes(k) || k.includes(loc)) return MUNICIPIO_COORDS[k]
    }
  }

  // 2. Coincidencia en el texto de la descripción
  if (desc) {
    for (const k in MUNICIPIO_COORDS) {
      if (k.length > 3 && desc.includes(k)) return MUNICIPIO_COORDS[k]
    }
  }

  // 3. Fallback por provincia
  for (const k in PROVINCIA_COORDS) {
    if (prov && prov.includes(k)) return PROVINCIA_COORDS[k]
  }

  return PROVINCIA_COORDS['madrid'] || [40.4168, -3.7038]
}

function calcularDistanciaKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

// ── SISTEMA DE MATCHING ───────────────────────────────────────────────────────
function calcularMatchScore(necesidad, oferta) {
  let score = 0
  const razones = []
  let distanciaKm = null

  const cNec = obtenerCoordenadas(necesidad.localidad, necesidad.provincia, necesidad.descripcion)
  const cOff = obtenerCoordenadas(oferta.localidad, oferta.provincia, oferta.descripcion)

  if (cNec && cOff) {
    distanciaKm = calcularDistanciaKm(cNec[0], cNec[1], cOff[0], cOff[1])
    const loc1Norm = norm(necesidad.localidad)
    const loc2Norm = norm(oferta.localidad)
    const sonMismoPueblo = loc1Norm && loc2Norm && (loc1Norm.includes(loc2Norm) || loc2Norm.includes(loc1Norm))

    if (distanciaKm === 0 && sonMismoPueblo) {
      score += 55
      razones.push(`📏 En el mismo municipio (~0 km)`)
    } else if (distanciaKm <= 15) {
      score += 50
      razones.push(`📏 Muy cercano (~${distanciaKm} km)`)
    } else if (distanciaKm <= 35) {
      score += 38
      razones.push(`📏 Distancia cercana (~${distanciaKm} km)`)
    } else if (distanciaKm <= 15) {
      score += 50
      razones.push(`📏 Muy cercano (~${distanciaKm} km)`)
    } else if (distanciaKm <= 35) {
      score += 38
      razones.push(`📏 Distancia media (~${distanciaKm} km)`)
    } else if (distanciaKm <= 75) {
      score += 25
      razones.push(`📏 Misma comarca/región (~${distanciaKm} km)`)
    } else {
      score += 10
      razones.push(`📏 Distancia: ~${distanciaKm} km`)
    }
  } else {
    const necProv = norm(necesidad.provincia)
    const necLoc  = norm(necesidad.localidad)
    const offProv = norm(oferta.provincia)
    const offLoc  = norm(oferta.localidad)
    const offDesc = norm(oferta.descripcion)

    if (necLoc && offLoc && (necLoc.includes(offLoc) || offLoc.includes(necLoc))) {
      score += 45
      razones.push(`📍 Misma localidad (${necesidad.localidad})`)
    } else if (necProv && offProv && necProv === offProv) {
      score += 25
      razones.push(`📍 Misma provincia (${necesidad.provincia})`)
    }
  }

  const necCat = norm(necesidad.categoria)
  const offCat = norm(oferta.categoria)

  if (necCat === offCat) {
    score += 40
    razones.push(`🐾 Categoría exacta (${necesidad.categoria})`)
  } else if (offCat.includes('transporte') || offCat.includes('alojamiento') || offCat.includes('pienso') || offCat.includes('veterin')) {
    score += 30
    razones.push(`🤝 Servicio compatible (${oferta.categoria})`)
  } else if (offCat.includes('otros')) {
    score += 15
    razones.push(`🤝 Ayuda general`)
  }

  const keywords = ['perro', 'gato', 'caballo', 'vaca', 'coche', 'furgoneta', 'jardin', 'acogida', 'pienso', 'veterin']
  keywords.forEach(kw => {
    if (norm(necesidad.descripcion).includes(kw) && norm(oferta.descripcion).includes(kw)) {
      score += 5
    }
  })

  return { score: Math.min(99, Math.max(10, score)), razones, distanciaKm }
}


function buscarTopMatchesParaOferta(oferta, peticiones, limite = 8) {
  const matches = []
  for (const nec of peticiones) {
    const { score, razones, distanciaKm } = calcularMatchScore(nec, oferta)
    if (score > 15) {
      matches.push({ necesidad: nec, score, razones, distanciaKm })
    }
  }
  matches.sort((a, b) => b.score - a.score)
  return matches.slice(0, limite)
}

function buscarTopMatchesParaNecesidad(necesidad, ofertas, max = 6) {
  return ofertas
    .map(off => ({ oferta: off, ...calcularMatchScore(necesidad, off) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
}

// ── ESTADO DE LA APP ──────────────────────────────────────────────────────────
const REFRESH_SEG = 60
const ANUNCIOS_POR_PAGINA = 12
let listaResueltosDinamica = []

let todosLosAnuncios   = []
let filtroTipo        = ''
let filtroCat         = ''
let filtroProvincia   = ''
let ocultarResueltos  = true
let paginaActual      = 1
let countdownVal      = REFRESH_SEG
let fetchTimer        = null
let countdownTimer    = null
let cargando          = false

let mapaInstance     = null
let modoMapaActivo   = false

// ── FETCH ─────────────────────────────────────────────────────────────────────
async function fetchData(force = false) {
  if (cargando) return
  cargando = true

  const dot = document.getElementById('pulse-dot')
  const ico = document.getElementById('refresh-ico')
  const btn = document.getElementById('btn-refresh')
  if (dot) dot.classList.add('cargando')
  if (ico) ico.classList.add('spin')
  if (btn) btn.disabled = true

  const statusTxt = document.getElementById('status-txt')
  if (statusTxt) statusTxt.textContent = 'Actualizando…'

  try {
    const params = new URLSearchParams()
    if (force) params.set('refresh', '1')

    const res  = await fetch(`/api/anuncios?${params}`)
    if (!res.ok) throw new Error(`Error ${res.status}`)
    const data = await res.json()
    if (data.error) throw new Error(data.error)

    todosLosAnuncios = data.anuncios || []
    if (data.resueltos && Array.isArray(data.resueltos)) {
      listaResueltosDinamica = data.resueltos
    }

    window._totalNecesita = data.totalNecesita
    window._totalOfrece   = data.totalOfrece

    const hora = new Date(data.ultimaActualizacion).toLocaleTimeString('es-ES',
      { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    if (statusTxt) {
      statusTxt.textContent = `${data.fromCache ? '(cache) ' : ''}Actualizado a las ${hora}`
    }

    renderFiltrado()
    resetCountdown()
  } catch (e) {
    if (statusTxt) statusTxt.textContent = 'Error al actualizar'
  } finally {
    cargando = false
    if (dot) dot.classList.remove('cargando')
    if (ico) ico.classList.remove('spin')
    if (btn) btn.disabled = false
  }
}

// ── RENDER ────────────────────────────────────────────────────────────────────
function renderFiltrado() {
  const inputBusqueda = document.getElementById('input-busqueda')
  const busqueda = norm(inputBusqueda ? inputBusqueda.value : '')
  const checkEl = document.getElementById('check-ocultar-resueltos')
  if (checkEl) ocultarResueltos = checkEl.checked

  const btnMapaToggle = document.getElementById('btn-toggle-mapa')
  if (btnMapaToggle) {
    btnMapaToggle.style.display = (filtroTipo === 'matching') ? 'inline-flex' : 'none'
  }

  // 1. Contadores de activos no resueltos
  const noResueltos = todosLosAnuncios.filter(a => !esResuelto(a))
  const cntNecesita = noResueltos.filter(a => a.tipo === 'necesito').length
  const cntOfrece   = noResueltos.filter(a => a.tipo === 'ofrezco').length

  const elNecesita = document.getElementById('stat-necesita')
  const elOfrece   = document.getElementById('stat-ofrece')

  if (elNecesita) elNecesita.textContent = cntNecesita

  const ofrezcoOcultados = todosLosAnuncios.filter(a => a.tipo === 'ofrezco').length - cntOfrece
  const totalOfreceReal  = (window._totalOfrece ?? 0) - ofrezcoOcultados
  if (elOfrece) {
    elOfrece.textContent = totalOfreceReal > 0
      ? totalOfreceReal.toLocaleString('es')
      : cntOfrece
  }

  // 2. MODO MATCHING (Emparejamientos)
  if (filtroTipo === 'matching') {
    renderModoMatching(noResueltos, busqueda)
    if (modoMapaActivo) {
      inicializarMapaMatching()
    }
    return
  } else {
    const mapaWrap = document.getElementById('mapa-matching-wrap')
    if (mapaWrap) mapaWrap.hidden = true
  }

  // 3. Modo normal (Todos / Necesitan / Ofrecen)
  const visibles = todosLosAnuncios.filter(a => {
    const resuelto = esResuelto(a)
    if (ocultarResueltos && resuelto) return false

    if (filtroTipo && a.tipo !== filtroTipo) return false
    if (filtroCat && !norm(a.categoria).includes(norm(filtroCat))) return false
    if (filtroProvincia && norm(a.provincia) !== norm(filtroProvincia)) return false
    if (busqueda) {
      const haystack = norm(`${a.descripcion} ${a.categoria} ${a.provincia} ${a.localidad} ${a.contacto}`)
      if (!haystack.includes(busqueda)) return false
    }
    return true
  })

  const grid = document.getElementById('grid')
  if (!grid) return

  if (visibles.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--gtxt); padding: 3rem 1rem;">No hay anuncios con los filtros actuales.</div>'
    renderPaginacion(0, 0)
    return
  }

  // 4. Paginación
  const totalPaginas = Math.ceil(visibles.length / ANUNCIOS_POR_PAGINA) || 1
  if (paginaActual > totalPaginas) paginaActual = 1

  const inicio = (paginaActual - 1) * ANUNCIOS_POR_PAGINA
  const fin    = inicio + ANUNCIOS_POR_PAGINA
  const paginaAnuncios = visibles.slice(inicio, fin)

  grid.innerHTML = paginaAnuncios.map(tarjetaHTML).join('')

  renderPaginacion(totalPaginas, visibles.length)
}

// ── RENDER MODO MATCHING ──────────────────────────────────────────────────────
function renderModoMatching(noResueltos, busqueda) {
  const grid = document.getElementById('grid')
  if (!grid) return

  let peticiones = noResueltos.filter(a => a.tipo === 'necesito')
  const ofertas  = noResueltos.filter(a => a.tipo === 'ofrezco')

  if (filtroCat) peticiones = peticiones.filter(a => norm(a.categoria).includes(norm(filtroCat)))
  if (filtroProvincia) peticiones = peticiones.filter(a => norm(a.provincia) !== norm(filtroProvincia))
  if (busqueda) {
    peticiones = peticiones.filter(a => {
      const haystack = norm(`${a.descripcion} ${a.categoria} ${a.provincia} ${a.localidad} ${a.contacto}`)
      return haystack.includes(busqueda)
    })
  }

  if (peticiones.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--gtxt); padding: 3rem 1rem;">No hay peticiones activas para emparejar con los filtros actuales.</div>'
    renderPaginacion(0, 0)
    return
  }

  const PAG_MATCH = 4
  const totalPaginas = Math.ceil(peticiones.length / PAG_MATCH) || 1
  if (paginaActual > totalPaginas) paginaActual = 1

  const inicio = (paginaActual - 1) * PAG_MATCH
  const fin    = inicio + PAG_MATCH
  const pagPeticiones = peticiones.slice(inicio, fin)

  grid.innerHTML = pagPeticiones.map(nec => {
    const topMatches = buscarTopMatchesParaNecesidad(nec, ofertas, 6)
    const lugarNec = [nec.provincia, nec.localidad].filter(Boolean).join(' · ')

    return `
      <div class="card-matching-pair">
        <div class="matching-pair-header">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:.5rem;">
            <span class="badge necesito">🆘 PETICIÓN DE AYUDA</span>
            <span style="font-size:.78rem; color:var(--gtxt);">${escHtml(nec.fecha)}</span>
          </div>
          <h3 style="font-size:1.15rem; margin:.2rem 0; color:var(--blanco); font-weight:800;">${escHtml(nec.categoriaEmoji)} ${escHtml(nec.categoria)}</h3>
          ${lugarNec ? `<p style="font-size:.82rem; color:var(--naranja); margin:0;">📍 ${escHtml(lugarNec)}</p>` : ''}
          <p style="font-size:.85rem; color:#c5bdb0; margin:.3rem 0 0; line-height:1.5;">${escHtml(nec.descripcion)}</p>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:.5rem; pt:.4rem; border-top:1px solid rgba(255,255,255,.08); flex-wrap:wrap; gap:.5rem;">
            <span style="font-size:.78rem; color:var(--gtxt);">👤 Contacto: ${escHtml(nec.contacto || 'Anónimo')}</span>
            <div style="display:flex; gap:.3rem;">
              ${nec.telefono ? `<a href="tel:${escHtml(nec.telefono)}" class="btn-accion btn-llamar">📞 Llamar</a>` : ''}
              ${nec.whatsapp ? `<a href="${escHtml(nec.whatsapp)}" target="_blank" rel="noopener" class="btn-accion btn-wasap">💬 WhatsApp</a>` : ''}
            </div>
          </div>
        </div>

        <div>
          <h4 style="font-size:.9rem; color:var(--naranja); margin-bottom:.8rem; display:flex; align-items:center; gap:.4rem;">
            🎯 Ayuda compatible mas cercana (${topMatches.length} que ofrecen ayuda)
          </h4>
          <div class="matching-offers-grid">
            ${topMatches.map(m => {
              const off = m.oferta
              const lugarOff = [off.provincia, off.localidad].filter(Boolean).join(' · ')
              const distTxt = m.distanciaKm != null ? ` 📏 ~${m.distanciaKm} km` : ''
              return `
                <div class="match-offer-card">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="match-score-badge">⚡ ${m.score}% MATCH${distTxt}</span>
                    <span style="font-size:.72rem; color:var(--gtxt);">${escHtml(off.fecha)}</span>
                  </div>
                  <div class="match-reasons">${m.razones.join(' · ')}</div>
                  <h5 style="font-size:.95rem; font-weight:700; margin:0; color:var(--blanco);">${escHtml(off.categoriaEmoji)} ${escHtml(off.categoria)}</h5>
                  ${lugarOff ? `<p style="font-size:.78rem; color:var(--naranja); margin:0;">📍 ${escHtml(lugarOff)}</p>` : ''}
                  <p style="font-size:.8rem; color:#c5bdb0; margin:0; line-height:1.45; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">${escHtml(off.descripcion)}</p>
                  <div style="margin-top:auto; pt:.4rem; border-top:1px solid rgba(255,255,255,.08); display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:.74rem; color:var(--gtxt); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">👤 ${escHtml(off.contacto)}</span>
                    <div style="display:flex; gap:.3rem;">
                      ${off.telefono ? `<a href="tel:${escHtml(off.telefono)}" class="btn-accion btn-llamar" style="padding:.25rem .6rem; font-size:.7rem;">📞 Llamar</a>` : ''}
                      ${off.whatsapp ? `<a href="${escHtml(off.whatsapp)}" target="_blank" rel="noopener" class="btn-accion btn-wasap" style="padding:.25rem .6rem; font-size:.7rem;">💬 WhatsApp</a>` : ''}
                    </div>
                  </div>
                </div>
              `
            }).join('')}
          </div>
        </div>
      </div>
    `
  }).join('')

  renderPaginacion(totalPaginas, peticiones.length)
}

// ── TOGGLE & MAPA LEAFLET EN SECCIÓN MATCHING ────────────────────────────────
function toggleMapaMatching() {
  modoMapaActivo = !modoMapaActivo
  const wrap = document.getElementById('mapa-matching-wrap')
  const btn  = document.getElementById('btn-toggle-mapa')

  if (!wrap) return

  if (modoMapaActivo) {
    wrap.hidden = false
    if (btn) btn.innerHTML = '📋 Ver en Lista'
    inicializarMapaMatching()
  } else {
    wrap.hidden = true
    if (btn) btn.innerHTML = '🗺️ Ver en Mapa'
  }
}

function inicializarMapaMatching() {
  if (typeof L === 'undefined') return

  const mapContainer = document.getElementById('mapa-matching')
  if (!mapContainer) return

  if (!mapaInstance) {
    mapaInstance = L.map('mapa-matching').setView([40.4168, -3.8500], 10)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(mapaInstance)
  }

  setTimeout(() => {
    mapaInstance.invalidateSize()
  }, 150)

  // Limpiar marcadores y líneas anteriores
  mapaInstance.eachLayer((layer) => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline) {
      mapaInstance.removeLayer(layer)
    }
  })

  const noResueltos = todosLosAnuncios.filter(a => !esResuelto(a))
  const peticiones  = noResueltos.filter(a => a.tipo === 'necesito')
  const ofertas     = noResueltos.filter(a => a.tipo === 'ofrezco')

  const bounds = []

  peticiones.forEach((nec) => {
    const cNec = obtenerCoordenadas(nec.localidad, nec.provincia, nec.descripcion)
    if (!cNec) return

    const redIcon = L.divIcon({
      className: 'custom-map-marker marker-necesita',
      html: `<div style="background:#e63946; color:#fff; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:bold; box-shadow:0 0 10px rgba(230,57,70,0.8); border:2px solid #fff;">🆘</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    })

    const markerNec = L.marker([cNec[0], cNec[1]], { icon: redIcon }).addTo(mapaInstance)
    const btnsNec = `
      <div style="display:flex; gap:4px; margin-top:6px;">
        ${nec.telefono ? `<a href="tel:${escHtml(nec.telefono)}" style="background:#2a9d8f; color:#fff; padding:3px 8px; border-radius:6px; text-decoration:none; font-size:11px; font-weight:bold;">📞 Llamar</a>` : ''}
        ${nec.whatsapp ? `<a href="${escHtml(nec.whatsapp)}" target="_blank" rel="noopener" style="background:#25d366; color:#fff; padding:3px 8px; border-radius:6px; text-decoration:none; font-size:11px; font-weight:bold;">💬 WhatsApp</a>` : ''}
      </div>`

    markerNec.bindPopup(`
      <div style="font-family:sans-serif; padding:4px; min-width:180px;">
        <b style="color:#e63946;">🆘 PETICIÓN: ${escHtml(nec.categoria)}</b><br/>
        <small style="color:#f4a261;">📍 ${escHtml(nec.provincia)} ${escHtml(nec.localidad)}</small><br/>
        <p style="font-size:12px; margin:6px 0; color:#ddd; line-height:1.4;">${escHtml(nec.descripcion.slice(0, 120))}...</p>
        <small style="color:#aaa;">👤 ${escHtml(nec.contacto || 'Anónimo')}</small>
        ${btnsNec}
      </div>
    `)

    bounds.push([cNec[0], cNec[1]])

    const topMatches = buscarTopMatchesParaNecesidad(nec, ofertas, 3)

    topMatches.forEach((m) => {
      const off = m.oferta
      const cOff = obtenerCoordenadas(off.localidad, off.provincia, off.descripcion)
      if (!cOff) return

      const greenIcon = L.divIcon({
        className: 'custom-map-marker marker-ofrece',
        html: `<div style="background:#2a9d8f; color:#fff; border-radius:50%; width:26px; height:26px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; box-shadow:0 0 8px rgba(42,157,143,0.8); border:2px solid #fff;">🤝</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      })

      const markerOff = L.marker([cOff[0], cOff[1]], { icon: greenIcon }).addTo(mapaInstance)
      const distTxt = m.distanciaKm != null ? ` 📏 ~${m.distanciaKm} km` : ''
      const btnsOff = `
        <div style="display:flex; gap:4px; margin-top:6px;">
          ${off.telefono ? `<a href="tel:${escHtml(off.telefono)}" style="background:#2a9d8f; color:#fff; padding:3px 8px; border-radius:6px; text-decoration:none; font-size:11px; font-weight:bold;">📞 Llamar</a>` : ''}
          ${off.whatsapp ? `<a href="${escHtml(off.whatsapp)}" target="_blank" rel="noopener" style="background:#25d366; color:#fff; padding:3px 8px; border-radius:6px; text-decoration:none; font-size:11px; font-weight:bold;">💬 WhatsApp</a>` : ''}
        </div>`

      markerOff.bindPopup(`
        <div style="font-family:sans-serif; padding:4px; min-width:180px;">
          <b style="color:#2a9d8f;">🤝 OFRECE AYUDA (${m.score}% MATCH${distTxt})</b><br/>
          <small style="color:#f4a261;">📍 ${escHtml(off.provincia)} ${escHtml(off.localidad)}</small><br/>
          <p style="font-size:12px; margin:6px 0; color:#ddd; line-height:1.4;">${escHtml(off.descripcion.slice(0, 120))}...</p>
          <small style="color:#aaa;">👤 ${escHtml(off.contacto || 'Anónimo')}</small>
          ${btnsOff}
        </div>
      `)

      bounds.push([cOff[0], cOff[1]])

      L.polyline([[cNec[0], cNec[1]], [cOff[0], cOff[1]]], {
        color: '#f4a261',
        weight: 2,
        dashArray: '5, 8',
        opacity: 0.7
      }).addTo(mapaInstance)
    })
  })

  if (bounds.length > 0) {
    mapaInstance.fitBounds(bounds, { padding: [30, 30] })
  }
}

// ── MODAL MATCHING PARA UNA PETICIÓN INDIVIDUAL ──────────────────────────────
function abrirModalMatch(idAnuncio) {
  const anuncioSelected = todosLosAnuncios.find(a => a.id === idAnuncio)
  if (!anuncioSelected) return

  const noResueltos = todosLosAnuncios.filter(a => !esResuelto(a))
  const isNecesidad = anuncioSelected.tipo === 'necesito'

  const lugarBase = [anuncioSelected.provincia, anuncioSelected.localidad].filter(Boolean).join(' · ')
  const bodyEl = document.getElementById('modal-body')

  if (isNecesidad) {
    const nec = anuncioSelected
    const ofertas = noResueltos.filter(a => a.tipo === 'ofrezco')
    const topMatches = buscarTopMatchesParaNecesidad(nec, ofertas, 8)

    document.getElementById('modal-title').textContent = `🎯 Ayuda compatible mas cercana para: ${nec.categoria}`
    document.getElementById('modal-sub').textContent = `📍 ${lugarBase || 'Ubicación no especificada'} · Contacto: ${nec.contacto || 'Anónimo'}`

    bodyEl.innerHTML = `
      <div style="background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); padding:1rem; border-radius:12px; display:flex; flex-direction:column; gap:.6rem;">
        <p style="font-size:.85rem; color:var(--blanco); margin:0; line-height:1.5;">${escHtml(nec.descripcion)}</p>
        <div style="display:flex; justify-content:space-between; align-items:center; pt:.4rem; border-top:1px solid rgba(255,255,255,.08); flex-wrap:wrap; gap:.4rem;">
          <span style="font-size:.78rem; color:var(--gtxt);">👤 Contacto: ${escHtml(nec.contacto || 'Anónimo')}</span>
          <div style="display:flex; gap:.4rem;">
            ${nec.telefono ? `<a href="tel:${escHtml(nec.telefono)}" class="btn-accion btn-llamar">📞 Llamar a quien necesita</a>` : ''}
            ${nec.whatsapp ? `<a href="${escHtml(nec.whatsapp)}" target="_blank" rel="noopener" class="btn-accion btn-wasap">💬 WhatsApp</a>` : ''}
          </div>
        </div>
      </div>

      <h4 style="font-size:.95rem; color:var(--naranja); margin:0; display:flex; align-items:center; gap:.4rem;">
        Ayuda compatible mas cercana (${topMatches.length} que ofrecen ayuda):
      </h4>

      <div style="display:flex; flex-direction:column; gap:.8rem;">
        ${topMatches.map((m, idx) => {
          const off = m.oferta
          const lugarOff = [off.provincia, off.localidad].filter(Boolean).join(' · ')
          const distTxt = m.distanciaKm != null ? ` · 📏 ~${m.distanciaKm} km de distancia` : ''
          return `
            <div style="background:var(--g1); border:1.5px solid var(--g3); border-radius:12px; padding:1rem; display:flex; flex-direction:column; gap:.5rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:.4rem;">
                <span class="match-score-badge">#${idx+1} · ⚡ ${m.score}% MATCH${distTxt}</span>
                <span style="font-size:.74rem; color:var(--gtxt);">${escHtml(off.fecha)}</span>
              </div>
              <div style="font-size:.78rem; color:var(--verde); font-weight:600;">${m.razones.join(' · ')}</div>
              <h5 style="font-size:.95rem; margin:0; color:var(--blanco);">${off.catEmoji || ''} ${off.categoria} ${lugarOff ? `· <span style="color:var(--naranja); font-size:.82rem;">📍 ${lugarOff}</span>` : ''}</h5>
              <p style="font-size:.83rem; color:#c5bdb0; margin:0; line-height:1.4;">${escHtml(off.descripcion)}</p>
              <div style="display:flex; justify-content:space-between; align-items:center; pt:.4rem; border-top:1px solid rgba(255,255,255,.06); flex-wrap:wrap; gap:.4rem;">
                <span style="font-size:.78rem; color:var(--gtxt);">👤 Contacto: ${escHtml(off.contacto || 'Particular')}</span>
                <div style="display:flex; gap:.3rem;">
                  ${off.telefono ? `<a href="tel:${escHtml(off.telefono)}" class="btn-accion btn-llamar">📞 Llamar</a>` : ''}
                  ${off.whatsapp ? `<a href="${escHtml(off.whatsapp)}" target="_blank" rel="noopener" class="btn-accion btn-wasap">💬 WhatsApp</a>` : ''}
                </div>
              </div>
            </div>
          `
        }).join('')}
      </div>
    `
  } else {
    // Es una oferta (ofrezco) -> Buscar peticiones que necesitan ayuda
    const off = anuncioSelected
    const peticiones = noResueltos.filter(a => a.tipo === 'necesito')
    const topMatches = buscarTopMatchesParaOferta(off, peticiones, 8)

    document.getElementById('modal-title').textContent = `🎯 Peticiones de ayuda compatibles para tu oferta: ${off.categoria}`
    document.getElementById('modal-sub').textContent = `📍 ${lugarBase || 'Ubicación no especificada'} · Contacto: ${off.contacto || 'Anónimo'}`

    bodyEl.innerHTML = `
      <div style="background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); padding:1rem; border-radius:12px; display:flex; flex-direction:column; gap:.6rem;">
        <p style="font-size:.85rem; color:var(--blanco); margin:0; line-height:1.5;">${escHtml(off.descripcion)}</p>
        <div style="display:flex; justify-content:space-between; align-items:center; pt:.4rem; border-top:1px solid rgba(255,255,255,.08); flex-wrap:wrap; gap:.4rem;">
          <span style="font-size:.78rem; color:var(--gtxt);">👤 Contacto: ${escHtml(off.contacto || 'Particular')}</span>
          <div style="display:flex; gap:.4rem;">
            ${off.telefono ? `<a href="tel:${escHtml(off.telefono)}" class="btn-accion btn-llamar">📞 Llamar a quien ofrece</a>` : ''}
            ${off.whatsapp ? `<a href="${escHtml(off.whatsapp)}" target="_blank" rel="noopener" class="btn-accion btn-wasap">💬 WhatsApp</a>` : ''}
          </div>
        </div>
      </div>

      <h4 style="font-size:.95rem; color:var(--rojo); margin:0; display:flex; align-items:center; gap:.4rem;">
        🆘 Peticiones que necesitan esta ayuda (${topMatches.length} peticiones compatibles):
      </h4>

      <div style="display:flex; flex-direction:column; gap:.8rem;">
        ${topMatches.map((m, idx) => {
          const nec = m.necesidad
          const lugarNec = [nec.provincia, nec.localidad].filter(Boolean).join(' · ')
          const distTxt = m.distanciaKm != null ? ` · 📏 ~${m.distanciaKm} km de distancia` : ''
          return `
            <div style="background:var(--g1); border:1.5px solid var(--g3); border-radius:12px; padding:1rem; display:flex; flex-direction:column; gap:.5rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:.4rem;">
                <span class="match-score-badge" style="background:rgba(230,57,70,.15); color:#ff9090; border-color:rgba(230,57,70,.3);">#${idx+1} · ⚡ ${m.score}% MATCH${distTxt}</span>
                <span style="font-size:.74rem; color:var(--gtxt);">${escHtml(nec.fecha)}</span>
              </div>
              <div style="font-size:.78rem; color:var(--verde); font-weight:600;">${m.razones.join(' · ')}</div>
              <h5 style="font-size:.95rem; margin:0; color:var(--blanco);">${nec.catEmoji || ''} ${nec.categoria} ${lugarNec ? `· <span style="color:var(--naranja); font-size:.82rem;">📍 ${lugarNec}</span>` : ''}</h5>
              <p style="font-size:.83rem; color:#c5bdb0; margin:0; line-height:1.4;">${escHtml(nec.descripcion)}</p>
              <div style="display:flex; justify-content:space-between; align-items:center; pt:.4rem; border-top:1px solid rgba(255,255,255,.06); flex-wrap:wrap; gap:.4rem;">
                <span style="font-size:.78rem; color:var(--gtxt);">👤 Contacto: ${escHtml(nec.contacto || 'Anónimo')}</span>
                <div style="display:flex; gap:.3rem;">
                  ${nec.telefono ? `<a href="tel:${escHtml(nec.telefono)}" class="btn-accion btn-llamar">📞 Llamar</a>` : ''}
                  ${nec.whatsapp ? `<a href="${escHtml(nec.whatsapp)}" target="_blank" rel="noopener" class="btn-accion btn-wasap">💬 WhatsApp</a>` : ''}
                </div>
              </div>
            </div>
          `
        }).join('')}
      </div>
    `
  }

  document.getElementById('modal-match').classList.add('activo')
}

function cerrarModalMatch() {
  const modal = document.getElementById('modal-match')
  if (modal) modal.classList.remove('activo')
}

function renderPaginacion(totalPaginas, totalVisibles) {
  const wrap = document.getElementById('paginacion-wrap')
  if (!wrap) return

  if (totalPaginas <= 1) {
    wrap.innerHTML = ''
    wrap.hidden = true
    return
  }

  wrap.hidden = false

  const inicioIdx = (paginaActual - 1) * ANUNCIOS_POR_PAGINA + 1
  const finIdx    = Math.min(paginaActual * ANUNCIOS_POR_PAGINA, totalVisibles)

  let html = `
    <div class="paginacion-info">
      Mostrando <strong>${inicioIdx}-${finIdx}</strong> de <strong>${totalVisibles}</strong> · Página <strong>${paginaActual}</strong> de <strong>${totalPaginas}</strong>
    </div>
    <div class="paginacion-btns">
      <button class="btn-pag" ${paginaActual === 1 ? 'disabled' : ''} onclick="cambiarPagina(${paginaActual - 1})">
        ← Anterior
      </button>
  `

  for (let i = 1; i <= totalPaginas; i++) {
    if (
      i === 1 ||
      i === totalPaginas ||
      (i >= paginaActual - 1 && i <= paginaActual + 1)
    ) {
      html += `<button class="btn-pag-num ${i === paginaActual ? 'activo' : ''}" onclick="cambiarPagina(${i})">${i}</button>`
    } else if (
      (i === 2 && paginaActual > 3) ||
      (i === totalPaginas - 1 && paginaActual < totalPaginas - 2)
    ) {
      html += `<span class="pag-dots">…</span>`
    }
  }

  html += `
      <button class="btn-pag" ${paginaActual === totalPaginas ? 'disabled' : ''} onclick="cambiarPagina(${paginaActual + 1})">
        Siguiente →
      </button>
    </div>
  `

  wrap.innerHTML = html
}

function cambiarPagina(p) {
  paginaActual = p
  renderFiltrado()
  const gridEl = document.getElementById('grid')
  if (gridEl) {
    gridEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}




function reportarResueltoUsuario(idAnuncio, btnEl) {
  const a = todosLosAnuncios.find(item => item.id === idAnuncio)
  if (!a) return

  const confirmacion = confirm(`¿Deseas notificar que este caso (${a.contacto || 'Particular'} - ${a.localidad || a.provincia}) ya ha sido resuelto?\n\nEl administrador recibirá la notificación en su panel de control para verificarlo.`)
  if (!confirmacion) return

  fetch('/api/reportar-resuelto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(a)
  })
  .then(res => res.json())
  .then(data => {
    if (data.ok) {
      if (btnEl) {
        btnEl.textContent = '⌛ Notificado p/ revisión'
        btnEl.disabled = true
        btnEl.style.opacity = '0.6'
        btnEl.style.cursor = 'default'
      }
      mostrarToast('🚩 Notificación enviada al panel de administración')
    } else {
      alert('Error: ' + (data.error || 'No se pudo registrar el reporte'))
    }
  })
  .catch(err => {
    console.error('Error al reportar:', err)
    alert('Error al enviar la notificación')
  })
}


function tarjetaHTML(a) {
  const esNecesita = a.tipo === 'necesito'
  const resuelto   = esResuelto(a)
  const lugar = [a.provincia, a.localidad].filter(Boolean).join(' · ')
  return `
    <article class="card ${a.tipo} ${resuelto ? 'card-resuelto' : ''}">
      <div class="card-top">
        <span class="badge ${a.tipo}">${esNecesita ? '🆘 NECESITA AYUDA' : '🤝 OFRECE AYUDA'}</span>
        ${resuelto ? '<span class="badge badge-resuelto">✅ SOLUCIONADO</span>' : ''}
        <span class="card-fecha">${escHtml(a.fecha)}</span>
      </div>
      ${a.catEmoji ? `<p class="card-cat">${escHtml(a.catEmoji)} ${escHtml(a.categoria)}</p>` : ''}
      ${lugar ? `<p class="card-lugar">📍 ${escHtml(lugar)}</p>` : ''}
      <p class="card-desc">${escHtml(a.descripcion)}</p>
      ${esNecesita && !resuelto ? `<button class="btn-match-card" onclick="abrirModalMatch('${a.id}')">🎯 Ver ayuda compatible (Match)</button>` : ''}
      <div class="card-foot">
        ${a.contacto ? `<span class="card-contacto">👤 ${escHtml(a.contacto)}</span>` : ''}
        <div class="card-btns">
          ${a.telefono ? `<a href="tel:${escHtml(a.telefono)}" class="btn-accion btn-llamar" id="llamar-${escHtml(a.id)}">📞 Llamar</a>` : ''}
          ${a.whatsapp ? `<a href="${escHtml(a.whatsapp)}" target="_blank" rel="noopener" class="btn-accion btn-wasap" id="wasap-${escHtml(a.id)}">💬 WhatsApp</a>` : ''}
          </div>
            </div>
      ${esNecesita && !resuelto ? `<button class="btn-solucionado-card" style="background:rgba(42,157,143,.1); color:#60e0d5; border: 1.5px solid rgba(42,157,143,.3); padding:.5rem; margin-top:.8rem; width:100%; border-radius:8px; font-size:.8rem; font-weight:700; cursor:pointer; transition: all 0.2s; display:block;" onmouseover="this.style.background='rgba(42,157,143,.2)'; this.style.borderColor='rgba(42,157,143,.5)'" onmouseout="this.style.background='rgba(42,157,143,.1)'; this.style.borderColor='rgba(42,157,143,.3)'" onclick="reportarResueltoUsuario('${a.id}', this)">✅ Marcar como solucionado</button>` : ''}
    </article>`
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ── FILTROS ───────────────────────────────────────────────────────────────────
function setTipo(v) {
  filtroTipo = v
  paginaActual = 1
  document.querySelectorAll('.chip-tipo').forEach(el => {
    el.classList.toggle('activo-tipo', el.dataset.tipo === v)
  })
  renderFiltrado()
}

function setCat(v) {
  filtroCat = v
  paginaActual = 1
  document.querySelectorAll('.chip-cat').forEach(el => {
    el.classList.toggle('activo-cat', el.dataset.cat === v)
  })
  renderFiltrado()
}

function setProvincia(v) {
  filtroProvincia = v
  paginaActual = 1
  renderFiltrado()
}

function setOcultarResueltos(checked) {
  ocultarResueltos = checked
  paginaActual = 1
  renderFiltrado()
}

// ── COUNTDOWN ─────────────────────────────────────────────────────────────────
function resetCountdown() {
  countdownVal = REFRESH_SEG
  clearInterval(countdownTimer)
  clearInterval(fetchTimer)

  countdownTimer = setInterval(() => {
    countdownVal--
    const pct = ((REFRESH_SEG - countdownVal) / REFRESH_SEG) * 100
    const fillEl = document.getElementById('progress-fill')
    const countEl = document.getElementById('countdown')
    if (fillEl) fillEl.style.width = pct + '%'
    if (countEl) countEl.textContent = countdownVal + 's'
    if (countdownVal <= 0) {
      clearInterval(countdownTimer)
      fetchData()
    }
  }, 1000)
}

// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  fetchData()
})
