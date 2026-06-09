# Deployment — Sanad Admin

Static **Next.js export** (`output: "export"` → `out/`) served as plain files from
Hostinger. Two environments, **one repo, one codebase** — the only differences are
build-time environment variables injected by CI.

## Environment matrix

| | Production | Staging |
|---|---|---|
| Branch | `main` | `staging` |
| URL | https://wewill.tech/sanad-admin/ | https://wewill.tech/sanad-admin-staging/ |
| Server folder | `PROD_ADMIN_DIR` (secret) | `STAGING_ADMIN_DIR` (secret) |
| `NEXT_PUBLIC_BASE_PATH` | `/sanad-admin` | `/sanad-admin-staging` |
| `NEXT_PUBLIC_API_BASE_URL` | `https://wewill.tech/sanad-api/api` | `https://wewill.tech/sanad-api/api-staging/api` |
| Workflow | [`deploy-admin-production.yml`](.github/workflows/deploy-admin-production.yml) | [`deploy-admin-staging.yml`](.github/workflows/deploy-admin-staging.yml) |
| Pre-deploy backup | **Yes** (timestamped tar) | No |

## How it works

1. **Push triggers a build.** `push` to `staging` runs the staging workflow; `push`
   to `main` runs the production workflow (full-auto, no approval gate). Both also
   accept a manual **Run workflow** (`workflow_dispatch`) — useful for re-deploys.
2. **Env vars are injected at build time.** `NEXT_PUBLIC_*` values are *inlined* into
   the JS bundle by `next build` (frozen — changing them needs a rebuild). The
   workflow's `env:` block sets them; process env outranks any `.env` file, so CI
   always wins. No environment-specific values are hardcoded in the source.
3. **The build is verified** (asset base path + API URL present in `out/`) before any
   bytes touch the server.
4. **`out/` is rsynced** to the target folder with `--delete` (stale hashed assets are
   removed → idempotent), creating the folder if missing.
5. **The per-env `.htaccess` is placed** from [`deploy/htaccess`](deploy/htaccess) with
   `RewriteBase` substituted. It is **excluded** from the `--delete` sync and written
   separately, so the live SPA-routing file is never removed mid-deploy.

### Why the `.htaccess` is handled separately

`next build` does **not** emit `.htaccess` (it is not in `public/`). Each server folder
needs its own with the matching `RewriteBase` (`/sanad-admin/` vs `/sanad-admin-staging/`)
so deep links / refreshes fall back to `index.html`. The repo template is the source of
truth; the deploy never deletes the target's `.htaccess`.

## Required GitHub secrets

Set under **Settings → Secrets and variables → Actions** (all already configured):

`SSH_HOST`, `SSH_PORT`, `SSH_USER`, `SSH_PRIVATE_KEY`, `PROD_ADMIN_DIR`, `STAGING_ADMIN_DIR`

## Rollback (production)

Every production deploy first tars the current folder to a sibling
`sanad-admin-backups/` directory (last 5 kept). To restore the previous release:

```bash
ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST"

cd /path/to/parent-of-PROD_ADMIN_DIR        # the folder that contains sanad-admin/
ls -1t sanad-admin-backups/sanad-admin-*.tar.gz | head   # newest first; pick one

# Restore over the live folder (this is the one-step rollback):
tar -xzf sanad-admin-backups/sanad-admin-<TIMESTAMP>.tar.gz -C .
```

`tar -C .` extracts the `sanad-admin/` folder back in place, including its `.htaccess`.
To roll back code instead, revert the offending commit on `main` (re-deploys
automatically) or use **Run workflow** on an older commit.

## Local development

```bash
cp .env.example .env.local   # then set NEXT_PUBLIC_API_BASE_URL for your local API
npm install
npm run dev                  # base path empty -> served at /
```

A local production-style build:

```bash
NEXT_PUBLIC_BASE_PATH=/sanad-admin-staging \
NEXT_PUBLIC_API_BASE_URL=https://wewill.tech/sanad-api/api-staging/api \
npm run build                # outputs to out/
```

## Adding another environment

1. Create the branch and its server folder.
2. Copy a workflow, change the three `env:` values (`NEXT_PUBLIC_BASE_PATH`,
   `NEXT_PUBLIC_API_BASE_URL`, `REWRITE_BASE`), the trigger branch, the `TARGET_DIR`
   secret, and the `concurrency.group`.

No code changes are required — everything is driven by those variables.
