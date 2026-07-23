import { validateUser, setUserPassword } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, oldPassword, newPassword } = req.body || {};

  if (!username || !oldPassword) {
    return res.status(400).json({ error: 'Username and current password are required.' });
  }

  const ok = await validateUser(username, oldPassword);
  if (!ok) {
    return res.status(401).json({ error: 'Username or current password is incorrect.' });
  }
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }

  await setUserPassword(username, newPassword);
  res.status(200).json({ ok: true });
}
