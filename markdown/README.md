# Edu Monorepo

Monorepo with `frontend/` (Next.js + TypeScript) and `backend/` (Express + TypeScript + Prisma + PostgreSQL).

## Prerequisites
- pnpm
- Node 18+
- PostgreSQL (local via Homebrew or cloud e.g., Supabase/Railway)

## Setup
1. Copy `.env.example` to `.env` in root and in each package as needed.
2. Install deps: `pnpm install`
3. Setup DB and run migrations from `backend/`: `pnpm -C backend prisma:generate && pnpm -C backend prisma:migrate`
4. Seed data: `pnpm -C backend seed`

## Scripts
- `pnpm dev`    Run frontend and backend in parallel
- `pnpm build`  Build all workspaces
- `pnpm start`  Start all workspaces
- `pnpm lint`   Lint all
- `pnpm format` Format all

## Notes
- No Docker. Backend connects directly to your Postgres.
- Payments: Stripe (real), USDT (mock NOWPayments).
- Auth: JWT with roles (admin, student).
- i18n: EN/AR/FR.
