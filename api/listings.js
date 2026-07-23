import { kv, requireSession } from './_lib.js';

export default async function handler(req, res) {
  if (!(await requireSession(req))) return res.status(401).json({ error: 'Not authenticated' });

  if (req.method === 'GET') {
    const listings = (await kv.get('listings')) || [];
    return res.status(200).json({ listings });
  }

  if (req.method === 'POST') {
    const { name, icon } = req.body || {};
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name required' });
    }
    const listings = (await kv.get('listings')) || [];
    const listing = {
      id: `l_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim(),
      icon: icon || null,
      createdAt: Date.now()
    };
    listings.push(listing);
    await kv.set('listings', listings);
    return res.status(200).json({ listing, listings });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
