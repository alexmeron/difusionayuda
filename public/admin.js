/* ════════════════════════════════════════════════════
   Incendio Monitor — Admin JS (Supabase Auth)
   ════════════════════════════════════════════════════ */

// Supabase se inicializa tras el CDN, dentro de DOMContentLoaded
const SUPABASE_URL = 'https://qjtvpifbrvdyhzgpobyl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_C2bn9yZQwa0KFhCl-faRfg_ZuguwVr7';
let supabaseClient = null;

let authToken = localStorage.getItem('sb-auth-token') || '';
let todosAnunciosAdmin = [];
let listaResueltosAdmin = [];
let listaReportesAdmin  = [];
let filtroTipoAdmin       = '';   // '' | 'necesito' | 'ofrezco'
let ocultarResueltosAdmin  = true;


function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return supabaseClient;
}

async function loginAdmin() {
  const emailInput = document.getElementById('admin-email-input');
  const passInput  = document.getElementById('admin-pass-input');
  const errEl      = document.getElementById('login-error');
  errEl.hidden = true;

  try {
    const sb = getSupabaseClient();
    const { data, error } = await sb.auth.signInWithPassword({
      email: emailInput.value.trim(),
      password: passInput.value
    });
    if (error) throw error;

    authToken = data.session.access_token;
    localStorage.setItem('sb-auth-token', authToken);
    mostrarDashboard();
  } catch (e) {
    errEl.textContent = e.message || 'Error de autenticación';
    errEl.hidden = false;
  }
}

async function logoutAdmin() {
  const sb = getSupabaseClient();
  await sb.auth.signOut();
  localStorage.removeItem('sb-auth-token');
  authToken = '';
  document.getElementById('section-dashboard').hidden = true;
  document.getElementById('section-login').hidden = false;
}


function norm(str) {
  return (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function esResueltoAdmin(anuncio) {
  const d = norm(anuncio.descripcion);
  const l = norm(anuncio.localidad + ' ' + anuncio.provincia);
  const c = norm(anuncio.contacto);

  return listaResueltosAdmin.some(r => {
    if (r.id && r.id === anuncio.id) return true;
    if (!r.contacto && !r.localidad && !r.desc) return false;
    if (r.contacto  && !c.includes(norm(r.contacto)))  return false;
    if (r.localidad && !l.includes(norm(r.localidad))) return false;
    if (r.desc      && !d.includes(norm(r.desc)))      return false;
    return true;
  });
}

async function cargarDatosAdmin() {
  try {
    const res = await fetch('/api/anuncios?refresh=1')
    const data = await res.json()
        const sb = getSupabaseClient();
    const { data: { session } } = await sb.auth.getSession();
    let rol = 'admin';
    let nombre = 'Admin';
    if (session && session.user && session.user.user_metadata) {
      rol = session.user.user_metadata.rol || 'admin';
      nombre = session.user.user_metadata.nombre || 'Admin';
    }
    const invitarWrap = document.getElementById('admin-invitar-wrap');
    if (invitarWrap) {
      invitarWrap.hidden = (rol !== 'superadmin');
    }
    todosAnunciosAdmin = data.anuncios || []
    listaResueltosAdmin = data.resueltos || []
    listaAsignacionesAdmin = data.asignaciones || []

    // Cargar reportes pendientes de verificación
    const resRep = await fetch('/api/admin/reportes', {
      headers: { 'Authorization': 'Bearer ' + authToken }
    })
    if (resRep.ok) {
      listaReportesAdmin = await resRep.json()
    }

    renderAdminReportes()
    renderAdminList()
  } catch (e) {
    alert('Error al cargar anuncios: ' + e.message)
  }
}

function mostrarDashboard() {
  document.getElementById('section-login').hidden = true
  document.getElementById('section-dashboard').hidden = false
  cargarDatosAdmin()
}

function renderAdminReportes() {
  const wrap = document.getElementById('admin-reportes-wrap')
  const list = document.getElementById('admin-reportes-list')
  const cnt  = document.getElementById('cnt-reportes')

  if (!wrap || !list) return

  if (!listaReportesAdmin || listaReportesAdmin.length === 0) {
    wrap.hidden = true
    return
  }

  wrap.hidden = false
  cnt.textContent = listaReportesAdmin.length

  list.innerHTML = listaReportesAdmin.map(r => {
    const lugar = [r.provincia, r.localidad].filter(Boolean).join(' · ')
    const fechaRep = new Date(r.fechaReporte).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

    return `
      <div style="background:var(--g1); border:1.5px solid var(--g3); border-radius:12px; padding:1rem; display:flex; justify-content:space-between; align-items:center; gap:1rem; flex-wrap:wrap;">
        <div style="flex:1; min-width:260px;">
          <div style="display:flex; gap:.4rem; align-items:center; flex-wrap:wrap; margin-bottom:.2rem;">
            <span class="badge ${r.tipo}">${r.tipo === 'necesito' ? '🆘 PETICIÓN' : '🤝 OFERTA'}</span>
            <span style="font-size:.78rem; color:var(--naranja); font-weight:600;">Notificado como resuelto a las ${fechaRep}</span>
          </div>
          <h4 style="font-size:.95rem; margin:0; color:var(--blanco);">${r.catEmoji || ''} ${r.categoria || 'Anuncio'} ${lugar ? `· 📍 ${lugar}` : ''}</h4>
          <p style="font-size:.82rem; color:#c5bdb0; margin:.2rem 0; line-height:1.4;">${r.descripcion || ''}</p>
          <div style="font-size:.78rem; color:var(--gtxt);">👤 Contacto: <strong>${r.contacto || 'Anónimo'}</strong> ${r.telefono ? `· 📞 ${r.telefono}` : ''}</div>
        </div>

        <div style="display:flex; gap:.4rem; flex-wrap:wrap; align-items:center;">
          ${r.telefono ? `<a href="tel:${r.telefono}" class="btn-accion btn-llamar" style="font-size:.75rem;">📞 Llamar p/ verificar</a>` : ''}
          ${r.whatsapp ? `<a href="${r.whatsapp}" target="_blank" rel="noopener" class="btn-accion btn-wasap" style="font-size:.75rem;">💬 WhatsApp</a>` : ''}
          <button onclick="aprobarReporteAdmin('${r.id}')" class="btn-toggle-admin btn-toggle-oculto" style="font-size:.75rem; padding:.4rem .8rem;">✅ Aprobar y Ocultar</button>
          <button onclick='descartarReporteAdmin("${r.id}")' class="btn-pag" style="font-size:.75rem; padding:.4rem .7rem;">❌ Descartar</button>
        </div>
      </div>
    `
  }).join('')
}


async function aprobarReporteAdmin(id) {
  const r = listaReportesAdmin.find(item => item.id === id)
  if (r) {
    await toggleResueltoAnuncio(r)
  } else {
    await toggleResueltoAnuncio(id)
  }
  descartarReporteAdmin(id)
}


async function descartarReporteAdmin(id) {
  try {
    const res = await fetch('/api/admin/descartar-reporte', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken },
      body: JSON.stringify({ id })
    })
    const data = await res.json()
    if (data.ok) {
      listaReportesAdmin = data.reportes || []
      renderAdminReportes()
    }
  } catch (e) {
    console.error('Error al descartar reporte:', e)
  }
}


