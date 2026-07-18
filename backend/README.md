# Currency Converter API

A currency conversion REST API that **proxies and caches** a public exchange-rate
provider, adding **rate limiting** and a clean JSON contract. This avoids calling a
fragile third-party CDN directly from the browser. Built with **Express +
TypeScript**, frontend in **React + TypeScript (Vite)**.

## Features
- `GET /api/currencies` — list supported codes + flag mapping
- `GET /api/rates/:base` — all rates for a base currency
- `GET /api/convert?from=&to=&amount=` — live conversion
- **In-memory TTL cache** so the upstream isn't hammered on every request
- **Rate limiting** (express-rate-limit) to protect the upstream
- Graceful error handling for offline/unsupported upstream

## Tech Stack
| Layer | Choice |
|-------|--------|
| Frontend | React 18 + TypeScript + Vite |
| API | Express 4 + TypeScript |
| HTTP client | node-fetch |
| Caching | Custom TTL cache |
| Rate limit | express-rate-limit |
| Validation | Zod |
| Tests | Vitest + Supertest |

## Setup
```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run dev            # :4002

# Frontend
cd frontend
npm install
npm run dev            # :5175 (proxies /api -> :4002)
```

## API
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/currencies` | Supported currencies + country flags |
| GET | `/api/rates/:base` | Rates for base currency |
| GET | `/api/convert?from=USD&to=INR&amount=10` | Convert amount |

> The upstream provider is configurable via `CURRENCY_API_BASE` (defaults to
> `https://open.er-api.com/v6/latest`, free, no key). Cache TTL and rate-limit
> windows are also env-configurable.
