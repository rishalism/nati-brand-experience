# Deployment — Vercel (frontend) + Render (backend)

End-to-end guide for deploying NATI to production:

- **Frontend** (`@nati/frontend`, Vite + React SPA) → **Vercel**
- **Backend** (`@nati/backend`, NestJS + Prisma) → **Render**
- **Database** → Supabase Postgres (session pooler)

Both apps live in one pnpm/Turbo monorepo and share the `@nati/shared`
workspace package, so each deploy must build `@nati/shared` **before** the app.

> This is the master doc. The backend has a deeper standalone guide in
> [`DEPLOYMENT_RENDER.md`](./DEPLOYMENT_RENDER.md) (custom domain, cookies,
> free-tier caveats, hardening, troubleshooting). Read this file first.

---

## 1. Architecture

```
Browser
  │
  ├─ https://www.natielectrolyte.com        ← Frontend (Vercel)
  │       │  axios(withCredentials)          same-site cookies
  │       ▼
  └─ https://api.natielectrolyte.com  ──────► Backend (Render)
                                               │
                                               ├─► Supabase Postgres (session pooler)
                                               ├─► Cloudinary (product images)
                                               ├─► Razorpay (payments)
                                               └─► Resend (email)
```

**Why a custom `api.` subdomain matters:** auth uses HTTP-only cookies.
`www.natielectrolyte.com` and `api.natielectrolyte.com` share the registrable
domain, so they are **same-site** and the `SameSite=Lax` cookies flow with no
code change. Using Render's default `*.onrender.com` host makes calls
**cross-site** and requires a `SameSite=None` code change — see
[`DEPLOYMENT_RENDER.md` §8](./DEPLOYMENT_RENDER.md#8-alternative-using-the-default-onrendercom-url).

---

## 2. Deploy order

The frontend needs the API URL baked in at build time (Vite inlines env vars),
so deploy the backend first.

1. **Backend → Render** ([§4](#4-backend--render)). Note its public URL.
2. **Frontend → Vercel** ([§3](#3-frontend--vercel)) with `VITE_API_URL` pointing
   at that backend.
3. Set the backend's `CORS_ORIGIN` / `WEB_URL` to the Vercel URL, then verify
   ([§6](#6-verify)).

If you already have both URLs (custom domains chosen up front), order doesn't
matter — just make sure the cross-references match.

---

## 3. Frontend → Vercel

### 3.1 What Vercel builds

- Framework: **Vite** (React SPA).
- Build output: `dist/` (static files).
- Monorepo dependency: `@nati/frontend` imports runtime values from
  `@nati/shared` (Zod schemas, `ORDER_STATUS`, …), whose entry resolves to its
  built `dist/`. **`@nati/shared` must be built before the frontend build.**
- SPA routing is handled by [`frontend/vercel.json`](../frontend/vercel.json):
  serve real files first, otherwise fall back to `index.html`.

### 3.2 Project settings

Vercel Dashboard → **Add New → Project** → import this repo, then:

| Setting | Value |
|---|---|
| **Root Directory** | `frontend` |
| ↳ *Include files outside Root Directory* | **On** (needed so pnpm sees the workspace root + `@nati/shared`) |
| **Framework Preset** | Vite |
| **Install Command** | `pnpm install --frozen-lockfile` |
| **Build Command** | `pnpm --filter @nati/shared build && pnpm build` |
| **Output Directory** | `dist` |
| **Node.js Version** | 20.x (matches root `engines.node >=20`) |

Notes:

- `pnpm --filter @nati/shared build` works from the `frontend` root dir because
  pnpm walks up to the workspace root (`pnpm-workspace.yaml`) to resolve filters.
  It runs `tsup` and produces `packages/shared/dist`, which the frontend imports.
- `pnpm build` then runs `vite build` in `frontend`.
- Vercel installs the **whole** workspace (it detects `pnpm-workspace.yaml`), so
  `@nati/shared` and `@nati/frontend` are both present. `onlyBuiltDependencies`
  in `pnpm-workspace.yaml` already allow-lists `esbuild` (Vite's bundler) — no
  extra config needed.

### 3.3 Environment variables

Vercel → Project → **Settings → Environment Variables** (scope: Production, and
Preview if you use preview deploys):

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://api.natielectrolyte.com/api/v1` |

Use the real backend base URL — if you haven't set up the `api.` custom domain
yet, use the Render URL instead: `https://<service>.onrender.com/api/v1` (and
apply the cross-site cookie change from the Render doc §8).

> Vite inlines env vars **at build time**. Any change to `VITE_API_URL` requires
> a **redeploy** to take effect — editing it in the dashboard alone does nothing
> to an already-built deployment.

### 3.4 Custom domain

Vercel → **Settings → Domains → Add** `www.natielectrolyte.com` (and the apex
`natielectrolyte.com` → redirect to `www`). Follow Vercel's DNS instructions
(CNAME for `www`, A/ALIAS for the apex). TLS is automatic.

---

## 4. Backend → Render

Full detail (Blueprint vs manual, custom domain, secrets, free-tier caveats) is
in [`DEPLOYMENT_RENDER.md`](./DEPLOYMENT_RENDER.md). Summary:

### 4.1 Fastest path — Blueprint

A [`render.yaml`](../render.yaml) is committed at the repo root.

1. Render Dashboard → **New → Blueprint** → select this repo.
2. Render proposes the `nati-backend` web service (Node, free plan, Singapore,
   health check `/api/v1/health`).
3. Fill in the **secret** env vars (marked `sync: false`) — see
   [§5](#5-environment-variables).
4. **Apply.**

### 4.2 Key service settings (if creating manually)

| Setting | Value |
|---|---|
| **Root Directory** | `.` (repo root — backend needs `@nati/shared`) |
| **Runtime** | Node |
| **Instance Type** | Free |
| **Health Check Path** | `/api/v1/health` |
| **Start Command** | `pnpm --filter @nati/backend start` |

**Build Command:**

```bash
pnpm install --frozen-lockfile && \
pnpm --filter @nati/shared build && \
pnpm --filter @nati/backend exec prisma migrate deploy && \
pnpm --filter @nati/backend build
```

Order: install workspace → build `@nati/shared` → apply pending Prisma
migrations to Supabase (idempotent) → build backend (`prisma generate` +
`nest build`). `PORT` is injected by Render; the app binds `0.0.0.0:$PORT`.

> **Do not prepend `corepack enable`.** Render already provisions the pnpm
> pinned in the root `packageManager` field. Running `corepack enable` tries to
> relink `/usr/bin/pnpm` on Render's read-only filesystem and fails the build
> with `EROFS: read-only file system, unlink '/usr/bin/pnpm'`.

### 4.3 Custom domain

Add `api.natielectrolyte.com` in Render → Settings → Custom Domains, then create
the CNAME it shows at your DNS provider. API base becomes
`https://api.natielectrolyte.com/api/v1`.

---

## 5. Environment variables

### Backend (Render)

`PORT` is provided by Render — do **not** set it. Secrets (`sync: false`) go only
in the dashboard; generate with `openssl rand -hex 32`.

| Key | Value / notes |
|---|---|
| `NODE_ENV` | `production` |
| `API_PREFIX` | `api` |
| `API_VERSION` | `1` |
| `CORS_ORIGIN` | `https://www.natielectrolyte.com,https://natielectrolyte.com` |
| `WEB_URL` | `https://www.natielectrolyte.com` (email links) |
| `PUBLIC_API_URL` | `https://api.natielectrolyte.com` |
| `COOKIE_DOMAIN` | `.natielectrolyte.com` (leading dot → shared across subdomains) |
| `COOKIE_SECURE` | `true` |
| `COOKIE_SECRET` | strong random — **secret** |
| `JWT_ACCESS_SECRET` | strong random — **secret** |
| `JWT_ACCESS_TTL` | `15m` |
| `JWT_REFRESH_SECRET` | strong random, different from access — **secret** |
| `JWT_REFRESH_TTL` | `7d` |
| `THROTTLE_TTL` | `60` |
| `THROTTLE_LIMIT` | `100` |
| `DATABASE_URL` | Supabase **session pooler** URL — **secret** (see below) |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | from Cloudinary — **secret** |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | from Razorpay — **secret** |
| `RESEND_API_KEY` | from Resend — **secret** |
| `EMAIL_FROM` | `NATI <onboarding@resend.dev>` until a domain is verified in Resend |

**`DATABASE_URL`** — Supabase **Session pooler** string (Project Settings →
Database → Connection string → *Session pooler*):

```
postgresql://postgres.<ref>:<password>@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require&schema=public
```

The direct `db.<ref>.supabase.co` host is IPv6-only and unreachable from Render —
always use the pooler.

### Frontend (Vercel)

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://api.natielectrolyte.com/api/v1` |

---

## 6. Verify

```bash
# Backend health — expect the standard envelope with database: "up"
curl https://api.natielectrolyte.com/api/v1/health

# Public catalog
curl https://api.natielectrolyte.com/api/v1/products
```

Then in the browser on the Vercel site:

1. Register / log in → land in the shop (cookie set, `/auth/me` works).
2. Add to cart → checkout (COD) → order appears under **Orders**.
3. Admin login → `/admin/products` loads.

Swagger: `https://api.natielectrolyte.com/api/docs`.

---

## 7. Common issues

| Symptom | Likely cause / fix |
|---|---|
| Frontend build fails: `Cannot find module '@nati/shared'` or missing exports | `@nati/shared` not built first. Ensure the build command is `pnpm --filter @nati/shared build && pnpm build` and *Include files outside Root Directory* is **On**. |
| Frontend build fails at install (`ERR_PNPM_...IGNORED_BUILDS`) | `onlyBuiltDependencies` missing/uncommitted in `pnpm-workspace.yaml`. |
| API calls 404 or hit the wrong host | `VITE_API_URL` wrong or not redeployed. Fix var, then **redeploy** the frontend. |
| CORS error in console | `CORS_ORIGIN` (backend) must exactly match the Vercel origin (scheme + host). |
| Login works but next request is 401 | Cross-site cookies. Use the `api.` subdomain + `COOKIE_DOMAIN=.natielectrolyte.com`, or apply `SameSite=None` ([Render doc §8](./DEPLOYMENT_RENDER.md#8-alternative-using-the-default-onrendercom-url)). |
| SPA route 404s on refresh | `frontend/vercel.json` rewrite missing/not picked up — confirm Root Directory is `frontend`. |
| Backend build fails: `EROFS: read-only file system, unlink '/usr/bin/pnpm'` | `corepack enable` in the build command — remove it. Render already provides the pinned pnpm. |
| Backend `database: "down"` | Wrong `DATABASE_URL` or IPv6 direct host — use the Supabase **session pooler**. |
| First request after idle is slow | Render free-tier cold start (~30–60s). Expected; add a pinger or upgrade for production. |

For deeper backend topics see [`DEPLOYMENT_RENDER.md`](./DEPLOYMENT_RENDER.md).
