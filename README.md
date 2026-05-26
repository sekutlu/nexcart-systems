# NexCart Systems

A simple full-stack e-commerce foundation with:

- Next.js web app and REST API routes
- Expo React Native mobile app consuming the same API
- MySQL database via Prisma ORM
- JWT authentication
- Product, cart, order, and admin module skeletons
- Vercel-ready web deployment structure

## Structure

```text
apps/
  web/       Next.js web frontend, REST API, Prisma schema
  mobile/    Expo React Native app
packages/
  shared/    Shared API client and TypeScript types
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp apps/web/.env.example apps/web/.env
```

3. Configure `DATABASE_URL`, `JWT_SECRET`, and public API URLs.

4. Generate Prisma client and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

5. Start web/API:

```bash
npm run dev:web
```

6. Start mobile:

```bash
npm run dev:mobile
```

The mobile app should point `EXPO_PUBLIC_API_URL` to the running Next.js API, for example `http://localhost:3000/api`.
