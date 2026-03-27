# Deployment Guide

## Prerequisites
- Managed PostgreSQL 15+
- Twilio account and Messaging-enabled sender
- Google Maps JavaScript API + Routes API enabled

## Steps
1. Set environment variables from `.env.example` files.
2. Run migrations: `npm run db:migrate`.
3. Seed defaults once: `npm run db:seed`.
4. Deploy API and Web containers from provided Dockerfiles.
5. Configure TLS termination and set `API_BASE_URL` to the public API URL.
6. Configure Twilio status callback URL: `<API_BASE_URL>/api/v1/webhooks/twilio/message-status`.

## Health Checks
- API: `GET /api/v1/auth/me` with valid token
- Web: `/login`
