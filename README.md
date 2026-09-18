# AURELLE — Fine Jewellery E-Commerce

A full-stack luxury jewellery store: Next.js (App Router) storefront, PostgreSQL via
Drizzle ORM, **Razorpay** payments with server-side signature verification, and automatic
**Shiprocket** fulfilment with AWB assignment + live tracking.

## Stack

- **Next.js 16** · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion
- **PostgreSQL** + **Drizzle ORM** (products, orders, order items)
- **Razorpay** — order creation + HMAC-SHA256 payment verification
- **Shiprocket** — adhoc order creation, AWB assignment, pincode serviceability, AWB tracking

## Run locally

### 1. Prerequisites
- Node.js 20+ (`node -v`)
- PostgreSQL 14+ running locally — or Docker, or a free hosted Postgres (Neon/Supabase)

### 2. Database
Pick one:

```bash
# Option A — local PostgreSQL
createdb app_db

# Option B — Docker
docker run --name aurelle-db -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=app_db -p 5432:5432 -d postgres:16
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set `DATABASE_URL`. Razorpay / Shiprocket keys are **optional** —
without them the app runs on a clearly-labelled demo gateway and demo AWBs, so every
screen still works end-to-end.

### 4. Install, push schema, start

```bash
npm install
npx drizzle-kit push   # creates tables
npm run dev            # http://localhost:3000
```

Products auto-seed (8 pieces) on first request. Production:

```bash
npm run build && npm start
```

## Troubleshooting

### `Error: connect ECONNREFUSED 127.0.0.1:5432`
PostgreSQL isn't running on your machine (this is the most common first-run issue).
Pick ONE fix:

```bash
# Fastest — Docker (docker-compose.yml is included in the repo)
docker compose up -d

# Windows — install PostgreSQL
winget install PostgreSQL.PostgreSQL.17
createdb -U postgres app_db
# (make sure the 'postgresql-x64-17' service is started, or run:
#  net start postgresql-x64-17  as Administrator)

# Zero install — free hosted Postgres at https://neon.tech
# paste the connection string into DATABASE_URL in .env
```

Then apply the schema and restart: `npx drizzle-kit push` → `npm run dev`.

### `password authentication failed for user "postgres"`
Your local PostgreSQL password isn't `postgres`. Update `DATABASE_URL` in `.env`:
`postgresql://<user>:<yourpassword>@127.0.0.1:5432/app_db`

### `database "app_db" does not exist`
```bash
createdb app_db
```

### Neon / Supabase SSL errors
Append `?sslmode=require` to the `DATABASE_URL`.

### Port 5432 already in use
Another Postgres is already running — either use it (fix credentials in `.env`)
or change the compose port mapping to `"5433:5432"` and set
`DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5433/app_db"`.

## The order pipeline

1. `POST /api/checkout` — validates the address, **recomputes prices from the DB**,
   creates a pending order (+ Razorpay order when keys are set)
2. Customer pays in the Razorpay window (or demo gateway without keys)
3. `POST /api/checkout/verify` — verifies the Razorpay HMAC signature → marks the order
   **paid/confirmed**, decrements stock, and **books the shipment on Shiprocket**
   (adhoc order → AWB assignment → status "shipped")
4. Track anywhere: order page, `/track` (order number or AWB), or shiprocket.co
5. `/admin` — revenue, payment/fulfilment badges, one-click "Ship via Shiprocket" retry

Idempotent verification means refresh/retry never double-charges or double-ships.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Home (hero, collections, bestsellers, craft) |
| `/shop` | Catalogue with filters & sorting |
| `/product/[slug]` | Product detail + pincode delivery check |
| `/checkout` | Address → payment → confirmation |
| `/orders/[orderNumber]` | Confirmation + shipment + live timeline |
| `/track` | Track by order number or AWB |
| `/admin` | Atelier dashboard (orders, fulfilment) |
| `/api/products` · `/api/checkout` · `/api/checkout/verify` · `/api/orders…` · `/api/track/[id]` · `/api/serviceability` | JSON backend |

## Going live

Set these in `.env`, restart, and the same UI switches to real payments & real shipments:

```env
RAZORPAY_KEY_ID="rzp_live_..."
RAZORPAY_KEY_SECRET="..."
SHIPROCKET_EMAIL="api-user@yourdomain.com"
SHIPROCKET_PASSWORD="..."
SHIPROCKET_PICKUP_LOCATION="Primary"      # pickup address label in Shiprocket panel
SHIPROCKET_PICKUP_PINCODE="302001"        # your warehouse pincode
```
