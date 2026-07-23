/*
  NexAPI
  Thin fetch wrapper around the /api/* serverless functions.
  Session is tracked via an HttpOnly cookie set by the server, so no
  token handling is needed here — every call just uses credentials: 'same-origin'.
*/
async function parseJsonSafe(r) {
  const text = await r.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    // The server returned something that isn't JSON — almost always
    // Vercel's generic error page, which means a function crashed
    // (commonly: the Redis/KV database isn't connected to this project yet).
    throw new Error(
      r.status === 404
        ? 'API route not found — check the deployment.'
        : 'Server error (status ' + r.status + '). If this just happened after deploying, ' +
          'make sure a Redis/KV database is connected in the Vercel dashboard (Storage tab).'
    );
  }
}

window.NexAPI = {
  async login(username, password) {
    const r = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await parseJsonSafe(r);
    if (!r.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async logout() {
    await fetch('/api/logout', { method: 'POST' });
  },

  async resetPassword(username, oldPassword, newPassword) {
    const r = await fetch('/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, oldPassword, newPassword })
    });
    const data = await parseJsonSafe(r);
    if (!r.ok) throw new Error(data.error || 'Reset failed');
    return data;
  },

  async checkSession() {
    const r = await fetch('/api/session');
    const data = await parseJsonSafe(r);
    return !!data.loggedIn;
  },

  async getListings() {
    const r = await fetch('/api/listings');
    const data = await parseJsonSafe(r);
    if (!r.ok) throw new Error(data.error || 'Failed to load listings');
    return data.listings;
  },

  async createListing(name, icon) {
    const r = await fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, icon })
    });
    const data = await parseJsonSafe(r);
    if (!r.ok) throw new Error(data.error || 'Failed to create listing');
    return data.listing;
  },

  async deleteListing(id) {
    const r = await fetch(`/api/listings/${id}`, { method: 'DELETE' });
    const data = await parseJsonSafe(r);
    if (!r.ok) throw new Error(data.error || 'Failed to delete listing');
    return data.listings;
  },

  async getChecklist(id) {
    const r = await fetch(`/api/checklist/${id}`);
    const data = await parseJsonSafe(r);
    if (!r.ok) throw new Error(data.error || 'Failed to load checklist');
    return data.state;
  },

  async saveChecklist(id, state) {
    await fetch(`/api/checklist/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state)
    });
  }
};
