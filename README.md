#Pharmaceutical Wholesale Inventory & Sales Management System

A web-based inventory and sales management system for **Era Med Pharmaceutical Wholesale PLC**, built with React, TypeScript, Supabase, and Turborepo.The complete pharmaceutical inventory and sales management platform designed to help pharmacies track stock, manage sales orders, and handle customer relationships in one place. Users can add products with batch tracking (including expiry dates), create sales orders with proforma/invoice generation, manage deliveries and drivers, record payments with receipt uploads, and monitor inventory levels in real time.

The platform enforces different access levels so sales representatives can create orders and customers, while store managers and technical owners handle products, batches, and overall configuration. Built-in reporting gives insight into inventory status, sales performance, and audit logs — all accessible from anywhere through a web browser without installing any software

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
