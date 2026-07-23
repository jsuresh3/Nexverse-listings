import { kv, requireSession } from '../_lib.js';

const EMPTY_STATE = { meta: {}, items: {}, conditions: {}, notes: '' };

export default async function handler(req, res) {
  if (!(await requireSession(req))) return res.status(401).json({ error: 'Not authenticated' });

  const { id } = req.query;

  if (req.method === 'GET') {
    const state = (await kv.get(`checklist:${id}`)) || EMPTY_STATE;
    return res.status(200).json({ state });
  }

  if (req.method === 'PUT') {
    const state = req.body || EMPTY_STATE;
    await kv.set(`checklist:${id}`, state);
    return res.status(200).json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
