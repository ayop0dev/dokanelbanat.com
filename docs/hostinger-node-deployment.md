# Hostinger Node.js Web App — Deployment Guide

## Build command

```
npm run build
```

Produces `dist/server/entry.mjs` (the Node.js server entrypoint) and `dist/client/` (static assets).

## Start command

```
node ./dist/server/entry.mjs
```

Configure this as the **Start command** in the Hostinger Node.js Web App panel.

## Node version

Node.js 18 LTS or 20 LTS. Set in the Hostinger runtime selector. The project requires ES modules support.

## Environment variables

Set the following in the Hostinger **Environment variables** panel — never commit real values to Git:

| Variable | Description |
|---|---|
| `WOO_BACKEND_URL` | Full HTTPS URL to the WordPress bridge, e.g. `https://blog.dokanelbanat.com/wp-json/dokanelbanat/v1` |
| `DB_BRIDGE_SECRET` | Shared secret for server-to-server authentication with the WordPress bridge |
| `PUBLIC_SITE_URL` | Canonical public URL, e.g. `https://dokanelbanat.com` |
| `HOST` | Bind address; set to `0.0.0.0` for Hostinger |
| `PORT` | Port number provided by Hostinger (usually injected automatically) |

## Temporary-domain smoke test

After deploying to Hostinger but before pointing the production domain:

1. Visit the Hostinger temporary domain (`*.hostingersite.com`).
2. Check `GET /api/health` — expect `{"ok":true,...}`.
3. Check `GET /` — expect the home page to render.
4. Check `GET /products` — expect the products listing.
5. Confirm no network requests in the browser go to `blog.dokanelbanat.com`.

## Rollback

1. In the Hostinger Git deployment panel, select the previous commit or branch and redeploy.
2. Alternatively, push a revert commit to the deployment branch.
3. The WordPress plugin is independent — rolling back Astro does not affect it.
