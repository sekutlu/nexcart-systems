# NexCart Systems — Datamak Technologies

Full-stack e-commerce platform for **Software Testing & Reliability (BIST4212)**.

- Next.js 16 web app + REST API (Vercel-ready)
- Expo React Native mobile app (EAS APK build-ready)
- MySQL database via Prisma ORM
- JWT authentication with role-based access
- Products, cart, checkout (simulated payment), order tracking, admin dashboard

## Project Structure

```
apps/
  web/       Next.js frontend, REST API routes, Prisma schema
  mobile/    Expo React Native app
packages/
  shared/    Shared TypeScript types and API client
```

## Demo Accounts (after seeding)

| Role        | Email                      | Password        |
|-------------|----------------------------|-----------------|
| Admin       | admin@nexcart.com          | Admin@12345     |
| Super Admin | superadmin@nexcart.com     | Super@12345     |
| Delivery    | delivery@nexcart.com       | Delivery@12345  |
| Customer    | customer@nexcart.com       | Customer@12345  |

---

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp apps/web/.env.example apps/web/.env
```

Edit `apps/web/.env`:
```
DATABASE_URL="mysql://root:yourpassword@localhost:3306/nexcart_db"
JWT_SECRET="your-long-random-secret-min-32-chars"
```

### 3. Set up database

```bash
npm run db:generate
npm run db:migrate
npm run db:seed        # creates demo accounts
```

### 4. Start web app

```bash
npm run dev:web        # http://localhost:3000
```

### 5. Start mobile app

```bash
cp apps/mobile/.env.example apps/mobile/.env
# Edit EXPO_PUBLIC_API_URL to your local IP, e.g.:
# EXPO_PUBLIC_API_URL="http://192.168.1.x:3000/api"

npm run dev:mobile
```

Scan the QR code with **Expo Go** on your phone.

---

## Vercel Deployment (Web)

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel --cwd apps/web
```

### Option B — Vercel Dashboard

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new)
2. Set **Root Directory** to `apps/web`
3. Add environment variables:
   - `DATABASE_URL` — your TiDB / PlanetScale / Railway MySQL connection string
   - `JWT_SECRET` — any long random string
4. Deploy

The `vercel.json` at the repo root handles the monorepo build automatically.

### Recommended free MySQL hosts

- [TiDB Serverless](https://tidbcloud.com) — free tier, MySQL-compatible
- [PlanetScale](https://planetscale.com) — free tier
- [Railway](https://railway.app) — free tier

---

## APK Build (Android)

### Prerequisites

```bash
npm install -g eas-cli
eas login          # create a free account at expo.dev
```

### Build APK (preview — installable .apk file)

```bash
cd apps/mobile
eas build --platform android --profile preview
```

The build runs in the cloud. Download the `.apk` from the EAS dashboard and install on any Android device.

### Build AAB (production — Google Play)

```bash
eas build --platform android --profile production
```

### Local APK (no EAS account needed)

```bash
cd apps/mobile
npx expo run:android    # requires Android Studio + emulator
```

---

## API Endpoints

| Method | Endpoint                    | Auth     | Description              |
|--------|-----------------------------|----------|--------------------------|
| POST   | /api/auth/register          | —        | Register new user        |
| POST   | /api/auth/login             | —        | Login, returns JWT       |
| GET    | /api/products               | —        | List products (filterable)|
| GET    | /api/products/:id           | —        | Single product           |
| GET    | /api/cart                   | Customer | Get cart items           |
| POST   | /api/cart                   | Customer | Add to cart              |
| PATCH  | /api/cart                   | Customer | Update quantity          |
| DELETE | /api/cart                   | Customer | Remove item              |
| GET    | /api/orders                 | Customer | My orders                |
| POST   | /api/orders                 | Customer | Checkout (create order)  |
| PATCH  | /api/orders                 | Admin    | Update order status      |
| GET    | /api/admin/metrics          | Admin    | Dashboard metrics        |
| GET    | /api/admin/products         | Admin    | All products             |
| POST   | /api/admin/products         | Admin    | Create product           |
| PUT    | /api/admin/products/:id     | Admin    | Update product           |
| DELETE | /api/admin/products/:id     | Admin    | Delete product           |
| GET    | /api/admin/orders           | Delivery | All orders               |
| PATCH  | /api/admin/orders/:id       | Delivery | Update order status      |
| GET    | /api/admin/users            | Admin    | All users                |
| POST   | /api/admin/users            | Admin    | Create user              |
| PATCH  | /api/admin/users/:id        | Admin    | Update user              |
| DELETE | /api/admin/users/:id        | Admin    | Delete user              |

---

## Testing Tools Used

- **Postman** — API functional & integration testing
- **Selenium** — Web UI automation
- **Appium** — Mobile UI automation
- **Apache JMeter** — Performance & load testing
- **OWASP ZAP** — Security testing
- **Jira** — Bug tracking & project management
