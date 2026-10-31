# EcoConnect Ekiti

EcoConnect Ekiti is a starter monorepo for a mobile-first community reporting app for Ikole and Oye, Ekiti. The planned product lets residents submit a problem with text, a photo, a location and optionally a voice note; track its status; and lets admins review and route reports. The repository currently contains scaffolding, not the complete product: API, pages, database schema, examples, and docs files may be empty, and the app routes and report flows are not implemented yet.

## Workspace

```text
apps/
  web/   React, TypeScript, Vite frontend
  api/   Express, TypeScript API scaffold; Supabase and AI helpers
  docs/  API contract, AI test notes, design assets
package.json
pnpm-workspace.yaml
pnpm-lock.yaml
```

The workspace packages are `@ecoconnect/web` and `@ecoconnect/api`. Root `package.json` pins **pnpm 11.18.0**. Run commands from the repository root.

## Install and available commands

Requires Node.js and pnpm 11.18.0.

```sh
pnpm install
pnpm dev:web
pnpm dev:api
pnpm build:web
```

`dev:web` starts Vite. Its `/api` proxy targets `http://localhost:3001`. `dev:api` starts the API with `tsx watch`; the current `apps/api/server.ts` is empty, so the API is not operational yet. `build:web` builds the frontend scaffold. The root `build` script runs package build scripts, but the API currently has no TypeScript project configuration or implemented build setup; use `build:web` for the presently supported build.

## Packages

- **Web** (`apps/web`): React 19, React Router, Vite 6, TypeScript, Tailwind CSS 3. Entry files are `src/main.tsx`, `src/App.tsx`, and `src/index.css`. The seven page files are placeholders.
- **API** (`apps/api`): Express 4, Supabase JS, dotenv, cors, multer, and zod, with TypeScript and tsx for development. Routes, middleware, database schema, AI helpers and scripts are placeholders.
- **Docs** (`apps/docs`): `api-contract.md` and `ai-test-results.md` are intended documentation locations; `design/` is for design assets.

## Configuration status

The API reads its configuration from `apps/api/.env`; copy `apps/api/.env.example` and fill in the required local values. Never commit secrets. The API uses Google's `@google/genai` SDK to call Gemma 4; the model has a default, while the API key must be supplied locally.

| Variable | App | Intended purpose |
| --- | --- | --- |
| `SUPABASE_URL` | API | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | API | Server-only database key; never expose to the browser |
| `ADMIN_PIN` | API | Admin login PIN |
| `SESSION_SECRET` | API | Signs the admin session cookie |
| `GEMMA_API_KEY` | API | Google AI API key; server-side only |
| `GEMMA_MODEL` | API | Gemma model identifier (default `gemma-4-26b-a4b-it`) |
| `AI_FORCE_FAIL` | API | Exercise the planned AI fallback |
| `PORT` | API | Intended API port, default 3001 |
| `VITE_USE_MOCK` | Web | Planned mock-data switch |

The database schema is currently empty. When implemented, the plan is to apply `apps/api/db/schema.sql` in Supabase and create a `report-media` bucket.

## Product specification

The intended report analysis fields and shared values are described in the original project specification: eight categories (`waste`, `drainage`, `road`, `water`, `streetlight`, `power_outage`, `hostel_facility`, `other`), four severities (`low`, `medium`, `high`, `urgent`), four statuses (`pending`, `forwarded`, `in_progress`, `resolved`) and language codes (`en`, `yo`, `pcm`). Gemma 4 is configured to classify reports, summarize English/Yoruba/Pidgin submissions in English, flag uncertain analyses for human review and draft a professional message for an appropriate authority to forward. The app must not claim the office received a report unless that is confirmed.

Planned API endpoints and data shapes belong in [the API contract](apps/docs/api-contract.md); evaluation results belong in [AI test results](apps/docs/ai-test-results.md). Those files are placeholders and do not yet document implemented behavior.

## Changes in the pnpm migration

- Moved the React app from `frontend/` to `apps/web/` and renamed its package `@ecoconnect/web`.
- Moved the Express backend from `backend/` to `apps/api/` and named it `@ecoconnect/api`.
- Moved project docs from `docs/` to `apps/docs/` and added a docs index.
- Added root workspace configuration (`pnpm-workspace.yaml`), scripts, pnpm 11.18.0 pin and lockfile.
- Added `.gitignore` rules for environment files, dependency folders, and build output while allowing `.env.example` templates.
