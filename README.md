# Sanad Super Admin Dashboard

Standalone Next.js frontend foundation for the Sanad platform owner / Super Admin team.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- ESLint
- Arabic RTL-first layout
- Simple API-token auth flow using `localStorage` for the local MVP

## Backend Dependency

The frontend consumes the local Laravel API only through:

```bash
http://localhost/sanad_api/public/api
```

Current integrated endpoints:

- `POST /super-admin/auth/login`
- `GET /super-admin/auth/me`
- `POST /super-admin/auth/logout`
- `GET /super-admin/overview?range=30d|90d|1y`
- `GET /super-admin/search?q=...`
- `GET /super-admin/daily-journal/overview`
- `GET /super-admin/daily-journal/entries`
- `GET /super-admin/daily-journal/entries/{entry}`
- `GET /super-admin/daily-journal/reports`
- `GET /super-admin/daily-journal/ai-drafts`
- `GET /super-admin/daily-journal/ai-drafts/{draft}`
- `GET /super-admin/system-health`
- `GET /super-admin/feature-flags`
- `PUT /super-admin/feature-flags/public_registration_enabled`
- `POST /super-admin/users/{user}/suspend`
- `POST /super-admin/users/{user}/unsuspend`
- `GET /super-admin/platform-settings`
- `PUT /super-admin/platform-settings`

## Setup

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

Open:

```bash
http://localhost:3000/login
```

## Environment

`.env.local.example`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost/sanad_api/public/api
```

No secrets are required in the frontend.

## Implemented Pages

- `/login` real Super Admin login API integration
- `/dashboard` real overview KPIs, debt/payment trend, AI distribution, recent activity, platform monitoring, global search, and CSV export
- `/shops` static placeholder table
- `/users` real app user list with active/frozen status, suspend, unsuspend, and details actions
- `/customers` static placeholder table
- `/transactions` static placeholder table
- `/ai-commands` static placeholder table
- `/daily-journal` Daily Journal overview with KPIs, totals, trend, distributions, recent entries, and recent AI drafts
- `/daily-journal/entries` Daily Journal entries list with search and filters
- `/daily-journal/entries/details?id=ID` read-only Daily Journal entry details
- `/daily-journal/reports` Daily Journal reports with period/shop/date filters
- `/daily-journal/ai` Daily Journal AI draft list with search and filters
- `/daily-journal/ai/details?id=ID` read-only Daily Journal AI draft details with JSON viewers
- `/audit` static placeholder table
- `/system` system health plus platform settings

The System page includes Super Admin controls for:

- `public_registration_enabled`
- maintenance enable/disable
- Arabic maintenance title/message
- maintenance support URL
- suspended-account default title/message
- suspended-account support URL

The Users list/details pages suspend and unsuspend real app user accounts, not
shop customer records. Suspension supports an optional internal admin reason and
an optional user-facing suspension message. If the user-facing message is empty,
the Flutter app displays the global default from System Settings.

`/` redirects client-side to `/dashboard` when authenticated, otherwise `/login`.

## Project Notes

- The standalone visual reference is copied to `design/Sanad Admin Dashboard _standalone_.html`.
- Backend Laravel code is not part of this project.
- Flutter/mobile code is not part of this project.
- Daily Journal pages depend on the Laravel Task 18.1 Super Admin Daily Journal APIs and remain read-only.
- Future tasks should add API integrations module by module without replacing the auth/layout foundation.

## Validation Commands

```bash
npm run lint
npm run build
npm run dev
```
