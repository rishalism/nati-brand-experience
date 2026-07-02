# Backend Deployment — Render (Free Tier)

How to deploy the NATI backend (`@nati/backend`, NestJS + Prisma) to Render's
free tier. The frontend is already on Vercel at **https://www.natielectrolyte.com**.

---

## 1. Architecture

```
Browser
  │
  ├─ https://www.natielectrolyte.com        ← Frontend (Vercel, already live)
  │       │  fetch(withCredentials)          same-site cookies
  │       ▼
  └─ https://api.natielectrolyte.com  ──────► Backend (Render, this guide)
                                               │
                                               ├─► Supabase Postgres (session pooler)
                                               ├─► Cloudinary (product images)
                                               ├─► Razorpay (payments)
                                               └─► Resend (email)
```

**Why a custom `api.` subdomain (strongly recommended):** auth uses HTTP-only
cookies. `www.natielectrolyte.com` and `api.natielectrolyte.com` share the
registrable domain `natielectrolyte.com`, so they are **same-site**. The cookies
(`SameSite=Lax`, current code) are therefore sent on requests from the frontend
to the API with no code change. Using Render's default `*.onrender.com` URL
instead makes the API **cross-site**, which needs `SameSite=None` (a code change
— see [§8](#8-alternative-using-the-default-onrendercom-url)).

---

## 2. Prerequisites

- The repo is pushed to GitHub/GitLab (Render deploys from a connected repo).
- A **Render** account (free).
- The production values for: Supabase `DATABASE_URL`, JWT/cookie secrets,
  Cloudinary, Razorpay, Resend (all currently in your local `backend/.env`).
- DNS access for `natielectrolyte.com` (to add the `api.` CNAME).

> **Repo requirement (already applied):** `pnpm-workspace.yaml` includes
> `onlyBuiltDependencies` for `argon2`, `prisma`, `@prisma/client`, `esbuild`,
> `@swc/core`. Render uses standard pnpm, which blocks dependency build scripts
> by default; this list allows the native/postinstall builds those packages need.
> Without it the deploy fails at install.

---

## 3. Create the Render Web Service

Two options — the Blueprint is fastest.

### Option A — Blueprint (render.yaml)

A [`render.yaml`](../render.yaml) is included at the repo root.

1. Render Dashboard → **New → Blueprint**.
2. Select this repository. Render reads `render.yaml` and proposes the
   `nati-backend` service.
3. Fill in the **secret** env vars (marked `sync: false`) — see [§5](#5-environment-variables).
4. **Apply**. Render builds and deploys.

### Option B — Manual (Dashboard)

Render Dashboard → **New → Web Service** → connect the repo, then set:

| Setting | Value |
|---|---|
| **Root Directory** | `.` (repo root — the backend needs the `@nati/shared` workspace) |
| **Runtime** | Node |
| **Region** | Closest to Supabase (project is `ap-southeast-1` → **Singapore**) |
| **Instance Type** | **Free** |
| **Build Command** | see below |
| **Start Command** | `pnpm --filter @nati/backend start` |
| **Health Check Path** | `/api/v1/health` |
| **Auto-Deploy** | On |

**Build Command:**

```bash
corepack enable && pnpm install --frozen-lockfile && pnpm --filter @nati/shared build && pnpm --filter @nati/backend exec prisma migrate deploy && pnpm --filter @nati/backend build
```

What it does, in order:
1. `corepack enable` → makes the repo-pinned pnpm (`packageManager` field) available.
2. `pnpm install --frozen-lockfile` → installs the whole workspace.
3. Build `@nati/shared` (backend imports it).
4. `prisma migrate deploy` → applies any pending migrations to Supabase
   (idempotent; already-applied migrations are skipped).
5. Build the backend (`prisma generate` + `nest build`).

**Start Command:** `pnpm --filter @nati/backend start` runs `node dist/main.js`
with the backend as the working directory. The app binds to `0.0.0.0:$PORT`
(Render injects `PORT`).

---

## 4. Custom domain (`api.natielectrolyte.com`)

1. In the Render service → **Settings → Custom Domains → Add** `api.natielectrolyte.com`.
2. Render shows a target host (e.g. `nati-backend.onrender.com`). At your DNS
   provider add a **CNAME**: `api` → `nati-backend.onrender.com`.
3. Wait for DNS + Render's automatic TLS certificate (Let's Encrypt) to go green.

Once live, the API base URL is **https://api.natielectrolyte.com/api/v1**.

---

## 5. Environment variables

Set these on the Render service (**Environment** tab). `PORT` is **not** set
manually — Render provides it.

| Key | Value / notes |
|---|---|
| `NODE_ENV` | `production` |
| `API_PREFIX` | `api` |
| `API_VERSION` | `1` |
| `CORS_ORIGIN` | `https://www.natielectrolyte.com,https://natielectrolyte.com` |
| `WEB_URL` | `https://www.natielectrolyte.com` (email links) |
| `PUBLIC_API_URL` | `https://api.natielectrolyte.com` |
| `COOKIE_DOMAIN` | `.natielectrolyte.com` (leading dot → shared across subdomains) |
| `COOKIE_SECURE` | `true` (HTTPS only) |
| `COOKIE_SECRET` | strong random string (≥16 chars) — **secret** |
| `JWT_ACCESS_SECRET` | strong random (≥16) — **secret** |
| `JWT_ACCESS_TTL` | `15m` |
| `JWT_REFRESH_SECRET` | strong random (≥16), different from access — **secret** |
| `JWT_REFRESH_TTL` | `7d` |
| `THROTTLE_TTL` | `60` |
| `THROTTLE_LIMIT` | `100` |
| `DATABASE_URL` | Supabase **session pooler** URL — **secret** (see below) |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | from Cloudinary — **secret** |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | from Razorpay — **secret** |
| `RESEND_API_KEY` | from Resend — **secret** |
| `EMAIL_FROM` | `NATI <onboarding@resend.dev>` until a domain is verified in Resend |

Generate secrets with e.g. `openssl rand -hex 32`.

**`DATABASE_URL`** — use the Supabase **Session pooler** connection string
(Project Settings → Database → Connection string → *Session pooler*), the same
form used in dev:

```
postgresql://postgres.<ref>:<password>@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require&schema=public
```

The direct `db.<ref>.supabase.co` host is IPv6-only and not reachable — always
use the pooler. For higher concurrency you can append `&connection_limit=5`.

> The env schema is validated at boot (`backend/src/config/env.validation.ts`).
> A missing/invalid required variable makes the service fail fast with a clear
> log message rather than misbehaving at runtime.

---

## 6. Point the frontend at the API

On **Vercel** (frontend project) → Settings → Environment Variables:

```
VITE_API_URL = https://api.natielectrolyte.com/api/v1
```

Then **redeploy** the frontend (Vite inlines env vars at build time, so a rebuild
is required). The Axios client already sends `withCredentials`, so cookies flow
once the domains are same-site and CORS allows the origin.

---

## 7. Verify

After the first deploy:

```bash
# Health (should return the standard envelope with database: "up")
curl https://api.natielectrolyte.com/api/v1/health

# Public catalog
curl https://api.natielectrolyte.com/api/v1/products
```

Then in the browser on https://www.natielectrolyte.com:
1. Register / log in → confirm you land in the shop (cookie set, `/auth/me` works).
2. Add to cart → checkout (COD) → order appears under **Orders**.
3. Admin login (`admin@nati.local`) → `/admin/products` loads.

Swagger docs: `https://api.natielectrolyte.com/api/docs`.

---

## 8. Alternative: using the default `*.onrender.com` URL

If you skip the custom domain and use `https://nati-backend.onrender.com`, the
frontend↔API calls become **cross-site**, so the browser will **not** send the
`SameSite=Lax` auth cookies and login will silently fail. To support that you
must switch the cookies to cross-site mode:

- In `backend/src/modules/auth/cookies.ts`, change `sameSite: 'lax'` to
  `sameSite: 'none'` (requires `secure: true`, which you already set in prod).
- Leave `COOKIE_DOMAIN` **unset** (host-only cookie on the onrender.com host).
- `CORS_ORIGIN` stays the Vercel origin; `credentials: true` is already enabled.

The `api.` subdomain approach ([§4](#4-custom-domain-apinatielectrolytecom)) is
recommended precisely to avoid this change.

---

## 9. Free-tier caveats

- **Cold starts / spin-down.** Free services sleep after ~15 min of inactivity;
  the next request wakes them (can take 30–60s). Fine for testing, not for a busy
  store. Upgrade the instance (or add an uptime pinger) when you go live.
- **Ephemeral filesystem.** Local disk is wiped on each deploy/restart. The
  storage layer auto-selects **Cloudinary** when its keys are set — keep them set
  so uploads persist. The local-disk provider (`/uploads`) is dev-only.
- **Migrations on every deploy.** `prisma migrate deploy` runs in the build; it's
  idempotent. If a deploy fails at the migration step, the release is not promoted.
- **Supabase connection limits.** The free Supabase tier has a modest connection
  cap; the session pooler + a small Prisma `connection_limit` keeps you within it.

---

## 10. Production hardening checklist

- [ ] **Rotate every secret** that was in local `.env` / shared in chat (Supabase
      DB password, JWT/cookie secrets, Resend key). Set fresh values only in
      Render's dashboard.
- [ ] `COOKIE_SECURE=true`, HTTPS enforced (Render provides TLS).
- [ ] **Razorpay:** switch from test keys to **live** keys when taking real
      payments; verify the webhook/return flow.
- [ ] **Resend:** verify the `natielectrolyte.com` domain and set
      `EMAIL_FROM=NATI <no-reply@natielectrolyte.com>` for branded, deliverable email.
- [ ] Consider `app.set('trust proxy', 1)` in `main.ts` so client IPs (used by
      the rate limiter and refresh-token audit) are the real client, not Render's
      proxy. Behind a proxy without this, rate limiting is effectively global.
- [ ] Point a paid instance or an external cron at `/api/v1/health` to avoid cold
      starts once live.
- [ ] Move to Supabase's larger tier / AWS RDS as traffic grows — the Prisma
      schema is portable (no Supabase-specific features).

---

## 11. Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| Build fails at install with `ERR_PNPM_...IGNORED_BUILDS` | `onlyBuiltDependencies` missing from `pnpm-workspace.yaml` (it's included — ensure it was committed). |
| Boot crashes with `Invalid environment configuration` | A required env var is missing/invalid. The log lists which one. |
| `database: "down"` in `/health` | Wrong `DATABASE_URL`, or using the IPv6 `db.*.supabase.co` host — use the **session pooler** host. |
| Login works but next request is 401 | Cross-site cookies. Use the `api.` subdomain + `COOKIE_DOMAIN=.natielectrolyte.com`, or apply the `SameSite=None` change (§8). |
| CORS error in the browser console | `CORS_ORIGIN` doesn't exactly match the frontend origin (scheme + host). |
| Product image upload fails | Cloudinary keys not set → the local-disk provider is selected but the FS is ephemeral. Set `CLOUDINARY_*`. |
| First request after idle is very slow | Free-tier cold start — expected. |
