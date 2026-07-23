import { getCredentials, setCredentials } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, newPassword } = req.body || {};
  const creds = await getCredentials();

  if (!username || username !== creds.username) {
    return res.status(400).json({ error: 'That username does not match this account.' });
  }
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }

  await setCredentials(creds.username, newPassword);
  res.status(200).json({ ok: true });
}
