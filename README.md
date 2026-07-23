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
under `/api`, backed by a **Redis database** (via `@vercel/kv`, which talks
to whatever Redis-compatible store you connect through the Vercel
Marketplace — Upstash is the standard option Vercel offers today). Login
sessions are tracked with an `HttpOnly` cookie, so credentials never touch
the browser's storage. Data (listings, icons, checklist progress) lives in
Redis, not in the browser — so it now syncs across devices and browsers.

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
3. **Add the database** — note: the old "Vercel KV" product was sunset in
   Dec 2024, so this is a Marketplace step now, not a "Storage → Create →
   KV" button:
   - In your project, go to the **Storage** tab → **Marketplace Database
     Storage** (or **Browse Marketplace**) → find **Upstash** → choose the
     **Redis** product.
   - Follow the prompts to create a database and **connect it to this
     project**. Vercel automatically injects `KV_REST_API_URL` and
     `KV_REST_API_TOKEN` (the Upstash integration uses those exact names
     for backward compatibility with `@vercel/kv`, so no code changes are
     needed).
4. **Redeploy** — go to the Deployments tab and redeploy the latest
   deployment (env vars only take effect on new deployments, not
   automatically on ones already built).

That's it — no ORM, no schema, no separate server to run.

**If you still see a "not valid JSON" / server error after this:**
that means a function is crashing — almost always because the database
isn't connected to *this* deployment yet, or you redeployed before adding
it. Open the failing function's logs in the Vercel dashboard (Deployments →
your deployment → Functions) — it'll show the real error (e.g. "Missing
required environment variables KV_REST_API_URL and KV_REST_API_TOKEN" if
the database still isn't linked).

**CLI alternative:**
```bash
npm i -g vercel
cd nexverse-app
vercel                # first deploy
vercel env pull       # after connecting the database in the dashboard, if testing locally
vercel dev            # local dev server with the same env vars
```

### A note on the password reset

There are two accounts sharing this one workspace — **Nexverse** and
**sherington** — both starting with password `test1234`, both seeing the
same listings and checklists (listings/checklists are stored under global
keys, not per-user, so there's nothing to keep in sync). To reset a
password, "forgot password" now asks for that user's **current password**
first (not just the username) before letting you set a new one, and it
only changes that one account's password via `/api/reset-password`.

If you'd already deployed the earlier single-account version and used
"forgot password" there, that old password is stored under a different
key (`credentials`) and won't carry over — both accounts will start back
at `test1234` after this update. If you need more accounts later, or
truly separate (non-shared) data per user, that's a bigger change to the
data model — happy to help with that when you're ready.

## Customizing the checklist

Edit `checklist-data.js` — every section, question, dealbreaker flag, inline
field, and condition dropdown lives in that one file as plain data, so you
can add/remove/reword questions without touching the rendering logic.
