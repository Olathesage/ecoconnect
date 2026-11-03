# EcoConnect Ekiti (Unified Next.js Full-Stack App)

EcoConnect Ekiti is a community reporting and AI-powered triage platform for Ikole and Oye in Ekiti State.

This application is built with **Next.js 15 (App Router)**, uniting both the frontend UI and the backend API routes into a single full-stack deployable package.

## Features

- **Public Reporting**: File complaints with descriptions, landmarks, GPS locations, and photo attachments.
- **AI Triage Engine**: Gemma 4 / Gemini analysis to categorize issues (waste, drainage, road, etc.), assign severity, detect language, and draft forwarding messages.
- **Public Tracking**: Track complaints in real-time from `pending` -> `forwarded` -> `in_progress` -> `resolved`.
- **Admin Portal**: Secure PIN authentication with HMAC session cookies, complaint review dashboard, status transitions, and agency directory.
- **Single Deployment**: Frontend pages and backend APIs are co-located under `src/app/`, deployable in one single step to Vercel, Node.js, or Docker.

## Getting Started

### 1. Environment Setup

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your environment variables:
- `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`: Supabase project credentials
- `ADMIN_PIN`: Secret admin PIN (e.g. `ololadethegreat1`)
- `SESSION_SECRET`: Secret key for HMAC cookie signing
- `GEMMA_API_KEY`: Google Gemini / Gemma API key
- `GEMMA_MODEL`: `gemma-4-26b-a4b-it`

### 2. Development

Run the development server from the repository root:
```bash
pnpm dev
```
or directly inside `apps/web`:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 3. Production Build & Deployment

Build the app:
```bash
pnpm build
```

Start the production server:
```bash
pnpm start
```

### Deploying to Vercel

When deploying to Vercel:
1. Set the Root Directory to `apps/web`.
2. Add the environment variables from `.env.example`.
3. Deploy! Frontend and `/api/*` routes deploy automatically as serverless handlers.
