import { kv, parseCookies, clearSessionCookie, SESSION_COOKIE } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const cookies = parseCookies(req);
  const token = cookies[SESSION_COOKIE];
  if (token) await kv.del(`session:${token}`);
  clearSessionCookie(res);
  res.status(200).json({ ok: true });
}
