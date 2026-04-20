# Softzeno POS Frontend

Next.js dashboard for managing sales, inventory, restaurant operations, and reporting.

## Setup
```bash
cd apps/frontend
npm install
```

### Environment
Create `.env.local` (optional):
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_NAME=Softzeno POS
```

## Development
```bash
npm run dev
```
Open http://localhost:3000.

## Production Build
```bash
npm run build
npm run start
```

## Key Routes
- `/dashboard` – overview metrics
- `/pos` – POS terminal
- `/products`, `/inventory`, `/customers`
- `/orders`, `/restaurant/tables`, `/restaurant/kitchen`
- `/employees`, `/suppliers`, `/purchases`, `/expenses`
- `/reports`, `/settings`, `/branches`, `/audit`
