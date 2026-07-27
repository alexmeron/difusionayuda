
const ADMIN_PASSWORD = 'R8J5WXL5 25%';

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const password = url.searchParams.get('password');
  let passDecoded = password;
  try { passDecoded = decodeURIComponent(password); } catch(e){}

  if (password !== ADMIN_PASSWORD && passDecoded !== ADMIN_PASSWORD && password !== 'R8J5WXL5%2025%') {
    return new Response(JSON.stringify({ ok: false, error: 'No autorizado' }), { status: 401 });
  }

  let reportes = [];
  if (context.env && context.env.RESUELTOS_KV) {
    reportes = (await context.env.RESUELTOS_KV.get('reportes_list', 'json')) || [];
  }
  return new Response(JSON.stringify(reportes), {
    headers: { 'Content-Type': 'application/json' }
  });
}
