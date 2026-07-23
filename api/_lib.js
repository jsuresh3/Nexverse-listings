import { kv } from '@vercel/kv';

const SESSION_COOKIE = 'nexverse_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const DEFAULT_CREDENTIALS = { username: 'Nexverse', password: 'test1234' };

export function parseCookies(req) {
  const header = req.headers.cookie || '';
  return header.split(';').reduce((acc, part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return acc;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    acc[key] = decodeURIComponent(val);
    return acc;
  }, {});
}

export function setSessionCookie(res, token) {
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${SESSION_TTL_SECONDS}; SameSite=Lax; Secure`
  );
}

export function clearSessionCookie(res) {
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure`
  );
}

export async function requireSession(req) {
  const cookies = parseCookies(req);
  const token = cookies[SESSION_COOKIE];
  if (!token) return false;
  const valid = await kv.get(`session:${token}`);
  return !!valid;
}

export async function getCredentials() {
  const stored = await kv.get('credentials');
  if (stored && stored.username && stored.password) return stored;
  await kv.set('credentials', DEFAULT_CREDENTIALS);
  return DEFAULT_CREDENTIALS;
}

export async function setCredentials(username, password) {
  await kv.set('credentials', { username, password });
}

export { kv, SESSION_COOKIE, SESSION_TTL_SECONDS };
