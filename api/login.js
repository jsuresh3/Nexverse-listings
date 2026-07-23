import crypto from 'crypto';
import { kv, validateUser, setSessionCookie, SESSION_TTL_SECONDS } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const ok = await validateUser(username, password);
  if (!ok) {
    return res.status(401).json({ error: 'Incorrect username or password' });
  }

  const token = crypto.randomUUID();
  await kv.set(`session:${token}`, '1', { ex: SESSION_TTL_SECONDS });
  setSessionCookie(res, token);
  res.status(200).json({ ok: true });
}