async function toggleResueltoAnuncio(anuncioOrId) {
  let id = typeof anuncioOrId === 'string' ? anuncioOrId : anuncioOrId.id
  let anuncio = todosAnunciosAdmin.find(a => a.id === id) || (typeof anuncioOrId === 'object' ? anuncioOrId : { id })

  try {
    const res = await fetch('/api/admin/toggle-resuelto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken },
      body: JSON.stringify({
        
        id: anuncio.id,
        contacto: anuncio.contacto || '',
        localidad: anuncio.localidad || anuncio.provincia || '',
        desc: anuncio.descripcion ? anuncio.descripcion.slice(0, 40) : ''
      })
    })

    const text = await res.text()
    let data = {}
    try {
      data = JSON.parse(text)
    } catch(err) {
      throw new Error('Respuesta no válida del servidor: ' + text)
    }

    if (!res.ok || !data.ok) throw new Error(data.error || 'Error al guardar cambios')

    listaResueltosAdmin = data.lista || []
    renderAdminList()
  } catch (e) {
    alert('Error: ' + e.message)
  }
}


function renderAdminList() {
  const busqueda = norm(document.getElementById('admin-busqueda').value)
  const container = document.getElementById('admin-list')
  const checkEl = document.getElementById('admin-check-ocultar-resueltos')
  if (checkEl) ocultarResueltosAdmin = checkEl.checked

  let cntNecesito = 0, cntOfrezco = 0

  const items = todosAnunciosAdmin.map(a => {
    const resuelto = esResueltoAdmin(a)
    if (!resuelto) {
      if (a.tipo === 'necesito') cntNecesito++
      else if (a.tipo === 'ofrezco') cntOfrezco++
    }
    return { anuncio: a, resuelto }
  })

  document.getElementById('acnt-necesito').textContent = cntNecesito
  document.getElementById('acnt-ofrezco').textContent  = cntOfrezco

  const filtrados = items.filter(item => {
    const a = item.anuncio

    if (ocultarResueltosAdmin && item.resuelto) return false

    if (filtroTipoAdmin && a.tipo !== filtroTipoAdmin) return false

    if (busqueda) {
      const haystack = norm(`${a.descripcion} ${a.categoria} ${a.provincia} ${a.localidad} ${a.contacto}`)
      if (!haystack.includes(busqueda)) return false
    }
    return true
  })

  if (filtrados.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding:3rem; color:var(--gtxt);">No se encontraron anuncios con los filtros seleccionados.</div>'
    return
  }

  container.innerHTML = filtrados.map(item => {
    const a = item.anuncio
    const esRes = item.resuelto
    const esNecesita = a.tipo === 'necesito'
    const lugar = [a.provincia, a.localidad].filter(Boolean).join(' · ')

    return `
      <div class="admin-card ${esRes ? 'is-oculto' : ''}">
        <div style="flex:1; min-width:280px;">
          <div style="display:flex; gap:.5rem; align-items:center; margin-bottom:.3rem; flex-wrap:wrap;">
            <span class="badge ${a.tipo}">${esNecesita ? 'NOTIFICADO / PETICIÓN' : '🤝 OFRECE AYUDA'}</span>
            ${esRes ? '<span class="badge badge-resuelto">🔴 OCULTO / RESUELTO</span>' : '<span class="badge" style="background:rgba(42,157,143,.2); color:#60e0d5;">🟢 VISIBLE</span>'}
            <span style="font-size:.75rem; color:var(--gtxt);">${a.fecha}</span>
          </div>
          <h4 style="font-size:1rem; margin:0; color:var(--blanco);">${a.catEmoji} ${a.categoria} ${lugar ? `· <span style="color:var(--naranja); font-size:.85rem;">📍 ${lugar}</span>` : ''}</h4>
          <p style="font-size:.83rem; color:#c5bdb0; margin:.3rem 0; line-height:1.4;">${a.descripcion}</p>
          <div style="font-size:.78rem; color:var(--gtxt);">👤 Contacto: <strong>${a.contacto || 'Anónimo'}</strong> ${a.telefono ? `· 📞 ${a.telefono}` : ''}</div>
        </div>

        <div style="flex-shrink:0; display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
          ${a.whatsapp ? `<a href="${a.whatsapp}" target="_blank" rel="noopener" class="btn-accion btn-wasap" style="font-size:.75rem; text-decoration:none; padding:.4rem .7rem;">💬 WhatsApp</a>` : ''}
          ${(() => {
            if (a.tipo !== 'necesito') return '';
            const asig = listaAsignacionesAdmin.find(as => as.id === a.id);
            if (asig) {
              return `<button class="btn-pag" style="font-size:.75rem; padding:.4rem .7rem; border-color:var(--g3); color:var(--gtxt); cursor:default;" disabled>👤 Asignado a: ${asig.asignado_a}</button>`;
            }
            return `<button onclick="asignarCaso('${a.id}')" class="btn-pag" style="font-size:.75rem; padding:.4rem .7rem; border-color:var(--naranja); color:var(--naranja);">✋ Asignarme seguimiento</button>`;
          })()}
          <button onclick="toggleResueltoAnuncio('${a.id}')"
            class="btn-toggle-admin ${esRes ? 'btn-toggle-oculto' : 'btn-toggle-activo'}">
            ${esRes ? '👁️ Reactivar Anuncio' : '🙈 Ocultar (Marcar Resuelto)'}
          </button>
        </div>
      </div>
    `
  }).join('')
}

