# Nexverse Showing Checklist

A small static web app: log in, see your listings as tiles, click a tile to
expand the full showing checklist, and add new listings on the fly.

## Login

- **Username:** `Nexverse`
- **Password:** `test1234`

Use "Forgot password?" on the login page to set a new password. Since this
app has no backend server, the reset simply updates the stored credential in
your browser (localStorage, or cookies as a fallback) — enter the current
username to confirm it's you, then pick a new password.

## How data is stored

There's no database or server here — this is a static site, and Vercel's
free static hosting doesn't include persistent server-side storage out of
the box. All data (login credentials, listings, icons, and checklist
progress) is saved **in the browser**:

- Primary: `localStorage`
- Fallback: cookies, if `localStorage` is unavailable (e.g. some private
  browsing modes)

This means data persists across visits on the same browser/device, but
won't sync between devices. If you later want real cross-device sync, this
would need a small backend (e.g. a Vercel Postgres/KV database plus API
routes) — the current `NexStorage` helper in `storage.js` is written so it
can be swapped for API calls later without touching the rest of the app.

## Project structure

```
index.html          Login page (+ password reset)
dashboard.html       Tile list + add-listing modal
style.css            All styling
storage.js           localStorage-with-cookie-fallback helper
auth-core.js         Shared login/session helpers
login.js             Login page behavior
checklist-data.js    The checklist's questions/fields (edit this to change the checklist)
dashboard.js         Tile rendering, expand/collapse, checklist logic
vercel.json          Static hosting config
```

## Deploy to Vercel

**Option A — Vercel dashboard**
1. Push this folder to a GitHub/GitLab/Bitbucket repo.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Framework preset: choose "Other" (no build step needed).
4. Deploy.

**Option B — Vercel CLI**
```bash
npm i -g vercel
cd nexverse-app
vercel
```
Follow the prompts (defaults are fine — there's no build command).

## Customizing the checklist

Edit `checklist-data.js` — every section, question, dealbreaker flag, inline
field, and condition dropdown lives in that one file as plain data, so you
can add/remove/reword questions without touching the rendering logic.
