import { kv, requireSession } from '../_lib.js';

export default async function handler(req, res) {
  if (!(await requireSession(req))) return res.status(401).json({ error: 'Not authenticated' });

  const { id } = req.query;

  if (req.method === 'DELETE') {
    const listings = (await kv.get('listings')) || [];
    const updated = listings.filter((l) => l.id !== id);
    await kv.set('listings', updated);
    await kv.del(`checklist:${id}`);
    return res.status(200).json({ listings: updated });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
