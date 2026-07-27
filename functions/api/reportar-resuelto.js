
export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    if (context.env && context.env.RESUELTOS_KV) {
      let reportes = (await context.env.RESUELTOS_KV.get('reportes_list', 'json')) || [];
      if (!reportes.find(r => r.id === body.id)) {
        reportes.push({ ...body, fechaReporte: new Date().toISOString() });
        await context.env.RESUELTOS_KV.put('reportes_list', JSON.stringify(reportes));
      }
    }
    return new Response(JSON.stringify({ ok: true, msg: 'Reporte enviado' }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch(e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 400 });
  }
}
