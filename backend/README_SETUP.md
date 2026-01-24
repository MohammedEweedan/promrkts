# Backend Local DB Setup and Seeding

This guide will help you prepare a local PostgreSQL database, set environment variables, run Prisma migrations and seed the DB with initial data.

## 1) Start a local PostgreSQL (Docker)

If you already have Postgres locally, skip to step 2. If not, run a local Postgres container:

```bash
docker run --name ldn-trade-db -e POSTGRES_PASSWORD=changeme -e POSTGRES_USER=postgres -e POSTGRES_DB=mrktspro -p 3939:5432 -d postgres:15
```

This will expose Postgres on port 3939 because the repo's `.env.example` uses 3939 by default.

## 2) Edit `.env` in `backend/`

Open `backend/.env` and ensure the `DATABASE_URL` and `DIRECT_URL` variables match your DB connection. Example:

```text
DATABASE_URL=postgresql://postgres:changeme@localhost:3939/mrktspro
DIRECT_URL=postgresql://postgres:changeme@localhost:3939/mrktspro
```

If your DB uses port 5432, update accordingly.

## 3) Install dependencies

```bash
cd backend
npm ci
```

Prisma client will be generated automatically due to `postinstall` in `package.json`.

## 4) Run Prisma Migrations (Dev)

This command creates and applies a migration based on `schema.prisma`.

```bash
npm run prisma:migrate
```

Note: If this is an existing DB with data, use migrations carefully; test on a fresh DB first.

## 5) Seed initial course data and admin

Use the seed script to add initial course tiers and admin user.

```bash
npm run seed:courses
# optionally, create a fast realistic seed for users
npm run seed:realistic
```

`seed:realistic` will also create realistic fake users (it now points to the 'fast' seed script and will create users, purchases, progress, etc.)

## 6) Quick verification

- Start the backend:

```bash
npm run dev
```

- Start the frontend (from repo root):

```bash
cd frontend
npm start
```

- Open `http://localhost:3003` and verify API calls return 200s.

## 7) Additional tools

- Prisma Studio:

```bash
npm run prisma:studio
```

- Reset fake users:

```bash
npm run reset:users
```

## 8) Notes

- The seed script is idempotent for courses and admin; it will not duplicate existing entries.
- For large seeds, adjust `NODE_OPTIONS=--max-old-space-size=4096` and `BATCH_SIZE` in seeds to avoid OOM.
- If you need to re-create DB from scratch, drop the database & rerun migrations and seeds.

---

If you’d like, I can now:
1) Add Docker Compose for a local PostgreSQL + pgAdmin + Redis stack; or
2) Run the migration + seed commands locally (if you want me to call the terminal); or
3) Add a `prisma/seed.ts` wrapper that runs the project seeding process when doing `prisma db seed`.
