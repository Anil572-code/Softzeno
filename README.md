# Softzeno POS
Full-stack point of sale system for restaurants and retail businesses.

## Tech Stack
- **Frontend:** Next.js (App Router), React, Tailwind, TanStack Query
- **Backend:** NestJS, Prisma, PostgreSQL

## Prerequisites
- Node.js 20+
- PostgreSQL 14+

## Getting Started
1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   - Backend: copy `apps/backend/.env.example` to `apps/backend/.env` and update database credentials.
   - Frontend: set `NEXT_PUBLIC_API_URL` if your API runs on a non-default host.

3. **Generate Prisma client & migrate**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. **Seed demo data**
   ```bash
   npm run prisma:seed
   ```

5. **Run the apps**
   ```bash
   npm run backend
   npm run frontend
   ```

Frontend runs on `http://localhost:3000` and the API on `http://localhost:3001/api`.

## Demo Logins (seeded)
- **Super Admin:** admin@softzeno.com / `Admin@123456`
- **Owner:** owner@demo-restaurant.com / `Owner@123456`
- **Manager:** manager@demo-restaurant.com / `Manager@123456`
- **Cashier:** cashier@demo-restaurant.com / `Cashier@123456`

## Documentation
- API Reference: `docs/API.md`

## Project Structure
```
apps/
  backend/   # NestJS API
  frontend/  # Next.js web app
packages/    # Shared packages (if any)
```
