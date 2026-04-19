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

## GitHub Pages Deployment (Frontend)
This repo includes a GitHub Actions workflow to publish the `apps/frontend` build to GitHub Pages.

1. Ensure your default branch is `main` (or update `.github/workflows/deploy-pages.yml` to match).
2. In GitHub repo settings, enable **Pages** and set the source to **GitHub Actions**.
3. Push to `main` or run the workflow manually from the **Actions** tab.

The site will be published at `https://<owner>.github.io/<repo>/`.

## Project Structure
```
apps/
  backend/   # NestJS API
  frontend/  # Next.js web app
packages/    # Shared packages (if any)
```
