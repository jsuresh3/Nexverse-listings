import { kv } from '@vercel/kv';

const SESSION_COOKIE = 'nexverse_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const USERS_KEY = 'users';

// Both accounts share the same data (listings/checklists are stored under
// global keys, not per-user), so this is just two logins into one workspace.
const DEFAULT_USERS = {
  Nexverse: 'test1234',
  sherington: 'test1234'
};

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

export async function getUsers() {
  const stored = await kv.get(USERS_KEY);
  if (stored && typeof stored === 'object' && Object.keys(stored).length > 0) return stored;
  await kv.set(USERS_KEY, DEFAULT_USERS);
  return DEFAULT_USERS;
}

export async function validateUser(username, password) {
  const users = await getUsers();
  return Object.prototype.hasOwnProperty.call(users, username) && users[username] === password;
}

export async function setUserPassword(username, newPassword) {
  const users = await getUsers();
  if (!Object.prototype.hasOwnProperty.call(users, username)) return false;
  users[username] = newPassword;
  await kv.set(USERS_KEY, users);
  return true;
}

export { kv, SESSION_COOKIE, SESSION_TTL_SECONDS };
