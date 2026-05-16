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
- `GET /super-admin/overview`

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
- `/dashboard` real overview KPI integration
- `/shops` static placeholder table
- `/users` static placeholder table
- `/customers` static placeholder table
- `/transactions` static placeholder table
- `/ai-commands` static placeholder table
- `/audit` static placeholder table
- `/system` static health placeholder

`/` redirects client-side to `/dashboard` when authenticated, otherwise `/login`.

## Project Notes

- The standalone visual reference is copied to `design/Sanad Admin Dashboard _standalone_.html`.
- Backend Laravel code is not part of this project.
- Flutter/mobile code is not part of this project.
- Future tasks should add API integrations module by module without replacing the auth/layout foundation.

## Validation Commands

```bash
npm run lint
npm run build
npm run dev
```
