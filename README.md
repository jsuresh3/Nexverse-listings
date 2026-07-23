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

This now has a real backend: a handful of **Vercel Serverless Functions**
under `/api`, backed by **Vercel KV** (a free Redis-backed key/value store).
Login sessions are tracked with an `HttpOnly` cookie, so credentials never
touch the browser's storage. Data (listings, icons, checklist progress)
lives in KV, not in the browser — so it now syncs across devices and
browsers.

## Project structure

```
index.html            Login page (+ password reset)
dashboard.html         Tile list + add-listing modal
style.css              All styling
api-client.js          fetch() wrapper the front end uses to call /api/*
login.js               Login page behavior
checklist-data.js      The checklist's questions/fields (edit this to change the checklist)
dashboard.js           Tile rendering, expand/collapse, checklist logic, debounced autosave
package.json           Declares the @vercel/kv dependency
vercel.json            Hosting config
api/
  _lib.js              Shared helpers: KV client, cookies, sessions, credentials
  login.js             POST — verify credentials, start a session
  logout.js            POST — end a session
  session.js           GET  — check if the current cookie is a valid session
  reset-password.js    POST — change the stored password
  listings.js           GET/POST — list / create listings
  listings/[id].js      DELETE — remove a listing + its checklist
  checklist/[id].js     GET/PUT — read / save one listing's checklist state
```

## Deploy to Vercel

1. Push this folder to a GitHub/GitLab/Bitbucket repo.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
   Framework preset: "Other" — Vercel will run `npm install` for
   `@vercel/kv` automatically; no build command is needed.
3. **Add the database:** in your new project, go to the **Storage** tab →
   **Create Database** → choose **KV** (Upstash Redis) → **Connect** it to
   this project. Vercel automatically adds the required environment
   variables (`KV_REST_API_URL`, `KV_REST_API_TOKEN`, etc.) — you don't
   need to copy anything by hand.
4. Redeploy (Vercel usually prompts you to redeploy after connecting a new
   database so the env vars take effect).

That's it — no ORM, no schema, no separate server to run.

**CLI alternative:**
```bash
npm i -g vercel
cd nexverse-app
vercel                # first deploy
vercel env pull       # after connecting KV in the dashboard, if testing locally
vercel dev            # local dev server with the same env vars
```

### A note on the password reset

Since this is a single shared-login internal tool (not a multi-user system
with emails), "forgot password" doesn't send an email — it just asks you to
re-enter the current username to confirm it's you, then lets you set a new
password, which is saved to KV via `/api/reset-password`. If you need
real multi-user accounts or email-based recovery later, that's a bigger
change to the auth model, happy to help with that when you're ready.

## Customizing the checklist

Edit `checklist-data.js` — every section, question, dealbreaker flag, inline
field, and condition dropdown lives in that one file as plain data, so you
can add/remove/reword questions without touching the rendering logic.
