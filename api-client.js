/*
  NexAPI
  Thin fetch wrapper around the /api/* serverless functions.
  Session is tracked via an HttpOnly cookie set by the server, so no
  token handling is needed here — every call just uses credentials: 'same-origin'.
*/
window.NexAPI = {
  async login(username, password) {
    const r = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async logout() {
    await fetch('/api/logout', { method: 'POST' });
  },

  async resetPassword(username, newPassword) {
    const r = await fetch('/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, newPassword })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Reset failed');
    return data;
  },

  async checkSession() {
    const r = await fetch('/api/session');
    const data = await r.json();
    return !!data.loggedIn;
  },

  async getListings() {
    const r = await fetch('/api/listings');
    if (!r.ok) throw new Error('Failed to load listings');
    return (await r.json()).listings;
  },

  async createListing(name, icon) {
    const r = await fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, icon })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Failed to create listing');
    return data.listing;
  },

  async deleteListing(id) {
    const r = await fetch(`/api/listings/${id}`, { method: 'DELETE' });
    if (!r.ok) throw new Error('Failed to delete listing');
    return (await r.json()).listings;
  },

  async getChecklist(id) {
    const r = await fetch(`/api/checklist/${id}`);
    if (!r.ok) throw new Error('Failed to load checklist');
    return (await r.json()).state;
  },

  async saveChecklist(id, state) {
    await fetch(`/api/checklist/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state)
    });
  }
};
