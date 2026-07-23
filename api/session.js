import { requireSession } from './_lib.js';

export default async function handler(req, res) {
  const loggedIn = await requireSession(req);
  res.status(200).json({ loggedIn });
}
