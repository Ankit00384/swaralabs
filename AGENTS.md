<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Guidelines

## Project Overview
- Resonance is a multi-tenant, multilingual text-to-speech app.
- Web stack: Next.js App Router + TRPC + Prisma (PostgreSQL) + Clerk org auth.
- Audio backend: `chatterbox_tts.py` on Modal using a hybrid policy (XTTS first, MMS fallback).

## Build And Validation
- Install deps: `npm install` (runs Prisma client generation via `postinstall`).
- Start dev server: `npm run dev`.
- Build production bundle: `npm run build`.
- Run linting: `npm run lint`.
- Sync OpenAPI-generated types/client changes: `npm run sync-api`.
- When `prisma/schema.prisma` changes, create/apply a migration (for example: `npx prisma migrate dev --name <change-name>`).

## Architecture Boundaries
- `src/app`: App Router pages/layouts plus API route handlers.
- `src/features/<feature>`: Feature-first domain modules (components, hooks, views, lib, data).
- `src/trpc`: RPC init, auth/org middleware, and routers.
- `src/lib`: Cross-cutting integrations (R2, chatterbox client, chunked audio helpers, env).
- Prisma client output is intentionally non-default: `src/generated/prisma`.

## Project Conventions
- For org-scoped data access/mutations, use `orgProcedure` from `src/trpc/init.ts`.
- Keep request validation in Zod schemas and enforce shared limits from `src/features/text-to-speech/data/constants.ts`.
- `generations.create` supports `clientRequestId` UUID deduplication; preserve this behavior for retried submits.
- Long generation path should keep chunking behavior aligned with constants (`TTS_LONG_PROMPT_THRESHOLD_CHARS`, `TTS_CHUNK_SIZE_CHARS`, `TTS_PREVIEW_MAX_CHUNKS`, concurrency/timeouts).
- Use language definitions from `src/lib/languages.ts` instead of hardcoding display names/locales in UI code.

## Environment And Secrets
- Required server env is validated in `src/lib/env.ts` (database, app URL, R2, and chatterbox API settings).
- Do not hardcode secrets in new code. Use environment variables and existing secret plumbing.

## Known Gotchas
- `next.config.ts` wraps Sentry only under a strict token check; do not assume source maps/uploading is always active.
- `next.config.ts` sets `experimental.proxyClientMaxBodySize` to `20mb` for large payloads.
- `README.md` is mostly create-next-app boilerplate; prefer project docs below for product/backend behavior.

## Reference Docs
- Multilingual flow and language integration notes: [MULTILINGUAL_SETUP.md](MULTILINGUAL_SETUP.md)
- Meta MMS migration context: [META_MMS_MIGRATION.md](META_MMS_MIGRATION.md)
- Keep this file minimal and link to docs instead of copying large implementation details.
