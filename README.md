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
- `GET /super-admin/profile`
- `PATCH /super-admin/profile`
- `PATCH /super-admin/profile/password`
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
- `GET /super-admin/sms/provider-settings`
- `PUT /super-admin/sms/provider-settings`
- `POST /super-admin/sms/provider-balance`
- `POST /super-admin/sms/test-send`
- `GET /super-admin/sms/message-logs`
- `GET /super-admin/sms/overview`
- `GET /super-admin/sms/wallets`
- `GET /super-admin/sms/wallets/{wallet}`
- `PATCH /super-admin/sms/wallets/{wallet}`
- `POST /super-admin/sms/wallets/{wallet}/topup`
- `POST /super-admin/sms/wallets/bulk-topup`
- `POST /super-admin/sms/wallets/bulk-update-quota`
- `POST /super-admin/sms/wallets/bulk-toggle`
- `GET /super-admin/sms/recharge-requests`
- `POST /super-admin/sms/recharge-requests/{request}/approve`
- `POST /super-admin/sms/recharge-requests/{request}/reject`
- `GET /super-admin/sms/wallet-transactions`
- `GET /super-admin/users`
- `POST /super-admin/users`
- `GET /super-admin/users/{user}`
- `PATCH /super-admin/users/{user}`
- `PATCH /super-admin/users/{user}/password`
- `GET /super-admin/users/{user}/delete-preview`
- `DELETE /super-admin/users/{user}`
- `POST /super-admin/users/{user}/suspend`
- `POST /super-admin/users/{user}/unsuspend`
- `POST /super-admin/users/{user}/promote-to-super-admin`
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
- `/profile` current Super Admin self-profile screen for `بياناتي`, account fields, and password change
- `/dashboard` real overview KPIs, debt/payment trend, AI distribution, recent activity, platform monitoring, global search, and CSV export
- `/shops` static placeholder table
- `/users` real app user list with active/frozen status, create user, suspend, unsuspend, and details actions
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
- `/sms` dedicated SMS wallet and provider page with quota overview, global controls, wallet table, selected/all bulk top-up/quota/toggle actions, recharge request review, sent SMS history filters, then provider status/settings/test-send below the business controls

The System page includes Super Admin controls for:

- `public_registration_enabled`
- maintenance enable/disable
- Arabic maintenance title/message
- maintenance support URL
- suspended-account default title/message
- suspended-account support URL
- HotSMS provider enable/disable, auth mode, masked credentials, sender, endpoints, message type, request method, message-id flag, timeout, balance check, and one real test SMS send

HotSMS setup is available in `/system/settings` under `إعدادات الرسائل النصية`.
Credentials are entered only in password fields and left empty to keep the
current encrypted backend value. The UI shows only masked `api_token` and
`user_pass` values returned by the API. `فحص رصيد المزود` calls the backend
balance endpoint, and `إرسال رسالة تجريبية` sends a real SMS through the
configured provider after the admin clicks the button. The dedicated `/sms`
page shows provider balance only in the status card, reloads balance after a
successful send, and lists test-send history from
`/super-admin/sms/message-logs` without exposing provider secrets.

The Users list/details pages manage real app user accounts, not shop customer
records. Create user creates an active OTP-free app account with an owned shop.
The users three-dot actions menu and user details page can assign an app user
as `مشرف` through the backend promotion endpoint after the current Super Admin
password is entered; already promoted users show a disabled supervisor state.
Details support edit data, change password with the current Super Admin password,
reset operational data, and permanent delete with preview counts, current Super
Admin password, and `DELETE` confirmation. Permanent delete is separate from
`تصفير بيانات الحساب`: reset keeps the account, permanent delete removes the
account and safely owned data. Suspension supports an optional internal admin
reason and optional user-facing suspension message. If the user-facing message is
empty, the Flutter app displays the global default from System Settings.
Users list rows now show SMS available balance and SMS status. User details include
`رصيد الرسائل النصية` with remaining SMS, used SMS, monthly quota, charged balance,
total available balance, direct quota/top-up/enable-disable actions, sent message
history, wallet transaction history, and recharge requests. These controls are for
the app user / shop owner and shop, not individual shop customers.

The `/sms` page order is business-first:

1. SMS control overview cards.
2. Global controls for all/selected wallets with confirmation for all-wallet actions.
3. Wallet table for `المستخدم / صاحب المحل`, `المحل`, quota, used, remaining, charged, available, and last sent.
4. Recharge requests with approve/reject actions.
5. Sent SMS history with search/status/source filters.
6. Provider status, provider settings, real provider test-send, and latest-operation details.

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
