# PharmaIMS — Pharmaceutical Wholesale Inventory & Sales Management System

A web-based inventory and sales management system for **Era Med Pharmaceutical Wholesale PLC**, built with React, TypeScript, Supabase, and Turborepo.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase (PostgreSQL, Auth, RLS, Storage) |
| State (Server) | TanStack Query |
| State (Client) | Zustand |
| State Machines | XState v5 |
| Forms | React Hook Form + Zod |
| i18n | react-i18next (English / Amharic) |
| Charts | Recharts |
| PDF | @react-pdf/renderer |
| Monorepo | pnpm + Turborepo |

## Project Structure

```
pharma-ims/
├── apps/web/          # React frontend application
├── packages/shared/   # Shared types, validation, constants
├── supabase/          # Database migrations & seed data
├── tests/e2e/         # Playwright end-to-end tests
└── docs/              # User & admin manuals
```

## Prerequisites

- Node.js >= 18
- pnpm >= 11 (`npm install -g pnpm`)

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Type-check all packages
pnpm type-check

# Build all packages
pnpm build
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Database

Migrations are in `supabase/migrations/`. To apply:

```bash
pnpm db:migrate
pnpm db:types  # Regenerate TypeScript types
```

## User Roles

| Role | Description |
|---|---|
| Sales Representative | Creates orders, manages customers |
| Store Manager | Manages inventory, batches, products |
| Finance Officer | Verifies payments, generates receipts |
| Delivery Driver | Views and updates deliveries |
| Technical Manager/Owner | Full system access, reports, user mgmt |

## License

Academic project — Addis Ababa University, AAiT
