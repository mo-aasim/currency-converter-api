# Currency Converter API — Full-Stack App

A currency conversion application whose **backend proxies and caches** a public exchange-rate provider, adding **rate limiting** and a clean JSON contract. The React frontend offers live conversion, a multi-currency panel, copy-to-clipboard, conversion history, and a real **rate-trend chart**.

> **Stack:** React 18 + TypeScript (Vite) · Express + TypeScript · node-fetch · in-memory TTL cache · SQLite (rate history) · Zod · Tailwind CSS · Recharts

## Features
- 🌗 **Light/Dark theme** toggle (respects OS preference, persisted to `localStorage`)
- 🎬 **Framer Motion** page transitions and micro-interactions
- 🔄 **Live conversion** with debounced input and loading states
- 🌍 **160+ currencies** with flag indicators and a dedicated **browse** page
- 📊 **Multi-currency panel** — see one amount across several currencies at once
- 📈 **Rate-trend chart** backed by a real `RatePoint` table (SQLite), plus a dedicated **Trends** page
- 💾 **Saved pairs** (favorites) and **rate alerts** (target rate, persisted to `localStorage`)
- 🕘 **Conversion history** (persisted to `localStorage`)
- 📋 Copy result to clipboard, animated swap
- ⚡ Backend **TTL cache** + **rate limiting** protecting the upstream
- ✅ Zod validation, centralized error handling, integration tests

## Architecture
```
currency-converter/
├── backend/   Express + TS, cache + rate-limit  (port 4002)
│   └── /api/currencies, /api/rates/:base, /api/convert, /api/history
└── frontend/  React + TS + Vite + Tailwind + Recharts + Framer Motion (port 5175)
    ├── pages: Converter, Currencies (browse), Trends
    └── shared: ThemeProvider, motion/feedback components, Navbar, Footer
```

## Getting Started
```bash
npm install
npm run install:all
cp backend/.env.example backend/.env
npm run dev            # starts backend + frontend
```
Open **http://localhost:5175**

### Manual
```bash
# Backend
cd backend && npm install && npx prisma migrate dev && npm run dev
# Frontend
cd frontend && npm install && npm run dev
```

## API
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/currencies` | Supported currencies + flag mapping |
| GET | `/api/rates/:base` | All rates for a base currency |
| GET | `/api/convert?from=USD&to=INR&amount=10` | Convert an amount |
| GET | `/api/history?base=USD&target=INR` | Stored rate points (trend) |

> The upstream provider is configurable via `CURRENCY_API_BASE` (defaults to
> `https://open.er-api.com/v6/latest`, free, no key). Cache TTL and rate-limit
> windows are env-configurable.

## Testing
```bash
npm test
```

## Notes
- No database is required for conversion; SQLite only stores rate-history points.
- If the upstream is unreachable, the API returns a clean `502` and the UI shows an error state.
