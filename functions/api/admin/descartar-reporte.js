
const ADMIN_PASSWORD = 'R8J5WXL5 25%';

export async function onRequestPost(context) {
  try {
    const { password, id } = await context.request.json();
    let passDecoded = password;
    try { passDecoded = decodeURIComponent(password); } catch(e){}

    if (password !== ADMIN_PASSWORD && passDecoded !== ADMIN_PASSWORD && password !== 'R8J5WXL5%2025%') {
      return new Response(JSON.stringify({ ok: false, error: 'No autorizado' }), { status: 401 });
    }

    let reportes = [];
    if (context.env && context.env.RESUELTOS_KV) {
      reportes = (await context.env.RESUELTOS_KV.get('reportes_list', 'json')) || [];
      reportes = reportes.filter(r => r.id !== id);
      await context.env.RESUELTOS_KV.put('reportes_list', JSON.stringify(reportes));
    }
    return new Response(JSON.stringify({ ok: true, reportes }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch(e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 400 });
  }
}
