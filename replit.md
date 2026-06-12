# Anima-Link

A premium mental health and cognitive companion that transforms emotional regulation into interactive missions. Five therapeutic AI characters (Sera, Kael, Nova, Zen, Arlo), CBT games, camera workspace scanning, persistent memory recall, voice transcription, safety routing, and weekly reflection reports.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env: `OPENAI_API_KEY` (optional, falls back to deterministic responses)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (port 8080, proxied at /api)
- Mobile: Expo Router 6 + React Native
- State: @tanstack/react-query + AsyncStorage
- DB: In-memory Map store with 8 seeded demo memories (no DATABASE_URL needed)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts (16 endpoints)
- `lib/api-client-react/src/generated/api.ts` — generated React Query hooks
- `lib/api-zod/src/index.ts` — MUST only export from `./generated/api` (not `./generated/types`)
- `artifacts/api-server/src/services/store.ts` — in-memory store with 8 seeded demo memories
- `artifacts/api-server/src/services/analyzer.ts` — deterministic + optional LLM analysis
- `artifacts/api-server/src/services/llm.ts` — OpenAI integration with fallback
- `artifacts/api-server/src/routes/` — all route handlers
- `artifacts/mobile/app/` — all Expo Router screens
- `artifacts/mobile/app/context/AppContext.tsx` — global state (character, analysis, userName, supportStyle)
- `artifacts/mobile/constants/colors.ts` — Anima-Link palette (warm cream, lavender, peach, sage)

## Architecture decisions

- **In-memory store first**: No DATABASE_URL required. 8 seeded demo memories enable full demo on first launch.
- **Deterministic fallback**: Analyzer uses regex-based absolutist word detection and distortion pattern matching when OPENAI_API_KEY is absent. This ensures the app works without any API keys.
- **Contract-first API**: OpenAPI spec drives both Express routes and Expo React Query hooks via Orval codegen.
- **lib/api-zod export rule**: `lib/api-zod/src/index.ts` must ONLY export from `./generated/api`, never `./generated/types` — doing otherwise causes TS2308 ambiguity errors.
- **AppContext default export**: `app/context/AppContext.tsx` needs a `export default AppProvider` — Expo Router treats all files in `app/` as routes.

## Product

**5 Characters**: Sera (Empathic Mirror), Kael (Grounding Force), Nova (CBT Challenger), Zen (Mindful Guide), Arlo (Action Motivator).

**Games**: Thought Monster Battle (CBT evidence check, 4-round HP battle vs cognitive distortions), Focus Boss Fight (goal breakdown + countdown timer + battle plan checklist), Camera Mission (workspace scan), Tiny Win (progress proof capture).

**Core Features**: Chat with MSI analysis, Memory Core (search + graph), Voice Room (transcription + route-spell), Safety Center (3-tier risk routing with crisis resources), Weekly Reflection Report.

## User preferences

_Populate as needed._

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after editing `openapi.yaml`
- `lib/api-zod/src/index.ts` must NOT export from `./generated/types` — causes TS2308
- `app/context/AppContext.tsx` needs `export default AppProvider` (Expo Router treats all files as routes)
- `useNativeDriver` warnings on web are expected (native modules not available in web bundle)
- In-memory store resets on server restart — this is intentional for the demo build

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See `lib/api-spec/openapi.yaml` for all endpoint contracts
