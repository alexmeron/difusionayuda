
const ADMIN_PASSWORD = 'R8J5WXL5 25%';

export async function onRequestPost(context) {
  try {
    const { password } = await context.request.json();
    let passDecoded = password;
    try { passDecoded = decodeURIComponent(password); } catch(e){}

    if (password === ADMIN_PASSWORD || passDecoded === ADMIN_PASSWORD || password === 'R8J5WXL5%2025%') {
      return new Response(JSON.stringify({ ok: true, token: 'admin-token' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ ok: false, error: 'Contraseña incorrecta' }), { status: 401 });
  } catch(e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 400 });
  }
}
