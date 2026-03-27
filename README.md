# Direct Drops - Courier Dispatch MVP

Production-oriented monorepo for a delivery-only courier operation with controller dashboard, courier PWA, admin tools, NestJS API, PostgreSQL schema/migrations, realtime sockets, and Twilio/Google integrations.

## Monorepo Structure

- `apps/web` - Next.js 16 App Router frontend (controller, courier, admin views + PWA)
- `apps/api` - NestJS 11 modular monolith API (REST + WebSockets + Swagger)
- `packages/shared` - shared enums/dto validation

## Quick Start

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
npm install
docker compose up -d
npm run db:migrate
npm run db:seed
npm run dev
```

- Web: http://localhost:3000
- API: http://localhost:3001/api/v1
- Swagger: http://localhost:3001/api/docs

Seed login accounts (password `Password123!`):
- admin / controller1 / controller2 / courier1..courier5

## Core Workflow Implemented

- Controller creates jobs (`NEW`)
- Controller assigns/reassigns active couriers (`ASSIGNED`)
- Courier transitions only their own assigned jobs (`OUT_FOR_DELIVERY`, `DELIVERED`, `FAILED`)
- Controller may cancel (`CANCELLED`)
- Failed jobs can return to `ASSIGNED`
- Job transitions validated server-side and all changes written to `job_events`

## API Endpoints

All required endpoints are implemented under `/api/v1`:
- auth, users, couriers, jobs, locations, admin settings/templates, Twilio webhook

## Realtime Events

Socket.IO gateway emits:
- `job.created`
- `job.updated`
- `job.assigned`
- `job.status_changed`
- `courier.location_updated`
- `sms.status_updated` (on callback updates)
- `admin.settings_updated`

## Google Maps / Routes

- API env vars included for Maps JavaScript API and Routes API
- Controller map page supports latest courier markers + stale marker warning
- Courier detail includes native deep-link navigation launch to Google Maps

## Twilio Messaging

- Event-based template engine (`ASSIGNED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `FAILED`)
- Template CRUD in admin
- Message SID/status persisted
- Status callback webhook updates message records
- If provider fails or is unconfigured, app keeps business flow and records warning/failure state

## Security and Ops

- Argon2 password hashing
- JWT access + refresh flow
- Role-based guards with courier-scoped job access enforcement
- Input validation pipe + throttling
- Twilio signature validation
- No secrets in repo; `.env.example` files included

## Testing

- API unit test and e2e smoke under `apps/api`
- Web vitest smoke under `apps/web`

Run:
```bash
npm run test
npm run test -w apps/api
npm run test -w apps/web
```

## Deployment Notes

1. Build images for `apps/api` and `apps/web`
2. Provision managed PostgreSQL
3. Set all env vars and secrets in deployment platform
4. Run `npm run db:migrate` and `npm run db:seed` once
5. Expose API over HTTPS and set `API_BASE_URL` to public URL for Twilio callback verification

## Environment Variables

### API (`apps/api/.env`)
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `API_BASE_URL`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`
- `GOOGLE_MAPS_API_KEY`
- `GOOGLE_ROUTES_API_KEY`

### Web (`apps/web/.env.local`)
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_WS_URL`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_GOOGLE_ROUTES_API_KEY`

## Known MVP Limitations

- Google geocoding/ETA currently stubbed to env-enabled UI surfaces; connect provider SDK for production cost controls.
- Offline queue persistence uses in-memory queue in courier sync page; replace with IndexedDB for durable offline.
- UI is intentionally pragmatic (minimal design system) but complete for required workflow screens.
