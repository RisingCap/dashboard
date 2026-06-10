# API — Vercel Serverless Functions

These files are **Vercel serverless functions**. Each `.js` file in `/api` becomes an
endpoint at `https://<your-domain>/api/<filename>` automatically when deployed.

They exist to keep the **SoSoValue API key off the frontend**. The browser calls our
own `/api/...` endpoints; the key is read server-side from `process.env.SOSOVALUE_API_KEY`
and never reaches the client.

## Endpoints

| File              | Endpoint            | Proxies to                                                  |
|-------------------|---------------------|-------------------------------------------------------------|
| `etf-metrics.js`  | `/api/etf-metrics`  | `…/openapi/v2/etf/currentEtfDataMetrics` (current snapshot) |
| `etf-history.js`  | `/api/etf-history`  | `…/openapi/v2/etf/historicalInflowChart` (daily history)    |

## Local development

These functions do **not** run under the plain `python -m http.server` preview.
To test them locally you need the Vercel CLI:

```bash
npm i -g vercel        # one-time install
vercel dev             # run from the project root → serves on http://localhost:3000
```

For local dev the key must also live in a local `.env` file at the project root:

```
SOSOVALUE_API_KEY=your_key_here
```

> ⚠️ **Never commit `.env`.** It is listed in `.gitignore`. In production the key is
> set in the Vercel dashboard under Project → Settings → Environment Variables.