function setAdminTipo(tipo) {
  filtroTipoAdmin = tipo
  document.querySelectorAll('[id^="atipo-"]').forEach(btn => {
    btn.classList.toggle('activo-tipo', btn.id === `atipo-${tipo || 'todos'}`)
  })
  renderAdminList()
}

function setAdminOcultarResueltos(checked) {
  ocultarResueltosAdmin = checked
  renderAdminList()
}

// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (authToken) {
    mostrarDashboard()
  }
})


async function asignarCaso(id) {
  try {
    const res = await fetch('/api/admin/asignar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (data.ok) {
      const exists = listaAsignacionesAdmin.find(as => as.id === id);
      if (exists) {
        exists.asignado_a = data.asignado_a;
      } else {
        listaAsignacionesAdmin.push({ id, asignado_a: data.asignado_a });
      }
      renderAdminList();
    } else {
      alert('Error al asignar: ' + (data.error || 'Desconocido'));
    }
  } catch (e) {
    alert('Error de conexión');
  }
}

async function invitarAdmin() {
  const nombreInput = document.getElementById('invitar-nombre');
  const emailInput = document.getElementById('invitar-email');
  const msgEl = document.getElementById('invitar-msg');
  msgEl.style.color = 'var(--gtxt)';
  msgEl.textContent = 'Enviando invitación...';

  try {
    const res = await fetch('/api/admin/invitar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken },
      body: JSON.stringify({ email: emailInput.value.trim(), nombre: nombreInput.value.trim() })
    });
    const data = await res.json();
    if (data.ok) {
      msgEl.style.color = 'var(--verde)';
      msgEl.textContent = '✅ Invitación enviada correctamente.';
      nombreInput.value = '';
      emailInput.value = '';
    } else {
      msgEl.style.color = 'var(--rojo)';
      msgEl.textContent = '❌ Error: ' + (data.error || 'No autorizado');
    }
  } catch (e) {
    msgEl.style.color = 'var(--rojo)';
    msgEl.textContent = '❌ Error de conexión';
  }
}
